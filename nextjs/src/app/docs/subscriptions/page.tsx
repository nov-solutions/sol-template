export default function SubscriptionsPage() {
  return (
    <div>
      <h1>Subscriptions</h1>
      <p className="lead">
        Manage recurring subscriptions with Stripe Billing integration.
      </p>

      <h2>Subscription Flow</h2>
      <ol>
        <li>User clicks &quot;Subscribe&quot; on pricing page</li>
        <li>Frontend creates a Stripe Checkout session via API</li>
        <li>User is redirected to Stripe Checkout</li>
        <li>After payment, Stripe redirects to success URL</li>
        <li>Webhook updates subscription status in database</li>
      </ol>

      <h2>Frontend Integration</h2>
      <p>
        Use the <code>useSubscription</code> hook to manage subscriptions:
      </p>

      <pre>
        <code>{`import { useSubscription } from "@/hooks/use-subscription";

function PricingPage() {
  const {
    subscription,
    loading,
    createCheckoutSession
  } = useSubscription();

  const handleSubscribe = async (priceId: string) => {
    await createCheckoutSession(priceId);
    // User is redirected to Stripe Checkout
  };

  return (
    <button onClick={() => handleSubscribe("price_xxx")}>
      Subscribe
    </button>
  );
}`}</code>
      </pre>

      <h2>Subscription Hook API</h2>
      <table>
        <thead>
          <tr>
            <th>Property/Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>subscription</code>
            </td>
            <td>Current subscription data</td>
          </tr>
          <tr>
            <td>
              <code>loading</code>
            </td>
            <td>Loading state</td>
          </tr>
          <tr>
            <td>
              <code>createCheckoutSession(priceId)</code>
            </td>
            <td>Start checkout flow</td>
          </tr>
          <tr>
            <td>
              <code>openBillingPortal()</code>
            </td>
            <td>Open Stripe customer portal</td>
          </tr>
          <tr>
            <td>
              <code>cancelSubscription()</code>
            </td>
            <td>Cancel at period end</td>
          </tr>
          <tr>
            <td>
              <code>reactivateSubscription()</code>
            </td>
            <td>Reactivate canceled subscription</td>
          </tr>
        </tbody>
      </table>

      <h2>Subscription Object</h2>
      <pre>
        <code>{`interface Subscription {
  has_active_subscription: boolean;
  status: "active" | "trialing" | "canceled" | "past_due" | null;
  plan_name: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  is_trialing: boolean;
}`}</code>
      </pre>

      <h2>Checking Subscription Status</h2>
      <pre>
        <code>{`const { subscription } = useSubscription();

// Check if user has active subscription
if (subscription?.has_active_subscription) {
  // Show premium features
}

// Check if subscription is canceling
if (subscription?.cancel_at_period_end) {
  // Show "Access until [date]" message
}

// Check trial status
if (subscription?.is_trialing) {
  // Show trial indicator
}`}</code>
      </pre>

      <h2>Backend Model</h2>
      <pre>
        <code>{`# web/stripeapp/models.py
class Subscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=50, default="")
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)

    @property
    def is_active(self):
        return self.status in ["active", "trialing"]`}</code>
      </pre>

      <h2>Customer Portal</h2>
      <p>
        The Stripe Customer Portal allows users to manage their subscription,
        update payment methods, and view invoices.
      </p>

      <pre>
        <code>{`const { openBillingPortal } = useSubscription();

// Opens Stripe's hosted customer portal
<button onClick={openBillingPortal}>
  Manage Billing
</button>`}</code>
      </pre>

      <h2>Cancellation Flow</h2>
      <p>
        Subscriptions cancel at the end of the billing period, giving users
        access until then:
      </p>

      <pre>
        <code>{`const { cancelSubscription, reactivateSubscription } = useSubscription();

// Cancel at period end
await cancelSubscription();

// Reactivate if canceled but still in billing period
await reactivateSubscription();`}</code>
      </pre>

      <h2>Protecting Features</h2>
      <p>Check subscription status before showing premium features:</p>

      <pre>
        <code>{`// In a component
const { subscription, loading } = useSubscription();

if (loading) return <Spinner />;

if (!subscription?.has_active_subscription) {
  return <UpgradePrompt />;
}

return <PremiumFeature />;`}</code>
      </pre>

      <pre>
        <code>{`// Backend view protection
from rest_framework.views import APIView
from rest_framework.response import Response

class PremiumView(APIView):
    def get(self, request):
        subscription = getattr(request.user, 'subscription', None)
        if not subscription or not subscription.is_active:
            return Response(
                {"error": "Subscription required"},
                status=403
            )
        return Response({"data": "premium content"})`}</code>
      </pre>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Configure <a href="/docs/webhooks">Webhook Handling</a>
        </li>
        <li>
          Set up <a href="/docs/production">Production Deployment</a>
        </li>
      </ul>
    </div>
  );
}
