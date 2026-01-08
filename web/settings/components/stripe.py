import os

# Stripe API Keys
STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

# Stripe Configuration
STRIPE_LIVE_MODE = os.environ.get("STRIPE_LIVE_MODE", "False").lower() == "true"

# Redirect URLs
SITE_BASE = os.environ.get("NEXT_PUBLIC_SITE_BASE_DOMAIN", "http://localhost")
STRIPE_SUCCESS_URL = f"{SITE_BASE}/dashboard?subscription=success"
STRIPE_CANCEL_URL = f"{SITE_BASE}/pricing?canceled=true"
STRIPE_PORTAL_RETURN_URL = f"{SITE_BASE}/dashboard/billing"

# Subscription settings
STRIPE_TRIAL_DAYS = int(os.environ.get("STRIPE_TRIAL_DAYS", "14"))

# Payment settings
STRIPE_PAYMENT_METHOD_TYPES = ["card"]
STRIPE_AUTOMATIC_TAX = os.environ.get("STRIPE_AUTOMATIC_TAX", "False").lower() == "true"
STRIPE_ALLOW_PROMO_CODES = (
    os.environ.get("STRIPE_ALLOW_PROMO_CODES", "True").lower() == "true"
)

# Customer portal configuration
STRIPE_CUSTOMER_PORTAL_ENABLED = (
    os.environ.get("STRIPE_CUSTOMER_PORTAL_ENABLED", "True").lower() == "true"
)

# Stripe CLI webhook forwarding (for development)
STRIPE_CLI_WEBHOOK_PORT = os.environ.get("STRIPE_CLI_WEBHOOK_PORT", "8000")
