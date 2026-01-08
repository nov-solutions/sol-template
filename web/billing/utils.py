from datetime import datetime, timezone

import stripe
import structlog
from django.conf import settings
from django.contrib.auth import get_user_model

from .models import StripeCustomer, Subscription

logger = structlog.get_logger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

User = get_user_model()


def get_or_create_stripe_customer(user):
    """Get or create a Stripe customer for a Django user"""
    try:
        return StripeCustomer.objects.get(user=user)
    except StripeCustomer.DoesNotExist:
        # Create customer in Stripe
        stripe_customer = stripe.Customer.create(
            email=user.email,
            metadata={
                "user_id": str(user.id),
            },
        )

        # Create customer in database
        customer = StripeCustomer.objects.create(
            user=user,
            stripe_customer_id=stripe_customer.id,
        )

        logger.info(f"Created Stripe customer {stripe_customer.id} for user {user.id}")
        return customer


def get_user_subscription_status(user):
    """Get detailed subscription status for a user"""
    try:
        customer = user.stripe_customer
        subscription = customer.active_subscription

        if subscription:
            # Get plan name from Stripe price if available
            plan_name = "Pro"  # Default
            if subscription.stripe_price_id:
                try:
                    price = stripe.Price.retrieve(
                        subscription.stripe_price_id, expand=["product"]
                    )
                    product = price.get("product", {})
                    if isinstance(product, dict):
                        plan_name = product.get("name", "Pro")
                    elif hasattr(product, "name"):
                        plan_name = product.name
                except Exception:
                    pass  # Use default plan name

            return {
                "has_active_subscription": True,
                "status": subscription.status,
                "plan_name": plan_name,
                "is_trialing": subscription.is_trialing,
                "current_period_end": subscription.current_period_end.isoformat(),
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "days_remaining": subscription.days_until_period_end,
                "stripe_price_id": subscription.stripe_price_id,
            }
    except (AttributeError, StripeCustomer.DoesNotExist):
        pass

    return {
        "has_active_subscription": False,
        "status": "none",
        "is_trialing": False,
        "current_period_end": None,
        "cancel_at_period_end": False,
        "days_remaining": 0,
        "stripe_price_id": None,
    }


def sync_subscription_from_stripe(stripe_subscription_id):
    """Sync a subscription from Stripe to our database"""
    try:
        stripe_sub = stripe.Subscription.retrieve(
            stripe_subscription_id, expand=["items.data.price"]
        )

        # Use dict access consistently for Stripe API v11+
        customer_id = stripe_sub.get("customer") or stripe_sub.customer
        customer = StripeCustomer.objects.get(stripe_customer_id=customer_id)

        # Extract price ID
        price_id = ""
        items_data = stripe_sub.get("items", {}).get("data", [])
        if items_data:
            price_id = items_data[0].get("price", {}).get("id", "")

        # Get status and other fields with fallbacks
        status = stripe_sub.get("status") or stripe_sub.status
        cancel_at_period_end = stripe_sub.get("cancel_at_period_end", False)
        current_period_end_ts = (
            stripe_sub.get("current_period_end") or stripe_sub.current_period_end
        )
        trial_end_ts = stripe_sub.get("trial_end")

        # Convert timestamps
        current_period_end = datetime.fromtimestamp(
            current_period_end_ts, tz=timezone.utc
        )
        trial_end = None
        if trial_end_ts:
            trial_end = datetime.fromtimestamp(trial_end_ts, tz=timezone.utc)

        # Update or create subscription
        subscription, created = Subscription.objects.update_or_create(
            stripe_subscription_id=stripe_subscription_id,
            defaults={
                "customer": customer,
                "stripe_price_id": price_id,
                "status": status,
                "current_period_end": current_period_end,
                "cancel_at_period_end": cancel_at_period_end,
                "trial_end": trial_end,
            },
        )

        action = "Created" if created else "Updated"
        logger.info(f"{action} subscription {stripe_subscription_id}")
        return subscription

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error syncing subscription: {str(e)}")
        raise
    except StripeCustomer.DoesNotExist:
        logger.error(f"Customer not found for subscription {stripe_subscription_id}")
        raise


def check_subscription_access(user, required_status=None):
    """
    Check if user has subscription access

    Args:
        user: Django user object
        required_status: List of acceptable statuses (default: ["active", "trialing"])

    Returns:
        bool: True if user has access, False otherwise
    """
    if required_status is None:
        required_status = ["active", "trialing"]

    try:
        customer = user.stripe_customer
        subscription = customer.active_subscription
        return subscription and subscription.status in required_status
    except (AttributeError, StripeCustomer.DoesNotExist):
        return False


def get_subscription_prices():
    """
    Get subscription prices from settings or Stripe
    Returns a list of price objects with their details
    """
    # If prices are configured in settings, use those
    if hasattr(settings, "STRIPE_PRICES"):
        return settings.STRIPE_PRICES

    # Otherwise, fetch from Stripe API (cached)
    try:
        prices = stripe.Price.list(active=True, type="recurring", limit=100)

        price_list = []
        for price in prices.data:
            price_list.append(
                {
                    "id": price.id,
                    "unit_amount": price.unit_amount,
                    "currency": price.currency,
                    "interval": price.recurring.interval,
                    "interval_count": price.recurring.interval_count,
                    "product_name": (
                        price.product.name
                        if hasattr(price.product, "name")
                        else price.product
                    ),
                }
            )

        return price_list
    except stripe.error.StripeError as e:
        logger.error(f"Error fetching prices from Stripe: {str(e)}")
        return []
