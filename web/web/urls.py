import structlog
from core import views
from decouple import config
from django.contrib import admin
from django.urls import include, path
from django.views.defaults import (
    bad_request,
    page_not_found,
    permission_denied,
    server_error,
)
from spectacular import urls as spectacular_urls

logger = structlog.get_logger(__name__)

urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/healthcheck/", views.healthcheck),
    path("api/metrics/", include("metrics.urls")),
    path("api/stripe/", include("stripe.urls")),
    path("api/auth/", include("authapi.urls")),
]

if config("ENVIRONMENT") == "prod" and not config(
    "PUBLIC_API", default=False, cast=bool
):
    logger.info("Public API is disabled. Disabling API docs...")
else:
    from spectacular import urls as spectacular_urls

    logger.info("Public API is enabled. Enabling API docs...")

    urlpatterns += [
        path("api/docs/", include(spectacular_urls)),
    ]

handler400 = bad_request
handler403 = permission_denied
handler404 = page_not_found
handler500 = server_error
