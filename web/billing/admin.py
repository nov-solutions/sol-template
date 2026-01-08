from django.contrib import admin
from django.utils.html import format_html

from .models import StripeCustomer, Subscription


@admin.register(StripeCustomer)
class StripeCustomerAdmin(admin.ModelAdmin):
    list_display = ["user", "stripe_customer_id", "has_active_sub", "created_at"]
    search_fields = ["user__email", "stripe_customer_id"]
    readonly_fields = ["stripe_customer_id", "created_at"]

    def has_active_sub(self, obj):
        """Show subscription status with color coding"""
        if obj.has_active_subscription:
            return format_html('<span style="color: green;">✓ Active</span>')
        return format_html('<span style="color: gray;">No subscription</span>')

    has_active_sub.short_description = "Subscription"


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        "customer_email",
        "status_colored",
        "stripe_price_id",
        "current_period_end",
        "cancel_at_period_end",
        "created_at",
    ]
    list_filter = ["status", "cancel_at_period_end", "created_at"]
    search_fields = [
        "customer__user__email",
        "stripe_subscription_id",
        "stripe_price_id",
    ]
    readonly_fields = [
        "stripe_subscription_id",
        "created_at",
        "updated_at",
        "days_until_period_end",
    ]
    ordering = ["-created_at"]

    def customer_email(self, obj):
        return obj.customer.user.email

    customer_email.short_description = "Customer"
    customer_email.admin_order_field = "customer__user__email"

    def status_colored(self, obj):
        """Show status with appropriate color"""
        colors = {
            "active": "green",
            "trialing": "blue",
            "past_due": "orange",
            "canceled": "red",
            "unpaid": "red",
        }
        color = colors.get(obj.status, "gray")
        return format_html(
            '<span style="color: {};">{}</span>', color, obj.get_status_display()
        )

    status_colored.short_description = "Status"
    status_colored.admin_order_field = "status"

    def get_readonly_fields(self, request, obj=None):
        # Make customer readonly after creation
        if obj:
            return self.readonly_fields + ["customer"]
        return self.readonly_fields
