import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone


class AbstractToken(models.Model):
    TOKEN_TTL_SECONDS = 3600

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="%(class)s_tokens",
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        if self.used:
            return False
        return (
            timezone.now() - self.created_at
        ).total_seconds() < self.TOKEN_TTL_SECONDS

    @classmethod
    def create_for_user(cls, user):
        return cls.objects.create(user=user, token=secrets.token_urlsafe(32))

    class Meta:
        abstract = True


class PasswordResetToken(AbstractToken):
    TOKEN_TTL_SECONDS = 3600  # 1 hour

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
    )

    def __str__(self):
        return f"PasswordResetToken for {self.user.email}"


class EmailVerificationToken(AbstractToken):
    TOKEN_TTL_SECONDS = 604800  # 7 days

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
    )

    def __str__(self):
        return f"EmailVerificationToken for {self.user.email}"
