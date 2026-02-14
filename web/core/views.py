import structlog
from django.db import connections
from django.db.utils import OperationalError
from django.http import JsonResponse

logger = structlog.get_logger(__name__)


def healthcheck(request):
    """
    Health check endpoint that checks if the application is running
    and if the database connection is working.
    """
    # Check database connection
    db_conn = True
    try:
        # Test database by attempting to query
        connections["default"].cursor()
    except OperationalError:
        logger.error("Database connection error")
        db_conn = False

    status = 200 if db_conn else 503
    response_data = {
        "status": "healthy" if db_conn else "unhealthy",
        "db_connection": db_conn,
    }

    return JsonResponse(response_data, status=status)
