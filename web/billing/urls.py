from django.urls import path

from .views import (
    cancel_subscription,
    create_checkout_session,
    create_portal_session,
    reactivate_subscription,
    stripe_webhook,
    subscription_status,
)

app_name = "billing"

urlpatterns = [
    # Subscription management
    path("checkout/", create_checkout_session, name="checkout"),
    path("portal/", create_portal_session, name="portal"),
    path("status/", subscription_status, name="status"),
    path("cancel/", cancel_subscription, name="cancel"),
    path("reactivate/", reactivate_subscription, name="reactivate"),
    # Webhook
    path("webhook/", stripe_webhook, name="webhook"),
]
