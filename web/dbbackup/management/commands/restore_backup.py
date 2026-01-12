import os
import subprocess
import tempfile

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Restore database from an S3 backup"

    def add_arguments(self, parser):
        parser.add_argument(
            "backup_key",
            type=str,
            nargs="?",
            help="S3 key of the backup (e.g., backups/2024-01-01_020000_db.sql.gz)",
        )
        parser.add_argument(
            "--list",
            action="store_true",
            help="List available backups",
        )
        parser.add_argument(
            "--latest",
            action="store_true",
            help="Restore the most recent backup",
        )
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Skip confirmation prompt (for automation)",
        )

    def handle(self, *args, **options):
        from dbbackup.s3 import BackupS3Client

        s3_client = BackupS3Client()

        # List backups
        if options["list"]:
            backups = s3_client.list_backups()
            if not backups:
                self.stdout.write("No backups found.")
                return

            self.stdout.write("Available backups:")
            for backup in backups:
                size_mb = backup["size"] / (1024 * 1024)
                date_str = backup["date"].strftime("%Y-%m-%d %H:%M:%S UTC")
                self.stdout.write(f"  {backup['key']} ({size_mb:.2f} MB, {date_str})")
            return

        # Determine which backup to restore
        backup_key = options["backup_key"]

        if options["latest"]:
            backups = s3_client.list_backups()
            if not backups:
                raise CommandError("No backups available")
            backup_key = backups[0]["key"]
            self.stdout.write(f"Using latest backup: {backup_key}")

        if not backup_key:
            raise CommandError(
                "Please specify a backup key, use --latest, or use --list to see available backups"
            )

        # Confirm restore
        db_name = os.environ.get("POSTGRES_DB", "postgres")
        if not options["confirm"]:
            self.stdout.write(
                self.style.WARNING(
                    f"WARNING: This will overwrite the database '{db_name}'!"
                )
            )
            confirm = input(f"Restore from {backup_key}? [y/N]: ")
            if confirm.lower() != "y":
                self.stdout.write("Restore cancelled.")
                return

        self.stdout.write(f"Downloading backup: {backup_key}")

        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                suffix=".sql.gz", delete=False
            ) as tmp_file:
                temp_path = tmp_file.name

            s3_client.download_backup(backup_key, temp_path)

            self.stdout.write("Restoring database...")

            env = os.environ.copy()
            env["PGPASSWORD"] = os.environ.get("POSTGRES_PASSWORD", "")

            # Decompress and restore
            psql_cmd = [
                "psql",
                "-h",
                os.environ.get("POSTGRES_HOST", "postgres"),
                "-U",
                os.environ.get("POSTGRES_USER", "postgres"),
                "-d",
                db_name,
            ]

            gunzip_process = subprocess.Popen(
                ["gunzip", "-c", temp_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            psql_process = subprocess.Popen(
                psql_cmd,
                stdin=gunzip_process.stdout,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
            )

            gunzip_process.stdout.close()
            _, error = psql_process.communicate()

            if psql_process.returncode != 0:
                raise CommandError(f"Restore failed: {error.decode()}")

            self.stdout.write(self.style.SUCCESS("Database restored successfully!"))

        finally:
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
