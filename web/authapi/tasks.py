from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone

User = get_user_model()


@shared_task
def send_verification_email(user_id):
    """Send email verification link to user."""
    from .models import EmailVerificationToken

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    # Create verification token
    token_obj = EmailVerificationToken.create_for_user(user)

    # Build verification URL
    base_url = settings.SITE_BASE_DOMAIN.rstrip("/")
    verify_url = f"{base_url}/verify-email/{token_obj.token}"

    subject = "Verify your email address"
    message = f"""Hi,

Please verify your email address by clicking the link below:

{verify_url}

This link will expire in 7 days.

If you didn't create an account, you can ignore this email.

Thanks,
The Team
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


@shared_task
def send_password_reset_email(user_id):
    """Send password reset link to user."""
    from .models import PasswordResetToken

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    # Create reset token
    token_obj = PasswordResetToken.create_for_user(user)

    # Build reset URL
    base_url = settings.SITE_BASE_DOMAIN.rstrip("/")
    reset_url = f"{base_url}/reset-password/{token_obj.token}"

    subject = "Reset your password"
    message = f"""Hi,

You requested to reset your password. Click the link below to set a new password:

{reset_url}

This link will expire in 1 hour.

If you didn't request this, you can ignore this email.

Thanks,
The Team
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


@shared_task
def cleanup_unverified_accounts():
    """Delete user accounts that haven't verified their email within 7 days."""
    cutoff = timezone.now() - timezone.timedelta(days=7)

    unverified_users = User.objects.filter(
        email_verified=False,
        created_at__lt=cutoff,
    )

    count = unverified_users.count()
    unverified_users.delete()

    return f"Deleted {count} unverified accounts"
