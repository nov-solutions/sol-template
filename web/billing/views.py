import stripe
import structlog
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .utils import get_or_create_stripe_customer, get_user_subscription_status
from .webhook_handlers import webhook_handler

logger = structlog.get_logger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


@login_required
@require_POST
def create_checkout_session(request):
    """Create a Stripe Checkout session for subscription"""
    try:
        price_id = request.POST.get("price_id")
        if not price_id:
            return JsonResponse({"error": "Price ID is required"}, status=400)

        customer = get_or_create_stripe_customer(request.user)

        # Check if user already has an active subscription
        if customer.has_active_subscription:
            return JsonResponse(
                {
                    "error": "You already have an active subscription. Please manage it from the billing portal."
                },
                status=400,
            )

        # Optional: Configure trial period from settings
        trial_days = getattr(settings, "STRIPE_TRIAL_DAYS", None)

        checkout_params = {
            "customer": customer.stripe_customer_id,
            "payment_method_types": ["card"],
            "line_items": [
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            "mode": "subscription",
            "success_url": settings.STRIPE_SUCCESS_URL
            + "?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": settings.STRIPE_CANCEL_URL,
            "metadata": {
                "user_id": str(request.user.id),
            },
            # Allow promotion codes if configured
            "allow_promotion_codes": getattr(
                settings, "STRIPE_ALLOW_PROMO_CODES", False
            ),
        }

        if trial_days:
            checkout_params["subscription_data"] = {"trial_period_days": trial_days}

        checkout_session = stripe.checkout.Session.create(**checkout_params)

        return JsonResponse({"checkout_url": checkout_session.url})

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        logger.error(f"Checkout session error: {str(e)}")
        return JsonResponse({"error": "An error occurred"}, status=500)


@login_required
@require_POST
def create_portal_session(request):
    """Create a Stripe Customer Portal session for subscription management"""
    try:
        customer = request.user.stripe_customer

        # Configure portal based on subscription status
        configuration_params = {}
        if hasattr(settings, "STRIPE_PORTAL_CONFIG_ID"):
            configuration_params["configuration"] = settings.STRIPE_PORTAL_CONFIG_ID

        session = stripe.billing_portal.Session.create(
            customer=customer.stripe_customer_id,
            return_url=settings.STRIPE_PORTAL_RETURN_URL,
            **configuration_params,
        )

        return JsonResponse({"url": session.url})

    except AttributeError:
        return JsonResponse({"error": "No billing information found"}, status=404)
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        logger.error(f"Portal session error: {str(e)}")
        return JsonResponse({"error": "An error occurred"}, status=500)


@login_required
@require_GET
def subscription_status(request):
    """Get current subscription status for the user"""
    try:
        status_info = get_user_subscription_status(request.user)
        return JsonResponse(status_info)
    except Exception as e:
        logger.error(f"Error getting subscription status: {str(e)}")
        return JsonResponse(
            {
                "has_active_subscription": False,
                "status": "none",
                "error": "Could not retrieve subscription status",
            }
        )


@login_required
@require_POST
def cancel_subscription(request):
    """Cancel subscription at period end"""
    try:
        customer = request.user.stripe_customer
        subscription = customer.active_subscription

        if not subscription:
            return JsonResponse({"error": "No active subscription found"}, status=404)

        # Cancel at period end (user keeps access until end of billing period)
        stripe.Subscription.modify(
            subscription.stripe_subscription_id, cancel_at_period_end=True
        )

        subscription.cancel_at_period_end = True
        subscription.save()

        return JsonResponse(
            {
                "success": True,
                "message": f"Subscription will be canceled at the end of the current period",
                "period_end": subscription.current_period_end.isoformat(),
            }
        )

    except AttributeError:
        return JsonResponse({"error": "No billing information found"}, status=404)
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        logger.error(f"Cancel subscription error: {str(e)}")
        return JsonResponse({"error": "An error occurred"}, status=500)


@login_required
@require_POST
def reactivate_subscription(request):
    """Reactivate a canceled subscription"""
    try:
        customer = request.user.stripe_customer
        subscription = customer.active_subscription

        if not subscription or not subscription.cancel_at_period_end:
            return JsonResponse({"error": "No canceled subscription found"}, status=404)

        # Reactivate subscription
        stripe.Subscription.modify(
            subscription.stripe_subscription_id, cancel_at_period_end=False
        )

        subscription.cancel_at_period_end = False
        subscription.save()

        return JsonResponse(
            {"success": True, "message": "Subscription has been reactivated"}
        )

    except AttributeError:
        return JsonResponse({"error": "No billing information found"}, status=404)
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        logger.error(f"Reactivate subscription error: {str(e)}")
        return JsonResponse({"error": "An error occurred"}, status=500)


@csrf_exempt
@require_POST
def stripe_webhook(request):
    """Handle Stripe webhooks"""
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid webhook payload")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid webhook signature")
        return HttpResponse(status=400)

    # Handle the event
    try:
        webhook_handler(event)
        return HttpResponse(status=200)
    except Exception as e:
        logger.error(f"Webhook handler error: {str(e)}")
        return HttpResponse(status=500)
