from functools import wraps

import stripe
import structlog
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect

from .utils import check_subscription_access

logger = structlog.get_logger(__name__)


def subscription_required(view_func=None, redirect_url=None, required_status=None):
    """
    Decorator to require an active subscription for access

    Usage:
        @subscription_required
        def my_view(request):
            ...

        @subscription_required(redirect_url='/pricing/')
        def my_view(request):
            ...

        @subscription_required(required_status=['active'])  # feature not available during free trial
        def my_view(request):
            ...
    """

    def decorator(view):
        @wraps(view)
        @login_required
        def wrapper(request, *args, **kwargs):
            if not check_subscription_access(request.user, required_status):
                if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    # Return JSON response for AJAX requests
                    return JsonResponse(
                        {
                            "error": "Subscription required",
                            "subscription_required": True,
                        },
                        status=403,
                    )
                else:
                    # Redirect for regular requests
                    url = redirect_url or "/pricing/"
                    return redirect(url)
            return view(request, *args, **kwargs)

        return wrapper

    if view_func is not None:
        return decorator(view_func)
    return decorator


def handle_stripe_errors(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except AttributeError:
            return JsonResponse({"error": "No billing information found"}, status=404)
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Error in {view_func.__name__}: {str(e)}")
            return JsonResponse({"error": "An error occurred"}, status=500)

    return wrapper
