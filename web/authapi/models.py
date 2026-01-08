import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone


class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        """Token is valid for 1 hour and hasn't been used."""
        if self.used:
            return False
        age = timezone.now() - self.created_at
        return age.total_seconds() < 3600  # 1 hour

    @classmethod
    def create_for_user(cls, user):
        """Create a new password reset token for a user."""
        token = secrets.token_urlsafe(32)
        return cls.objects.create(user=user, token=token)

    def __str__(self):
        return f"PasswordResetToken for {self.user.email}"


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        """Token is valid for 7 days and hasn't been used."""
        if self.used:
            return False
        age = timezone.now() - self.created_at
        return age.total_seconds() < 604800  # 7 days

    @classmethod
    def create_for_user(cls, user):
        """Create a new email verification token for a user."""
        token = secrets.token_urlsafe(32)
        return cls.objects.create(user=user, token=token)

    def __str__(self):
        return f"EmailVerificationToken for {self.user.email}"
