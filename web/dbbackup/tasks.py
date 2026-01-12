import os
import subprocess
import tempfile
from datetime import datetime

import structlog
from celery import shared_task
from django.conf import settings

logger = structlog.get_logger(__name__)


@shared_task
def create_database_backup():
    """
    Create a PostgreSQL backup using pg_dump and upload to S3.

    Backup filename format: backups/YYYY-MM-DD_HHMMSS_dbname.sql.gz
    """
    from .s3 import BackupS3Client

    timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H%M%S")
    db_name = os.environ.get("POSTGRES_DB", "postgres")
    filename = f"{timestamp}_{db_name}.sql.gz"
    s3_key = f"{settings.BACKUP_PREFIX}{filename}"

    # Build pg_dump command
    pg_dump_cmd = [
        "pg_dump",
        "-h",
        os.environ.get("POSTGRES_HOST", "postgres"),
        "-U",
        os.environ.get("POSTGRES_USER", "postgres"),
        "-d",
        db_name,
        "--no-password",
        "--format=plain",
    ]

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".sql.gz", delete=False) as tmp_file:
            temp_path = tmp_file.name

            # Set PGPASSWORD for authentication
            env = os.environ.copy()
            env["PGPASSWORD"] = os.environ.get("POSTGRES_PASSWORD", "")

            # Run pg_dump and pipe to gzip
            pg_process = subprocess.Popen(
                pg_dump_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
            )

            gzip_process = subprocess.Popen(
                ["gzip", "-c"],
                stdin=pg_process.stdout,
                stdout=tmp_file,
                stderr=subprocess.PIPE,
            )

            pg_process.stdout.close()
            _, gzip_error = gzip_process.communicate()
            _, pg_error = pg_process.communicate()

            if pg_process.returncode != 0:
                raise Exception(f"pg_dump failed: {pg_error.decode()}")

            if gzip_process.returncode != 0:
                raise Exception(f"gzip failed: {gzip_error.decode()}")

        # Upload to S3
        s3_client = BackupS3Client()
        s3_client.upload_backup(temp_path, s3_key)

        file_size = os.path.getsize(temp_path)
        logger.info(
            "Database backup created",
            s3_key=s3_key,
            size_bytes=file_size,
        )

        return f"Backup created: {s3_key} ({file_size} bytes)"

    except Exception as e:
        logger.error("Database backup failed", error=str(e))
        raise

    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


@shared_task
def cleanup_old_backups():
    """
    Delete backups older than BACKUP_RETENTION_DAYS from S3.

    S3 lifecycle rules also provide automatic deletion as a fallback.
    """
    from .s3 import BackupS3Client

    retention_days = settings.BACKUP_RETENTION_DAYS
    s3_client = BackupS3Client()

    try:
        old_backups = s3_client.get_backups_older_than(retention_days)
        deleted_count = 0

        for backup_key in old_backups:
            s3_client.delete_backup(backup_key)
            deleted_count += 1

        logger.info(
            "Backup cleanup completed",
            deleted_count=deleted_count,
            retention_days=retention_days,
        )

        return f"Deleted {deleted_count} backups older than {retention_days} days"

    except Exception as e:
        logger.error("Backup cleanup failed", error=str(e))
        raise
