from django.conf import settings
from django.db import models
from django.utils import timezone


class StripeCustomer(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stripe_customer",
    )
    stripe_customer_id = models.CharField(max_length=255, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.stripe_customer_id}"

    @property
    def has_active_subscription(self):
        """Check if customer has any active subscription"""
        return self.subscriptions.filter(status__in=["active", "trialing"]).exists()

    @property
    def active_subscription(self):
        """Get the current active subscription (if any)"""
        return self.subscriptions.filter(status__in=["active", "trialing"]).first()


class Subscription(models.Model):
    STATUS_CHOICES = [
        ("trialing", "Trialing"),
        ("active", "Active"),
        ("past_due", "Past Due"),
        ("canceled", "Canceled"),
        ("unpaid", "Unpaid"),
    ]

    customer = models.ForeignKey(
        StripeCustomer, on_delete=models.CASCADE, related_name="subscriptions"
    )
    stripe_subscription_id = models.CharField(
        max_length=255, unique=True, db_index=True
    )
    stripe_price_id = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, db_index=True)
    current_period_end = models.DateTimeField()
    cancel_at_period_end = models.BooleanField(default=False)
    trial_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.customer.user.email} - {self.status}"

    @property
    def is_active(self):
        """Check if subscription is currently active"""
        return self.status in ["active", "trialing"]

    @property
    def is_trialing(self):
        """Check if subscription is in trial period"""
        return (
            self.status == "trialing"
            and self.trial_end
            and self.trial_end > timezone.now()
        )

    @property
    def days_until_period_end(self):
        """Days remaining in current billing period"""
        if self.current_period_end:
            delta = self.current_period_end - timezone.now()
            return max(0, delta.days)
        return 0
