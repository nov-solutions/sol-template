export default function EnvironmentVariablesPage() {
  return (
    <div>
      <h1>Environment Variables</h1>
      <p className="lead">
        Configure your application using environment variables for different
        deployment environments.
      </p>

      <h2>Setup</h2>
      <p>Copy the example file to create your local configuration:</p>

      <pre>
        <code>{`cp .env.example .env`}</code>
      </pre>

      <h2>Required Variables</h2>

      <h3>Database</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>POSTGRES_HOST</code>
            </td>
            <td>Database host</td>
            <td>
              <code>postgres</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>POSTGRES_PORT</code>
            </td>
            <td>Database port</td>
            <td>
              <code>5432</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>POSTGRES_DB</code>
            </td>
            <td>Database name</td>
            <td>
              <code>sol</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>POSTGRES_USER</code>
            </td>
            <td>Database user</td>
            <td>
              <code>postgres</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>POSTGRES_PASSWORD</code>
            </td>
            <td>Database password</td>
            <td>
              <code>your-secure-password</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Django</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>DJANGO_SECRET_KEY</code>
            </td>
            <td>Secret key for cryptographic signing</td>
            <td>
              <code>random-50-char-string</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>ENVIRONMENT</code>
            </td>
            <td>Environment name</td>
            <td>
              <code>dev</code> or <code>prod</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>SITE_DOMAIN</code>
            </td>
            <td>Your application domain</td>
            <td>
              <code>localhost</code> or <code>yourdomain.com</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Redis</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>REDIS_HOST</code>
            </td>
            <td>Redis host</td>
            <td>
              <code>redis</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>REDIS_PORT</code>
            </td>
            <td>Redis port</td>
            <td>
              <code>6379</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Stripe</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>STRIPE_SECRET_KEY</code>
            </td>
            <td>Stripe API secret key</td>
            <td>
              <code>sk_test_...</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>STRIPE_PUBLISHABLE_KEY</code>
            </td>
            <td>Stripe publishable key</td>
            <td>
              <code>pk_test_...</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>STRIPE_WEBHOOK_SECRET</code>
            </td>
            <td>Webhook signing secret</td>
            <td>
              <code>whsec_...</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Optional Variables</h2>

      <h3>Google OAuth</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>GOOGLE_CLIENT_ID</code>
            </td>
            <td>Google OAuth client ID</td>
          </tr>
          <tr>
            <td>
              <code>GOOGLE_CLIENT_SECRET</code>
            </td>
            <td>Google OAuth client secret</td>
          </tr>
        </tbody>
      </table>

      <h3>Email (SMTP)</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>EMAIL_HOST</code>
            </td>
            <td>SMTP server</td>
            <td>
              <code>smtp.sendgrid.net</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>EMAIL_PORT</code>
            </td>
            <td>SMTP port</td>
            <td>
              <code>587</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>EMAIL_HOST_USER</code>
            </td>
            <td>SMTP username</td>
            <td>
              <code>apikey</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>EMAIL_HOST_PASSWORD</code>
            </td>
            <td>SMTP password</td>
            <td>Your API key</td>
          </tr>
          <tr>
            <td>
              <code>DEFAULT_FROM_EMAIL</code>
            </td>
            <td>Default sender address</td>
            <td>
              <code>noreply@yourdomain.com</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Sentry (Error Tracking)</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>SENTRY_DSN</code>
            </td>
            <td>Sentry Data Source Name</td>
          </tr>
        </tbody>
      </table>

      <h2>Generating Secret Keys</h2>
      <pre>
        <code>{`# Generate a Django secret key
python -c "import secrets; print(secrets.token_urlsafe(50))"`}</code>
      </pre>

      <h2>Environment-Specific Configuration</h2>
      <p>
        The <code>ENVIRONMENT</code> variable controls various behaviors:
      </p>

      <table>
        <thead>
          <tr>
            <th>Setting</th>
            <th>
              <code>dev</code>
            </th>
            <th>
              <code>prod</code>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DEBUG</td>
            <td>True</td>
            <td>False</td>
          </tr>
          <tr>
            <td>SECURE_SSL_REDIRECT</td>
            <td>False</td>
            <td>True</td>
          </tr>
          <tr>
            <td>SESSION_COOKIE_SECURE</td>
            <td>False</td>
            <td>True</td>
          </tr>
          <tr>
            <td>CSRF_COOKIE_SECURE</td>
            <td>False</td>
            <td>True</td>
          </tr>
        </tbody>
      </table>

      <h2>Frontend Environment Variables</h2>
      <p>
        Next.js uses the <code>NEXT_PUBLIC_</code> prefix for client-side
        variables:
      </p>

      <pre>
        <code>{`# .env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=/api`}</code>
      </pre>

      <h2>Docker Environment</h2>
      <p>
        Environment variables are passed to containers via{" "}
        <code>docker-compose.yaml</code>:
      </p>

      <pre>
        <code>{`services:
  django:
    env_file:
      - .env
    environment:
      - ENVIRONMENT=dev
      - SITE_DOMAIN=localhost`}</code>
      </pre>

      <h2>Security Best Practices</h2>
      <ul>
        <li>
          Never commit <code>.env</code> files to version control
        </li>
        <li>Use different secrets for each environment</li>
        <li>Rotate secrets periodically</li>
        <li>Use a secrets manager in production (AWS Secrets Manager, etc.)</li>
        <li>Restrict access to production environment variables</li>
      </ul>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Configure <a href="/docs/docker">Docker</a> for deployment
        </li>
        <li>
          Set up <a href="/docs/production">Production</a> environment
        </li>
      </ul>
    </div>
  );
}
