from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class RegisterViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("authapi.views.send_verification_email.delay")
    def test_register_success(self, mock_email):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new@example.com",
                "password": "securepass123",
                "password_confirm": "securepass123",
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email="new@example.com").exists())
        mock_email.assert_called_once()

    @patch("authapi.views.send_verification_email.delay")
    def test_register_logs_user_in(self, mock_email):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new@example.com",
                "password": "securepass123",
                "password_confirm": "securepass123",
            },
        )
        self.assertEqual(response.status_code, 201)
        # Session should be active — user endpoint should work
        user_response = self.client.get("/api/auth/user/")
        self.assertEqual(user_response.status_code, 200)
        self.assertEqual(user_response.data["email"], "new@example.com")

    def test_register_duplicate_email(self):
        User.objects.create_user(email="exists@example.com", password="testpass123")
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "exists@example.com",
                "password": "securepass123",
                "password_confirm": "securepass123",
            },
        )
        self.assertEqual(response.status_code, 400)

    def test_register_password_mismatch(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new@example.com",
                "password": "securepass123",
                "password_confirm": "differentpass",
            },
        )
        self.assertEqual(response.status_code, 400)

    def test_register_password_too_short(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new@example.com",
                "password": "short",
                "password_confirm": "short",
            },
        )
        self.assertEqual(response.status_code, 400)


class LoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="login@example.com", password="testpass123"
        )

    def test_login_success(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "login@example.com",
                "password": "testpass123",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["email"], "login@example.com")

    def test_login_wrong_password(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "login@example.com",
                "password": "wrongpassword",
            },
        )
        self.assertEqual(response.status_code, 401)

    def test_login_nonexistent_user(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "noone@example.com",
                "password": "testpass123",
            },
        )
        self.assertEqual(response.status_code, 401)


class LogoutViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="logout@example.com", password="testpass123"
        )

    def test_logout(self):
        self.client.force_login(self.user)
        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, 200)
        # Session should be cleared
        user_response = self.client.get("/api/auth/user/")
        self.assertEqual(user_response.status_code, 403)


class CurrentUserViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="me@example.com", password="testpass123"
        )

    def test_get_current_user_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get("/api/auth/user/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "me@example.com")
        self.assertIn("email_verified", response.data)
        self.assertIn("created_at", response.data)
        self.assertIn("days_until_deletion", response.data)

    def test_get_current_user_unauthenticated(self):
        response = self.client.get("/api/auth/user/")
        self.assertEqual(response.status_code, 403)


class ValidateSessionViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="validate@example.com", password="testpass123"
        )

    def test_valid_session(self):
        self.client.force_login(self.user)
        response = self.client.get("/api/auth/validate/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["valid"])

    def test_invalid_session(self):
        response = self.client.get("/api/auth/validate/")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["valid"])


class ChangePasswordViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="changepw@example.com", password="oldpass123!"
        )
        self.client.force_login(self.user)

    def test_change_password_success(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "oldpass123!",
                "new_password": "newpass456!",
                "new_password_confirm": "newpass456!",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpass456!"))

    def test_change_password_wrong_current(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "wrongpass",
                "new_password": "newpass456!",
                "new_password_confirm": "newpass456!",
            },
        )
        self.assertEqual(response.status_code, 400)

    def test_change_password_unauthenticated(self):
        self.client.logout()
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "oldpass123!",
                "new_password": "newpass456!",
                "new_password_confirm": "newpass456!",
            },
        )
        self.assertEqual(response.status_code, 403)


class DeleteAccountViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="delete@example.com", password="testpass123"
        )
        self.client.force_login(self.user)

    def test_delete_account_success(self):
        user_id = self.user.id
        response = self.client.post(
            "/api/auth/delete-account/",
            {
                "password": "testpass123",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(id=user_id).exists())

    def test_delete_account_wrong_password(self):
        response = self.client.post(
            "/api/auth/delete-account/",
            {
                "password": "wrongpassword",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertTrue(User.objects.filter(id=self.user.id).exists())


class ForgotPasswordViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="forgot@example.com", password="testpass123"
        )

    @patch("authapi.views.send_password_reset_email.delay")
    def test_forgot_password_existing_email(self, mock_email):
        response = self.client.post(
            "/api/auth/forgot-password/",
            {
                "email": "forgot@example.com",
            },
        )
        self.assertEqual(response.status_code, 200)
        mock_email.assert_called_once()

    @patch("authapi.views.send_password_reset_email.delay")
    def test_forgot_password_nonexistent_email_still_200(self, mock_email):
        """Should return 200 regardless to prevent email enumeration."""
        response = self.client.post(
            "/api/auth/forgot-password/",
            {
                "email": "noone@example.com",
            },
        )
        self.assertEqual(response.status_code, 200)
        mock_email.assert_not_called()


class VerifyEmailViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="unverified@example.com", password="testpass123"
        )

    def test_verify_email_success(self):
        from authapi.models import EmailVerificationToken

        token_obj = EmailVerificationToken.create_for_user(self.user)
        response = self.client.get(f"/api/auth/verify-email/{token_obj.token}/")
        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)
        self.assertIsNotNone(self.user.email_verified_at)

    def test_verify_email_invalid_token(self):
        response = self.client.get("/api/auth/verify-email/bogustoken123/")
        self.assertEqual(response.status_code, 400)

    def test_verify_email_used_token(self):
        from authapi.models import EmailVerificationToken

        token_obj = EmailVerificationToken.create_for_user(self.user)
        token_obj.used = True
        token_obj.save()

        response = self.client.get(f"/api/auth/verify-email/{token_obj.token}/")
        self.assertEqual(response.status_code, 400)


class ResetPasswordViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="reset@example.com", password="oldpass123!"
        )

    def test_reset_password_success(self):
        from authapi.models import PasswordResetToken

        token_obj = PasswordResetToken.create_for_user(self.user)
        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "token": token_obj.token,
                "password": "brandnew456!",
                "password_confirm": "brandnew456!",
            },
        )
        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("brandnew456!"))

    def test_reset_password_invalid_token(self):
        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "token": "invalidtoken",
                "password": "brandnew456!",
                "password_confirm": "brandnew456!",
            },
        )
        self.assertEqual(response.status_code, 400)

    def test_reset_password_marks_token_used(self):
        from authapi.models import PasswordResetToken

        token_obj = PasswordResetToken.create_for_user(self.user)
        self.client.post(
            "/api/auth/reset-password/",
            {
                "token": token_obj.token,
                "password": "brandnew456!",
                "password_confirm": "brandnew456!",
            },
        )

        token_obj.refresh_from_db()
        self.assertTrue(token_obj.used)

        # Second use should fail
        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "token": token_obj.token,
                "password": "anotherpass789!",
                "password_confirm": "anotherpass789!",
            },
        )
        self.assertEqual(response.status_code, 400)
