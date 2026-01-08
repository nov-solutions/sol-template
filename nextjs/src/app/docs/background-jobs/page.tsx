export default function BackgroundJobsPage() {
  return (
    <div>
      <h1>Background Jobs</h1>
      <p className="lead">
        Sol uses Celery with Redis for background task processing and scheduled
        jobs.
      </p>

      <h2>Architecture</h2>
      <p>The background job system consists of:</p>
      <ul>
        <li>
          <strong>Redis</strong> - Message broker and result backend
        </li>
        <li>
          <strong>Celery Worker</strong> - Processes tasks from the queue
        </li>
        <li>
          <strong>Celery Beat</strong> - Schedules periodic tasks
        </li>
      </ul>

      <h2>Creating Tasks</h2>
      <p>
        Define tasks in your app&apos;s <code>tasks.py</code> file:
      </p>

      <pre>
        <code>{`# myapp/tasks.py
from celery import shared_task

@shared_task
def send_welcome_email(user_id):
    """Send welcome email to new user."""
    from user.models import User
    from mail.utils import send_email

    user = User.objects.get(id=user_id)
    send_email(
        to=user.email,
        subject="Welcome!",
        template="welcome",
        context={"user": user}
    )
    return f"Sent welcome email to {user.email}"`}</code>
      </pre>

      <h3>Task with Retry</h3>
      <pre>
        <code>{`@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60  # seconds
)
def process_payment(self, payment_id):
    try:
        # Process payment logic
        pass
    except TemporaryError as e:
        # Retry on temporary failures
        raise self.retry(exc=e)`}</code>
      </pre>

      <h2>Calling Tasks</h2>
      <p>Call tasks asynchronously from your views:</p>

      <pre>
        <code>{`from myapp.tasks import send_welcome_email

# Fire and forget
send_welcome_email.delay(user.id)

# With countdown (delay execution)
send_welcome_email.apply_async(
    args=[user.id],
    countdown=60  # Run in 60 seconds
)

# With ETA (specific time)
from datetime import datetime, timedelta
send_welcome_email.apply_async(
    args=[user.id],
    eta=datetime.now() + timedelta(hours=1)
)`}</code>
      </pre>

      <h2>Scheduled Tasks</h2>
      <p>
        Configure periodic tasks in <code>web/celeryapp/celery_config.py</code>:
      </p>

      <pre>
        <code>{`from celery.schedules import crontab

beat_schedule = {
    # Run every day at 3 AM
    "cleanup-unverified-accounts": {
        "task": "authapi.tasks.cleanup_unverified_accounts",
        "schedule": crontab(hour=3, minute=0),
    },
    # Run every hour
    "sync-subscription-status": {
        "task": "stripeapp.tasks.sync_subscriptions",
        "schedule": crontab(minute=0),  # Every hour at :00
    },
    # Run every 5 minutes
    "process-pending-webhooks": {
        "task": "stripeapp.tasks.process_webhooks",
        "schedule": 300,  # Every 300 seconds
    },
}`}</code>
      </pre>

      <h2>Task Registration</h2>
      <p>
        Ensure tasks are discovered by importing them in{" "}
        <code>celeryapp/tasks.py</code>:
      </p>

      <pre>
        <code>{`# web/celeryapp/tasks.py
from authapi.tasks import (  # noqa: F401
    cleanup_unverified_accounts,
    send_password_reset_email,
    send_verification_email,
)
from myapp.tasks import (  # noqa: F401
    send_welcome_email,
)`}</code>
      </pre>

      <h2>Monitoring Tasks</h2>
      <p>View task logs in the worker container:</p>

      <pre>
        <code>{`# View worker logs
docker logs -f sol-web-worker

# View scheduled tasks
docker logs -f sol-web-scheduler`}</code>
      </pre>

      <h2>Task Results</h2>
      <p>Get task results when needed:</p>

      <pre>
        <code>{`from myapp.tasks import process_data

# Get async result
result = process_data.delay(data_id)

# Check if complete (non-blocking)
if result.ready():
    output = result.get()

# Wait for result (blocking)
output = result.get(timeout=30)`}</code>
      </pre>

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Pass IDs, not objects</strong> - Tasks should receive
          serializable data
        </li>
        <li>
          <strong>Keep tasks idempotent</strong> - Tasks may run multiple times
        </li>
        <li>
          <strong>Use appropriate timeouts</strong> - Prevent tasks from running
          forever
        </li>
        <li>
          <strong>Handle failures gracefully</strong> - Use retries for
          transient errors
        </li>
      </ul>

      <pre>
        <code>{`# Good: Pass user ID
send_email.delay(user_id=user.id)

# Bad: Pass user object
send_email.delay(user=user)  # Won't serialize properly`}</code>
      </pre>

      <h2>Configuration</h2>
      <p>
        Celery is configured in <code>web/celeryapp/celery.py</code>:
      </p>

      <pre>
        <code>{`from celery import Celery

app = Celery("celeryapp")
app.config_from_object("celeryapp.celery_config")
app.autodiscover_tasks()`}</code>
      </pre>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Set up <a href="/docs/stripe-setup">Stripe Payments</a>
        </li>
        <li>
          Configure <a href="/docs/webhooks">Webhooks</a>
        </li>
      </ul>
    </div>
  );
}
