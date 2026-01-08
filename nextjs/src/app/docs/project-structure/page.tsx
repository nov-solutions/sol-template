export default function ProjectStructurePage() {
  return (
    <div>
      <h1>Project Structure</h1>
      <p className="lead">
        Understanding how Sol is organized will help you navigate and extend the
        codebase effectively.
      </p>

      <h2>Overview</h2>
      <p>
        Sol follows a monorepo structure with separate directories for the
        frontend, backend, and infrastructure code.
      </p>

      <pre>
        <code>{`sol-web/
├── nextjs/           # Next.js frontend
├── web/              # Django backend
├── nginx/            # Reverse proxy config
├── cdk/              # AWS CDK infrastructure
├── docker-compose.yaml
├── Makefile
└── .env`}</code>
      </pre>

      <h2>Frontend (nextjs/)</h2>
      <p>
        The Next.js application uses the App Router with TypeScript and Tailwind
        CSS.
      </p>

      <pre>
        <code>{`nextjs/
├── src/
│   ├── app/              # App Router pages and layouts
│   │   ├── (auth)/       # Auth pages (login, register, etc.)
│   │   ├── (dashboard)/  # Protected dashboard pages
│   │   ├── (marketing)/  # Public marketing pages
│   │   └── docs/         # Documentation pages
│   ├── components/       # Reusable React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── marketing/    # Landing page components
│   │   └── docs/         # Documentation components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React context providers
│   ├── lib/              # Utility functions
│   └── constants.ts      # Shared constants
├── public/               # Static assets
└── tailwind.config.ts    # Tailwind configuration`}</code>
      </pre>

      <h3>Key Files</h3>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>src/app/layout.tsx</code>
            </td>
            <td>Root layout with providers</td>
          </tr>
          <tr>
            <td>
              <code>src/app/providers.tsx</code>
            </td>
            <td>Context providers wrapper</td>
          </tr>
          <tr>
            <td>
              <code>src/lib/axios.ts</code>
            </td>
            <td>Axios client with CSRF handling</td>
          </tr>
          <tr>
            <td>
              <code>src/hooks/use-auth.ts</code>
            </td>
            <td>Authentication hook</td>
          </tr>
          <tr>
            <td>
              <code>src/middleware.ts</code>
            </td>
            <td>Route protection middleware</td>
          </tr>
        </tbody>
      </table>

      <h2>Backend (web/)</h2>
      <p>
        The Django backend uses a modular structure with separate apps for
        different features.
      </p>

      <pre>
        <code>{`web/
├── settings/
│   ├── __init__.py       # Settings aggregator
│   ├── components/       # Modular settings files
│   │   ├── base.py       # Core Django settings
│   │   ├── allauth.py    # Authentication settings
│   │   ├── stripe.py     # Stripe configuration
│   │   ├── redis.py      # Cache/session settings
│   │   └── ...
│   └── utils.py          # Settings utilities
├── web/
│   └── urls.py           # Root URL configuration
├── user/                 # User model and management
├── authapi/              # Authentication API endpoints
├── stripeapp/            # Stripe integration
├── celeryapp/            # Background task configuration
├── core/                 # Core utilities and health checks
└── manage.py`}</code>
      </pre>

      <h3>Django Apps</h3>
      <table>
        <thead>
          <tr>
            <th>App</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>user</code>
            </td>
            <td>Custom user model with email-based auth</td>
          </tr>
          <tr>
            <td>
              <code>authapi</code>
            </td>
            <td>REST API for authentication</td>
          </tr>
          <tr>
            <td>
              <code>stripeapp</code>
            </td>
            <td>Subscription and payment handling</td>
          </tr>
          <tr>
            <td>
              <code>celeryapp</code>
            </td>
            <td>Background jobs and scheduling</td>
          </tr>
          <tr>
            <td>
              <code>core</code>
            </td>
            <td>Health checks and shared utilities</td>
          </tr>
        </tbody>
      </table>

      <h2>Docker Services</h2>
      <p>
        The application runs as a set of interconnected Docker containers
        defined in <code>docker-compose.yaml</code>.
      </p>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Port</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>nginx</code>
            </td>
            <td>80</td>
            <td>Reverse proxy, routes traffic</td>
          </tr>
          <tr>
            <td>
              <code>nextjs</code>
            </td>
            <td>3000</td>
            <td>Next.js frontend server</td>
          </tr>
          <tr>
            <td>
              <code>django</code>
            </td>
            <td>8000</td>
            <td>Django REST API</td>
          </tr>
          <tr>
            <td>
              <code>postgres</code>
            </td>
            <td>5432</td>
            <td>PostgreSQL database</td>
          </tr>
          <tr>
            <td>
              <code>redis</code>
            </td>
            <td>6379</td>
            <td>Cache and message broker</td>
          </tr>
          <tr>
            <td>
              <code>worker</code>
            </td>
            <td>-</td>
            <td>Celery background worker</td>
          </tr>
          <tr>
            <td>
              <code>scheduler</code>
            </td>
            <td>-</td>
            <td>Celery beat scheduler</td>
          </tr>
        </tbody>
      </table>

      <h2>Configuration Files</h2>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>.env</code>
            </td>
            <td>Environment variables (not committed)</td>
          </tr>
          <tr>
            <td>
              <code>.env.example</code>
            </td>
            <td>Template for environment variables</td>
          </tr>
          <tr>
            <td>
              <code>Makefile</code>
            </td>
            <td>Common development commands</td>
          </tr>
          <tr>
            <td>
              <code>docker-compose.yaml</code>
            </td>
            <td>Docker service definitions</td>
          </tr>
        </tbody>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Set up <a href="/docs/authentication">Authentication</a>
        </li>
        <li>
          Learn about the <a href="/docs/database">Database</a> configuration
        </li>
        <li>
          Explore <a href="/docs/api-routes">API Routes</a>
        </li>
      </ul>
    </div>
  );
}
