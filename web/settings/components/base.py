from pathlib import Path

from decouple import config

ENVIRONMENT = config("ENVIRONMENT")
SITE_BASE_DOMAIN = config("NEXT_PUBLIC_SITE_BASE_DOMAIN")
SITE_DOMAIN = config("SITE_DOMAIN")
SECRET_KEY = config("SECRET_KEY")
POSTGRES_DB = config("POSTGRES_DB")
POSTGRES_USER = config("POSTGRES_USER")
POSTGRES_PASSWORD = config("POSTGRES_PASSWORD")
BASE_DIR = BASE_DIR = Path(__file__).resolve().parent.parent.parent

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"

if ENVIRONMENT == "dev":
    DEBUG = True
elif ENVIRONMENT == "prod":
    DEBUG = False

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"

ASGI_APPLICATION = "web.asgi.application"

INSTALLED_APPS = [
    "daphne",
    "django_prometheus",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.staticfiles",
    "django.contrib.messages",
    "django.contrib.sites",
    "corsheaders",
    # drf
    "rest_framework",
    "django_extensions",
    "django_filters",
    "drf_spectacular",
    # allauth
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    # core logic
    "core.apps.CoreConfig",
    # users and auth
    "user.apps.UserConfig",
    # auth api
    "authapi.apps.AuthapiConfig",
    # automated api docs
    "spectacular.apps.SpectacularSwaggerConfig",
    # async task queueing
    "celeryapp.apps.CeleryAppConfig",
    # e-mail
    "mail.apps.MailConfig",
    # stripe payments
    "billing.apps.BillingConfig",
    # metrics and monitoring
    "metrics.apps.MetricsConfig",
]

MIDDLEWARE = [
    # django_prometheus middleware
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    # allauth middleware
    "allauth.account.middleware.AccountMiddleware",
    # django_prometheus middleware
    "django_prometheus.middleware.PrometheusAfterMiddleware",
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": POSTGRES_DB,
        "USER": POSTGRES_USER,
        "PASSWORD": POSTGRES_PASSWORD,
        "HOST": config("POSTGRES_HOST", default="postgres"),
        "PORT": 5432,
    }
}

USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Required for django-allauth
SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

ALLOWED_HOSTS = [
    "django",
    "localhost",
    SITE_DOMAIN,
    "." + SITE_DOMAIN,
    "sol-web-django",  # k8 service name
    "*.sol-web.svc.cluster.local",  # k8 internal DNS
    "*",  # catch all
]

# TODO: Update with your staging/production domains
CORS_ALLOWED_ORIGINS = [
    "http://localhost",
    SITE_BASE_DOMAIN,
    "https://dev.yourdomain.com",
]

# TODO: Update with your staging/production domains
CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
    SITE_BASE_DOMAIN,
    "https://dev.yourdomain.com",
]

ROOT_URLCONF = "web.urls"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
