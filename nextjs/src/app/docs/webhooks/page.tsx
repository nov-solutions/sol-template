export default function WebhooksPage() {
  return (
    <div>
      <h1>Webhooks</h1>
      <p className="lead">
        Handle Stripe webhook events to keep your application in sync with
        payment and subscription changes.
      </p>

      <h2>How Webhooks Work</h2>
      <ol>
        <li>An event occurs in Stripe (payment, subscription change, etc.)</li>
        <li>Stripe sends a POST request to your webhook endpoint</li>
        <li>Your application verifies the webhook signature</li>
        <li>Your application processes the event and updates the database</li>
      </ol>

      <h2>Webhook Endpoint</h2>
      <p>
        Sol handles webhooks at <code>/api/stripe/webhook/</code>. The endpoint:
      </p>
      <ul>
        <li>Verifies the Stripe signature</li>
        <li>Routes events to appropriate handlers</li>
        <li>Updates subscription status in the database</li>
      </ul>

      <h2>Handled Events</h2>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>checkout.session.completed</code>
            </td>
            <td>Create subscription record</td>
          </tr>
          <tr>
            <td>
              <code>customer.subscription.created</code>
            </td>
            <td>Store subscription details</td>
          </tr>
          <tr>
            <td>
              <code>customer.subscription.updated</code>
            </td>
            <td>Update status, period end, etc.</td>
          </tr>
          <tr>
            <td>
              <code>customer.subscription.deleted</code>
            </td>
            <td>Mark subscription as canceled</td>
          </tr>
          <tr>
            <td>
              <code>invoice.paid</code>
            </td>
            <td>Confirm payment success</td>
          </tr>
          <tr>
            <td>
              <code>invoice.payment_failed</code>
            </td>
            <td>Handle failed payment</td>
          </tr>
        </tbody>
      </table>

      <h2>Webhook Implementation</h2>
      <pre>
        <code>{`# web/stripeapp/views.py
import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    # Handle specific events
    if event["type"] == "checkout.session.completed":
        handle_checkout_completed(event["data"]["object"])
    elif event["type"] == "customer.subscription.updated":
        handle_subscription_updated(event["data"]["object"])
    elif event["type"] == "customer.subscription.deleted":
        handle_subscription_deleted(event["data"]["object"])

    return HttpResponse(status=200)`}</code>
      </pre>

      <h2>Event Handlers</h2>
      <pre>
        <code>{`def handle_checkout_completed(session):
    """Handle successful checkout."""
    customer_id = session["customer"]
    subscription_id = session["subscription"]
    user_id = session["client_reference_id"]  # Passed during checkout creation

    user = User.objects.get(id=user_id)

    Subscription.objects.update_or_create(
        user=user,
        defaults={
            "stripe_customer_id": customer_id,
            "stripe_subscription_id": subscription_id,
            "status": "active",
        }
    )

def handle_subscription_updated(subscription):
    """Handle subscription updates."""
    try:
        sub = Subscription.objects.get(
            stripe_subscription_id=subscription["id"]
        )
        sub.status = subscription["status"]
        sub.cancel_at_period_end = subscription["cancel_at_period_end"]
        sub.current_period_end = datetime.fromtimestamp(
            subscription["current_period_end"], tz=timezone.utc
        )
        sub.save()
    except Subscription.DoesNotExist:
        pass

def handle_subscription_deleted(subscription):
    """Handle subscription cancellation."""
    try:
        sub = Subscription.objects.get(
            stripe_subscription_id=subscription["id"]
        )
        sub.status = "canceled"
        sub.save()
    except Subscription.DoesNotExist:
        pass`}</code>
      </pre>

      <h2>Local Development</h2>
      <p>Use the Stripe CLI to forward webhooks locally:</p>

      <pre>
        <code>{`# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost/api/stripe/webhook/

# In another terminal, trigger test events
stripe trigger checkout.session.completed`}</code>
      </pre>

      <p>
        Copy the webhook signing secret from the CLI output and add it to your{" "}
        <code>.env</code>:
      </p>

      <pre>
        <code>{`STRIPE_WEBHOOK_SECRET=whsec_...`}</code>
      </pre>

      <h2>Production Setup</h2>
      <ol>
        <li>
          Go to{" "}
          <a
            href="https://dashboard.stripe.com/webhooks"
            target="_blank"
            rel="noopener"
          >
            Stripe Dashboard → Webhooks
          </a>
        </li>
        <li>
          Click <strong>Add endpoint</strong>
        </li>
        <li>
          Enter your endpoint URL:{" "}
          <code>https://yourdomain.com/api/stripe/webhook/</code>
        </li>
        <li>Select events to listen for</li>
        <li>Copy the signing secret to your production environment</li>
      </ol>

      <h2>Debugging Webhooks</h2>
      <p>Check webhook delivery in Stripe Dashboard:</p>
      <ol>
        <li>Go to Developers → Webhooks</li>
        <li>Click on your endpoint</li>
        <li>View recent deliveries and their responses</li>
        <li>Retry failed webhooks if needed</li>
      </ol>

      <pre>
        <code>{`# View Django logs for webhook processing
docker logs -f sol-web-django | grep webhook`}</code>
      </pre>

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Always verify signatures</strong> - Never process unverified
          webhooks
        </li>
        <li>
          <strong>Return 200 quickly</strong> - Process heavy work
          asynchronously
        </li>
        <li>
          <strong>Handle duplicates</strong> - Stripe may send events multiple
          times
        </li>
        <li>
          <strong>Log events</strong> - Keep records for debugging
        </li>
      </ul>

      <pre>
        <code>{`# Process webhooks asynchronously with Celery
@csrf_exempt
@require_POST
def stripe_webhook(request):
    # Verify signature...

    # Queue for async processing
    process_stripe_event.delay(event)

    # Return immediately
    return HttpResponse(status=200)`}</code>
      </pre>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Configure{" "}
          <a href="/docs/environment-variables">Environment Variables</a>
        </li>
        <li>
          Set up <a href="/docs/production">Production Deployment</a>
        </li>
      </ul>
    </div>
  );
}
