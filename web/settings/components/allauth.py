import os

# Allauth account settings
# Note: INSTALLED_APPS, SITE_ID, and AUTHENTICATION_BACKENDS are in base.py
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_VERIFICATION = "optional"  # Don't block login
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = False
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None

# Google OAuth configuration
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
        "OAUTH_PKCE_ENABLED": True,
        "APPS": [
            {
                "client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
                "secret": os.environ.get("GOOGLE_CLIENT_SECRET", ""),
                "key": "",
            }
        ],
    }
}

# Redirect URLs after login/logout
LOGIN_REDIRECT_URL = "/dashboard"
ACCOUNT_LOGOUT_REDIRECT_URL = "/"

# Disable allauth's built-in forms/views - we use our own API
ACCOUNT_FORMS = {}
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True

# Custom adapters
ACCOUNT_ADAPTER = "authapi.adapters.CustomAccountAdapter"
SOCIALACCOUNT_ADAPTER = "authapi.adapters.CustomSocialAccountAdapter"
