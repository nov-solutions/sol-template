from __future__ import absolute_import, unicode_literals

import os

from celery import Celery
from celery.signals import worker_ready
from celeryapp import celery_config

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

app = Celery("web")

app.config_from_object(celery_config)


@worker_ready.connect
def setup_sentry_handlers(**kwargs):
    """Import Sentry handlers after worker is ready."""
    try:
        from django.conf import settings

        if hasattr(settings, "SENTRY_DSN") and settings.SENTRY_DSN:
            from . import sentry_handlers  # noqa: F401
    except Exception:
        pass  # Sentry handlers are optional
