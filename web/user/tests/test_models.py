from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user_with_email(self):
        user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("testpass123"))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_user_normalizes_email(self):
        user = User.objects.create_user(
            email="test@EXAMPLE.COM", password="testpass123"
        )
        self.assertEqual(user.email, "test@example.com")

    def test_create_user_without_email_raises(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", password="testpass123")

    def test_create_user_without_password(self):
        user = User.objects.create_user(email="oauth@example.com")
        self.assertFalse(user.has_usable_password())

    def test_create_superuser(self):
        user = User.objects.create_superuser(
            email="admin@example.com", password="adminpass123"
        )
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_email_is_username_field(self):
        self.assertEqual(User.USERNAME_FIELD, "email")

    def test_email_unique(self):
        User.objects.create_user(email="dupe@example.com", password="testpass123")
        with self.assertRaises(Exception):
            User.objects.create_user(email="dupe@example.com", password="otherpass123")

    def test_default_field_values(self):
        user = User.objects.create_user(
            email="defaults@example.com", password="testpass123"
        )
        self.assertFalse(user.email_verified)
        self.assertIsNone(user.email_verified_at)
        self.assertIsNotNone(user.created_at)

    def test_mark_email_verified(self):
        user = User.objects.create_user(
            email="verify@example.com", password="testpass123"
        )
        self.assertFalse(user.email_verified)
        self.assertIsNone(user.email_verified_at)

        user.mark_email_verified()
        user.refresh_from_db()

        self.assertTrue(user.email_verified)
        self.assertIsNotNone(user.email_verified_at)
        self.assertAlmostEqual(
            user.email_verified_at.timestamp(),
            timezone.now().timestamp(),
            delta=5,
        )

    def test_mark_email_verified_idempotent(self):
        user = User.objects.create_user(
            email="verify2@example.com", password="testpass123"
        )
        user.mark_email_verified()
        first_verified_at = user.email_verified_at

        user.mark_email_verified()
        user.refresh_from_db()

        self.assertTrue(user.email_verified)
        # Timestamp gets updated on second call
        self.assertGreaterEqual(user.email_verified_at, first_verified_at)

    def test_groups_and_permissions_disabled(self):
        self.assertIsNone(User.groups)
        self.assertIsNone(User.user_permissions)
