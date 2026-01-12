from datetime import datetime, timedelta, timezone

import boto3
import structlog
from django.conf import settings

logger = structlog.get_logger(__name__)


class BackupS3Client:
    """S3 client wrapper for database backup operations."""

    def __init__(self):
        self.client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        self.bucket = settings.BACKUP_S3_BUCKET
        self.prefix = settings.BACKUP_PREFIX

    def upload_backup(self, file_path: str, key: str) -> str:
        """Upload a backup file to S3."""
        self.client.upload_file(file_path, self.bucket, key)
        logger.info("Uploaded backup to S3", bucket=self.bucket, key=key)
        return key

    def list_backups(self) -> list:
        """List all backup files in the bucket, sorted by date (newest first)."""
        response = self.client.list_objects_v2(
            Bucket=self.bucket,
            Prefix=self.prefix,
        )

        backups = []
        for obj in response.get("Contents", []):
            backups.append(
                {
                    "key": obj["Key"],
                    "size": obj["Size"],
                    "date": obj["LastModified"],
                }
            )

        # Sort by date, newest first
        backups.sort(key=lambda x: x["date"], reverse=True)
        return backups

    def delete_backup(self, key: str) -> None:
        """Delete a backup file from S3."""
        self.client.delete_object(Bucket=self.bucket, Key=key)
        logger.info("Deleted backup from S3", bucket=self.bucket, key=key)

    def download_backup(self, key: str, local_path: str) -> None:
        """Download a backup file from S3."""
        self.client.download_file(self.bucket, key, local_path)
        logger.info("Downloaded backup from S3", bucket=self.bucket, key=key)

    def get_backups_older_than(self, days: int) -> list:
        """Return list of backup keys older than N days."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        backups = self.list_backups()

        old_backups = []
        for backup in backups:
            if backup["date"] < cutoff:
                old_backups.append(backup["key"])

        return old_backups
