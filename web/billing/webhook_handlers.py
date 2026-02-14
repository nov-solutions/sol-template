import structlog

from .models import Subscription
from .utils import sync_subscription_from_stripe

logger = structlog.get_logger(__name__)


def webhook_handler(event):
    """Subscription-focused webhook handler"""
    logger.info(f"Received webhook event: {event['type']} - {event['id']}")

    # Handle subscription lifecycle events
    subscription_events = {
        "customer.subscription.created": handle_subscription_created,
        "customer.subscription.updated": handle_subscription_updated,
        "customer.subscription.deleted": handle_subscription_deleted,
        "customer.subscription.trial_will_end": handle_subscription_trial_will_end,
        "checkout.session.completed": handle_checkout_session_completed,
        "invoice.payment_succeeded": handle_invoice_payment_succeeded,
        "invoice.payment_failed": handle_invoice_payment_failed,
    }

    handler = subscription_events.get(event["type"])
    if handler:
        handler(event)
    else:
        logger.info(f"Unhandled event type: {event['type']}")


def handle_checkout_session_completed(event):
    """Handle successful checkout - important for initial subscription creation"""
    session = event["data"]["object"]

    # Only process subscription checkouts
    if session.get("mode") != "subscription":
        return

    logger.info(f"Checkout completed for subscription: {session.get('subscription')}")

    # Sync the subscription if it was created
    if session.get("subscription"):
        try:
            sync_subscription_from_stripe(session["subscription"])
        except Exception as e:
            logger.error(f"Error syncing subscription from checkout: {str(e)}")


def handle_subscription_created(event):
    """Handle new subscription creation"""
    subscription = event["data"]["object"]

    try:
        sync_subscription_from_stripe(subscription["id"])
        logger.info(f"Subscription created: {subscription['id']}")
    except Exception as e:
        logger.error(f"Error handling subscription creation: {str(e)}")


def handle_subscription_updated(event):
    """Handle subscription updates (status changes, plan changes, etc.)"""
    subscription = event["data"]["object"]

    try:
        sync_subscription_from_stripe(subscription["id"])
        logger.info(
            f"Subscription updated: {subscription['id']} - Status: {subscription['status']}"
        )

        # Log important status changes
        if subscription["status"] == "past_due":
            logger.warning(f"Subscription {subscription['id']} is past due")
        elif subscription["status"] == "unpaid":
            logger.warning(f"Subscription {subscription['id']} is unpaid")

    except Exception as e:
        logger.error(f"Error handling subscription update: {str(e)}")


def handle_subscription_deleted(event):
    """Handle subscription cancellation/deletion"""
    subscription = event["data"]["object"]

    try:
        # Update local subscription status
        sub = Subscription.objects.filter(
            stripe_subscription_id=subscription["id"]
        ).first()

        if sub:
            sub.status = "canceled"
            sub.save()
            logger.info(f"Subscription canceled: {subscription['id']}")
        else:
            logger.warning(
                f"Subscription not found for cancellation: {subscription['id']}"
            )

    except Exception as e:
        logger.error(f"Error handling subscription deletion: {str(e)}")


def handle_subscription_trial_will_end(event):
    """Handle trial ending soon (3 days before by default)"""
    subscription = event["data"]["object"]

    logger.info(f"Trial ending soon for subscription: {subscription['id']}")

    try:
        sub = Subscription.objects.filter(
            stripe_subscription_id=subscription["id"]
        ).first()

        if sub:
            logger.info(
                f"Trial ending notification for user: {sub.customer.user.email}"
            )

    except Exception as e:
        logger.error(f"Error handling trial ending notification: {str(e)}")


def handle_invoice_payment_succeeded(event):
    """Handle successful payment - ensures subscription stays active"""
    invoice = event["data"]["object"]

    if not invoice.get("subscription"):
        return  # Not a subscription invoice

    logger.info(f"Payment succeeded for subscription: {invoice['subscription']}")

    try:
        # Sync subscription to ensure status is correct
        sync_subscription_from_stripe(invoice["subscription"])
    except Exception as e:
        logger.error(f"Error syncing subscription after payment: {str(e)}")


def handle_invoice_payment_failed(event):
    """Handle failed payment - subscription may go into past_due state"""
    invoice = event["data"]["object"]

    if not invoice.get("subscription"):
        return  # Not a subscription invoice

    logger.warning(f"Payment failed for subscription: {invoice['subscription']}")

    try:
        # Sync subscription to update status
        sync_subscription_from_stripe(invoice["subscription"])

        sub = Subscription.objects.filter(
            stripe_subscription_id=invoice["subscription"]
        ).first()

        if sub:
            logger.warning(
                f"Payment failed notification for user: {sub.customer.user.email}"
            )

    except Exception as e:
        logger.error(f"Error handling payment failure: {str(e)}")
