from django.contrib import admin

from .models import EmailVerificationToken, PasswordResetToken


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ["user", "created_at", "used"]
    list_filter = ["used", "created_at"]
    search_fields = ["user__email"]
    readonly_fields = ["token", "created_at"]


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ["user", "created_at", "used"]
    list_filter = ["used", "created_at"]
    search_fields = ["user__email"]
    readonly_fields = ["token", "created_at"]
