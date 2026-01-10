import structlog
from decouple import config

logger = structlog.get_logger(__name__)

EMAIL_PORT = 587
# TODO: set the default from email
DEFAULT_FROM_EMAIL = "sol <thatcherthornberry@gmail.com>"

if config("ENVIRONMENT", default=False) == "prod":
    # SendGrid
    EMAIL_HOST = config("EMAIL_HOST", "")  # smtp.sendgrid.net or smtp.gmail.com
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST_USER = config("EMAIL_HOST_USER", "")  # SendGrid username or Gmail email
    EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", "")  # SG pass or Gmail app pass
    EMAIL_USE_TLS = True

else:
    logger.warning("mail module running in development mode.")
    # local file-based backend for development
    EMAIL_HOST = "localhost"
    EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
    EMAIL_FILE_PATH = "/app/mail/dummy-mail/"
    EMAIL_USE_TLS = False
