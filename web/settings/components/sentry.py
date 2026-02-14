import logging
import sys

import sentry_sdk
import structlog
from decouple import config
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.redis import RedisIntegration

logger = structlog.get_logger(__name__)

# Sentry Configuration
SENTRY_DSN = config("SENTRY_DSN", default="")
SENTRY_ENVIRONMENT = config(
    "SENTRY_ENVIRONMENT", default=config("ENVIRONMENT", "development")
)

# Event filtering
SENTRY_IGNORE_ERRORS = [
    "django.security.DisallowedHost",
    "django.core.exceptions.PermissionDenied",
    "django.http.Http404",
    "rest_framework.exceptions.NotFound",
    "rest_framework.exceptions.PermissionDenied",
    "rest_framework.exceptions.NotAuthenticated",
]

# URL patterns to ignore
SENTRY_IGNORE_TRANSACTIONS = [
    "/health/",
    "/healthcheck/",
    "/metrics/",
    "/readiness/",
    "/liveness/",
]

# Sensitive data patterns to scrub
SENTRY_SCRUB_DEFAULTS = True
SENTRY_SCRUB_DATA = True
SENTRY_SCRUB_FIELDS = [
    "password",
    "secret",
    "token",
    "api_key",
    "apikey",
    "access_token",
    "refresh_token",
    "private_key",
    "ssn",
    "social_security_number",
    "credit_card",
    "card_number",
    "cvv",
    "pin",
]

# Integrations configuration
sentry_logging = LoggingIntegration(
    level=logging.INFO,  # Capture all INFO-level logs and above
    event_level=logging.ERROR,  # Send only ERROR-level logs to Sentry
)

django_integration = DjangoIntegration(
    transaction_style="url",
    middleware_spans=True,
    signals_spans=True,
    cache_spans=True,
)

celery_integration = CeleryIntegration(
    monitor_beat_tasks=True,
    propagate_traces=True,
)

redis_integration = RedisIntegration()


def configure_sentry():
    """Initialize Sentry for error tracking and performance monitoring."""
    if not SENTRY_DSN:
        logger.warning("Sentry DSN not set, skipping Sentry setup.")
        return False

    try:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=SENTRY_ENVIRONMENT,
            # Integrations
            integrations=[
                django_integration,
                celery_integration,
                redis_integration,
                sentry_logging,
            ],
            _experiments={
                "continuous_profiling_auto_start": True,
            },
            ignore_errors=SENTRY_IGNORE_ERRORS,
            shutdown_timeout=10,
            include_source_context=True,
        )

        # Set user context if available
        from django.contrib.auth import get_user_model

        get_user_model()

        # Configure scope defaults
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("app", "{{PROJECT_SLUG}}")
            scope.set_context(
                "app_info",
                {
                    "environment": SENTRY_ENVIRONMENT,
                    "python_version": sys.version,
                },
            )

        return True

    except Exception as e:
        logger.error(f"Failed to configure Sentry: {str(e)}")
        return False


# Initialize Sentry
ENVIRONMENT = config("ENVIRONMENT", "dev")

if ENVIRONMENT != "dev":
    sentry_configured = configure_sentry()
else:
    logger.info(
        "Sentry initialization skipped",
        environment=ENVIRONMENT,
    )
