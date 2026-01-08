export default function StripeSetupPage() {
  return (
    <div>
      <h1>Stripe Setup</h1>
      <p className="lead">
        Configure Stripe to accept payments and manage subscriptions in your
        application.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>
          A{" "}
          <a href="https://stripe.com" target="_blank" rel="noopener">
            Stripe account
          </a>
        </li>
        <li>
          Access to the{" "}
          <a href="https://dashboard.stripe.com" target="_blank" rel="noopener">
            Stripe Dashboard
          </a>
        </li>
      </ul>

      <h2>1. Get Your API Keys</h2>
      <ol>
        <li>Log in to your Stripe Dashboard</li>
        <li>
          Go to <strong>Developers → API keys</strong>
        </li>
        <li>Copy your publishable key and secret key</li>
      </ol>

      <p>
        For development, use test mode keys (prefixed with <code>pk_test_</code>{" "}
        and <code>sk_test_</code>).
      </p>

      <h2>2. Configure Environment Variables</h2>
      <p>
        Add your Stripe keys to <code>.env</code>:
      </p>

      <pre>
        <code>{`STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret`}</code>
      </pre>

      <h2>3. Create Products and Prices</h2>
      <p>In your Stripe Dashboard:</p>
      <ol>
        <li>
          Go to <strong>Products</strong>
        </li>
        <li>
          Click <strong>Add product</strong>
        </li>
        <li>Enter product name (e.g., &quot;Pro Plan&quot;)</li>
        <li>Add a recurring price (e.g., $29/month)</li>
        <li>Copy the price ID (starts with `price_`)</li>
      </ol>

      <h2>4. Configure Price IDs</h2>
      <p>
        Update your pricing configuration in{" "}
        <code>settings/components/stripe.py</code>:
      </p>

      <pre>
        <code>{`STRIPE_PRICES = {
    "pro_monthly": "price_xxx",
    "pro_yearly": "price_yyy",
}`}</code>
      </pre>

      <p>Or configure in your frontend pricing page:</p>

      <pre>
        <code>{`const tiers = [
  {
    name: "Pro",
    priceId: "price_xxx",  // Your actual Stripe price ID
    price: "$29",
    interval: "month",
  },
];`}</code>
      </pre>

      <h2>5. Set Up Webhooks</h2>
      <p>
        Webhooks notify your application of Stripe events (payments,
        subscription changes, etc.).
      </p>

      <h3>For Development (Stripe CLI)</h3>
      <ol>
        <li>
          Install the{" "}
          <a
            href="https://stripe.com/docs/stripe-cli"
            target="_blank"
            rel="noopener"
          >
            Stripe CLI
          </a>
        </li>
        <li>
          Run:{" "}
          <code>stripe listen --forward-to localhost/api/stripe/webhook/</code>
        </li>
        <li>Copy the webhook signing secret and add to your `.env`</li>
      </ol>

      <h3>For Production</h3>
      <ol>
        <li>
          Go to <strong>Developers → Webhooks</strong> in Stripe Dashboard
        </li>
        <li>
          Click <strong>Add endpoint</strong>
        </li>
        <li>
          Enter your webhook URL:{" "}
          <code>https://yourdomain.com/api/stripe/webhook/</code>
        </li>
        <li>
          Select events to listen to:
          <ul>
            <li>
              <code>checkout.session.completed</code>
            </li>
            <li>
              <code>customer.subscription.created</code>
            </li>
            <li>
              <code>customer.subscription.updated</code>
            </li>
            <li>
              <code>customer.subscription.deleted</code>
            </li>
            <li>
              <code>invoice.paid</code>
            </li>
            <li>
              <code>invoice.payment_failed</code>
            </li>
          </ul>
        </li>
        <li>Copy the webhook signing secret</li>
      </ol>

      <h2>API Endpoints</h2>
      <p>Sol provides these Stripe-related endpoints:</p>

      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/stripe/create-checkout-session/</code>
            </td>
            <td>Create Stripe checkout session</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/stripe/create-portal-session/</code>
            </td>
            <td>Create customer portal session</td>
          </tr>
          <tr>
            <td>GET</td>
            <td>
              <code>/api/stripe/subscription/</code>
            </td>
            <td>Get subscription status</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/stripe/cancel-subscription/</code>
            </td>
            <td>Cancel subscription</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/stripe/reactivate-subscription/</code>
            </td>
            <td>Reactivate canceled subscription</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/api/stripe/webhook/</code>
            </td>
            <td>Handle Stripe webhooks</td>
          </tr>
        </tbody>
      </table>

      <h2>Testing</h2>
      <p>Use Stripe test card numbers:</p>

      <table>
        <thead>
          <tr>
            <th>Card Number</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>4242 4242 4242 4242</code>
            </td>
            <td>Successful payment</td>
          </tr>
          <tr>
            <td>
              <code>4000 0000 0000 0002</code>
            </td>
            <td>Card declined</td>
          </tr>
          <tr>
            <td>
              <code>4000 0025 0000 3155</code>
            </td>
            <td>Requires authentication</td>
          </tr>
        </tbody>
      </table>

      <p>Use any future expiration date and any 3-digit CVC for test cards.</p>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Learn about <a href="/docs/subscriptions">Subscription Management</a>
        </li>
        <li>
          Configure <a href="/docs/webhooks">Webhook Handling</a>
        </li>
      </ul>
    </div>
  );
}
