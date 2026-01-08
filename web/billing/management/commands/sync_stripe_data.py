import stripe
from django.conf import settings
from django.core.management.base import BaseCommand
from stripe.utils import sync_stripe_products_and_prices


class Command(BaseCommand):
    help = "Sync products and prices from Stripe to local database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--products-only",
            action="store_true",
            help="Only sync products, not prices",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be synced without making changes",
        )

    def handle(self, *args, **options):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        if not settings.STRIPE_SECRET_KEY:
            self.stdout.write(self.style.ERROR("STRIPE_SECRET_KEY is not configured"))
            return

        self.stdout.write("Starting Stripe data sync...")

        try:
            if options["dry_run"]:
                self.stdout.write(
                    self.style.WARNING("DRY RUN - No changes will be made")
                )
                # In a real implementation, you'd show what would be synced
                products = stripe.Product.list(limit=100)
                self.stdout.write(f"Would sync {len(products.data)} products")

                if not options["products_only"]:
                    prices = stripe.Price.list(limit=100)
                    self.stdout.write(f"Would sync {len(prices.data)} prices")
            else:
                sync_stripe_products_and_prices()
                self.stdout.write(self.style.SUCCESS("Successfully synced Stripe data"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error syncing Stripe data: {str(e)}"))
