# Import tasks from other apps so Celery can discover them
# This is necessary because the celery worker starts with celeryapp.celery:app
# and only autodiscovers tasks in this app by default

from authapi.tasks import (  # noqa: F401
    cleanup_unverified_accounts,
    send_password_reset_email,
    send_verification_email,
)
