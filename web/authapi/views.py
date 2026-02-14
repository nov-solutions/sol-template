from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmailVerificationToken, PasswordResetToken


def get_client_ip(request):
    """Extract client IP address from request, handling proxy headers."""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


from .serializers import (
    ChangePasswordSerializer,
    DeleteAccountSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)
from .tasks import send_password_reset_email, send_verification_email

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        client_ip = get_client_ip(request)
        send_verification_email.delay(user.id, ip_address=client_ip)

        # Log the user in
        login(request, user, backend="django.contrib.auth.backends.ModelBackend")

        return Response(
            {
                "message": "Account created successfully. Please check your email to verify your account.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, user, backend="django.contrib.auth.backends.ModelBackend")

        return Response(
            {
                "message": "Login successful.",
                "user": UserSerializer(user).data,
            }
        )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully."})


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ValidateSessionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"valid": request.user.is_authenticated})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Verify current password
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Set new password
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        # Re-login to update session
        login(request, user, backend="django.contrib.auth.backends.ModelBackend")

        return Response({"message": "Password changed successfully."})


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DeleteAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Verify password
        if not user.check_password(serializer.validated_data["password"]):
            return Response(
                {"error": "Password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Logout and delete
        logout(request)
        user.delete()

        return Response({"message": "Account deleted successfully."})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        # Always return success to prevent email enumeration
        try:
            user = User.objects.get(email__iexact=email)
            send_password_reset_email.delay(user.id)
        except User.DoesNotExist:
            pass

        return Response(
            {
                "message": "If an account with that email exists, you will receive a password reset link."
            }
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token_obj = PasswordResetToken.objects.get(
                token=serializer.validated_data["token"]
            )
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"error": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not token_obj.is_valid():
            return Response(
                {"error": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update password
        user = token_obj.user
        user.set_password(serializer.validated_data["password"])
        user.save()

        # Mark token as used
        token_obj.used = True
        token_obj.save()

        return Response({"message": "Password reset successfully. You can now log in."})


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            token_obj = EmailVerificationToken.objects.get(token=token)
        except EmailVerificationToken.DoesNotExist:
            return Response(
                {"error": "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not token_obj.is_valid():
            return Response(
                {"error": "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark email as verified
        user = token_obj.user
        user.mark_email_verified()

        # Mark token as used
        token_obj.used = True
        token_obj.save()

        return Response({"message": "Email verified successfully."})


class ResendVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.email_verified:
            return Response(
                {"message": "Your email is already verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_ip = get_client_ip(request)
        send_verification_email.delay(user.id, ip_address=client_ip)

        return Response({"message": "Verification email sent."})


class GoogleLoginView(APIView):
    """Redirect to Google OAuth login."""

    permission_classes = [AllowAny]

    def get(self, request):
        return redirect("/api/auth/google/google/login/")


class GoogleCallbackView(APIView):
    """Handle Google OAuth callback."""

    permission_classes = [AllowAny]

    def get(self, request):
        # After allauth processes the callback, the user will be logged in
        # Redirect to the frontend dashboard
        if request.user.is_authenticated:
            return redirect(settings.LOGIN_REDIRECT_URL)
        else:
            # If authentication failed, redirect to login with error
            return redirect("/login?error=google_auth_failed")
