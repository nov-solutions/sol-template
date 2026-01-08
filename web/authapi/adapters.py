from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.utils import timezone


class CustomAccountAdapter(DefaultAccountAdapter):
    """Custom adapter for regular account operations."""


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """Custom adapter for social account operations."""

    def save_user(self, request, sociallogin, form=None):
        """
        Save new user from social login.
        Mark email as verified since it's verified by the OAuth provider.
        """
        user = super().save_user(request, sociallogin, form)

        # Mark email as verified for social accounts
        # (Google has already verified the email)
        if not user.email_verified:
            user.email_verified = True
            user.email_verified_at = timezone.now()
            user.save(update_fields=["email_verified", "email_verified_at"])

        return user

    def pre_social_login(self, request, sociallogin):
        """
        Called after successful social login but before the login is finalized.
        Connect social account to existing user if email matches.
        """
        # If user is already logged in, just return
        if sociallogin.is_existing:
            return

        # If the social account's email matches an existing user, connect them
        email = sociallogin.account.extra_data.get("email")
        if email:
            from django.contrib.auth import get_user_model

            User = get_user_model()
            try:
                existing_user = User.objects.get(email__iexact=email)
                sociallogin.connect(request, existing_user)

                # Also mark email as verified
                if not existing_user.email_verified:
                    existing_user.email_verified = True
                    existing_user.email_verified_at = timezone.now()
                    existing_user.save(
                        update_fields=["email_verified", "email_verified_at"]
                    )

            except User.DoesNotExist:
                pass
