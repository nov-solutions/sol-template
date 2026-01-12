from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a database backup immediately and upload to S3"

    def handle(self, *args, **options):
        from dbbackup.tasks import create_database_backup

        self.stdout.write("Creating database backup...")
        result = create_database_backup()
        self.stdout.write(self.style.SUCCESS(result))
