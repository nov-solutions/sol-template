import os

# Stripe API Keys
STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

# Redirect URLs
SITE_BASE = os.environ.get("NEXT_PUBLIC_SITE_BASE_DOMAIN", "http://localhost")
STRIPE_SUCCESS_URL = f"{SITE_BASE}/dashboard?subscription=success"
STRIPE_CANCEL_URL = f"{SITE_BASE}/pricing?canceled=true"
STRIPE_PORTAL_RETURN_URL = f"{SITE_BASE}/dashboard/billing"

# Subscription settings
STRIPE_TRIAL_DAYS = int(os.environ.get("STRIPE_TRIAL_DAYS", "14"))
STRIPE_ALLOW_PROMO_CODES = (
    os.environ.get("STRIPE_ALLOW_PROMO_CODES", "True").lower() == "true"
)
