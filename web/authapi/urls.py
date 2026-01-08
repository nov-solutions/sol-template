from django.urls import include, path

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth_register"),
    path("login/", views.LoginView.as_view(), name="auth_login"),
    path("logout/", views.LogoutView.as_view(), name="auth_logout"),
    path("user/", views.CurrentUserView.as_view(), name="auth_user"),
    path(
        "forgot-password/",
        views.ForgotPasswordView.as_view(),
        name="auth_forgot_password",
    ),
    path(
        "reset-password/", views.ResetPasswordView.as_view(), name="auth_reset_password"
    ),
    path(
        "verify-email/<str:token>/",
        views.VerifyEmailView.as_view(),
        name="auth_verify_email",
    ),
    path(
        "resend-verification/",
        views.ResendVerificationView.as_view(),
        name="auth_resend_verification",
    ),
    # Google OAuth
    path("google/login/", views.GoogleLoginView.as_view(), name="google_login"),
    path(
        "google/callback/", views.GoogleCallbackView.as_view(), name="google_callback"
    ),
    # Allauth URLs for OAuth flow
    path("google/", include("allauth.socialaccount.providers.google.urls")),
]
