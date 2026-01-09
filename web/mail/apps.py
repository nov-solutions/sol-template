import structlog
from decouple import config
from django.apps import AppConfig

logger = structlog.get_logger(__name__)


class MailConfig(AppConfig):
    name = "mail"
    verbose_name = "e-mail functionality"

    def ready(self):

        import sys

        if "collectstatic" in sys.argv:
            return

        if config("ENVIRONMENT") == "prod":
            required_env_vars = [
                config("EMAIL_HOST", ""),
                config("EMAIL_HOST_USER", ""),
                config("EMAIL_HOST_PASSWORD", ""),
            ]
            if not all(required_env_vars):
                raise EnvironmentError(
                    f"MailConfig.ready() failed. The required environment variables are not set. "
                    f"EMAIL_HOST: {config('EMAIL_HOST', '')}, "
                    f"EMAIL_HOST_USER: {config('EMAIL_HOST_USER', '')}, "
                    f"EMAIL_HOST_PASSWORD: {'[SET]' if config('EMAIL_HOST_PASSWORD', '') else '[NOT SET]'}"
                )
        else:
            logger.warning("MailConfig.ready() running in development mode.")
