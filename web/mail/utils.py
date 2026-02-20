from django.conf import settings
from django.core.mail import send_mail


def send_verification_email(user):
    subject = "Verify your account"
    message = f"Follow this link to verify your account: {user.magic_link_url}"
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    send_mail(subject, message, from_email, recipient_list)
