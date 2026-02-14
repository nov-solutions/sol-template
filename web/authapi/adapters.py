from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter


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

        if not user.email_verified:
            user.mark_email_verified()

        return user

    def pre_social_login(self, request, sociallogin):
        """
        Called after successful social login but before the login is finalized.
        Connect social account to existing user if email matches.
        """
        if sociallogin.is_existing:
            return

        email = sociallogin.account.extra_data.get("email")
        if email:
            from django.contrib.auth import get_user_model

            User = get_user_model()
            try:
                existing_user = User.objects.get(email__iexact=email)
                sociallogin.connect(request, existing_user)

                if not existing_user.email_verified:
                    existing_user.mark_email_verified()

            except User.DoesNotExist:
                pass
