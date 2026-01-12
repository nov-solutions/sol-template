from decouple import config

# AWS Credentials for S3 Backup
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID", default="")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY", default="")
AWS_REGION = config("AWS_REGION", default="us-west-2")

# Database Backup Configuration
BACKUP_S3_BUCKET = config("BACKUP_S3_BUCKET", default="")
BACKUP_RETENTION_DAYS = config("BACKUP_RETENTION_DAYS", default=30, cast=int)
BACKUP_PREFIX = config("BACKUP_PREFIX", default="backups/")
