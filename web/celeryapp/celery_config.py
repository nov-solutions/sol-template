import os

from celery.schedules import crontab
from kombu import Exchange

REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")


broker_url = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:6379/0"
result_backend = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:6379/0"
result_expires = 60 * 60 * 24  # 24 hours

task_default_queue = "default"
task_default_exchange_type = "topic"
task_default_routing_key = "default"
task_default_priority = 5

broker_connection_retry_on_startup = True
broker_connection_max_retries = 10

redbeat_redis_url = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:6379/1"

default_exchange = Exchange("default", type="topic")

task_queues = ()

# Celery Beat schedule
beat_schedule = {
    "cleanup-unverified-accounts": {
        "task": "authapi.tasks.cleanup_unverified_accounts",
        "schedule": crontab(hour=3, minute=0),  # Run daily at 3 AM
    },
}
