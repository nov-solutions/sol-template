export default function QuickStartPage() {
  return (
    <div>
      <h1>Quick Start</h1>
      <p className="lead">
        Get your development environment running in under 5 minutes.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Docker and Docker Compose</li>
        <li>Git</li>
        <li>Node.js 18+ (for local frontend development)</li>
      </ul>

      <h2>1. Clone the Repository</h2>
      <pre>
        <code>{`git clone https://github.com/your-org/sol-web.git
cd sol-web`}</code>
      </pre>

      <h2>2. Set Up Environment Variables</h2>
      <p>Copy the example environment file:</p>
      <pre>
        <code>{`cp .env.example .env`}</code>
      </pre>
      <p>
        The default values work for local development. You&apos;ll need to
        update them for production.
      </p>

      <h2>3. Start the Development Server</h2>
      <pre>
        <code>{`make dev`}</code>
      </pre>
      <p>This command will:</p>
      <ul>
        <li>Build the Docker images</li>
        <li>Start PostgreSQL, Redis, Django, Next.js, and Nginx</li>
        <li>Run database migrations</li>
        <li>Create initial data</li>
      </ul>

      <h2>4. Access Your App</h2>
      <p>Once everything is running, open your browser:</p>
      <ul>
        <li>
          <strong>Frontend:</strong>{" "}
          <a href="http://localhost" target="_blank" rel="noopener">
            http://localhost
          </a>
        </li>
        <li>
          <strong>API:</strong>{" "}
          <a href="http://localhost/api" target="_blank" rel="noopener">
            http://localhost/api
          </a>
        </li>
        <li>
          <strong>API Docs:</strong>{" "}
          <a href="http://localhost/api/docs" target="_blank" rel="noopener">
            http://localhost/api/docs
          </a>
        </li>
        <li>
          <strong>Admin:</strong>{" "}
          <a href="http://localhost/api/admin" target="_blank" rel="noopener">
            http://localhost/api/admin
          </a>
        </li>
      </ul>

      <h2>5. Create an Admin User</h2>
      <pre>
        <code>{`docker exec -it sol-web-django python manage.py createsuperuser`}</code>
      </pre>

      <h2>Common Commands</h2>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>make dev</code>
            </td>
            <td>Start development environment</td>
          </tr>
          <tr>
            <td>
              <code>make test</code>
            </td>
            <td>Run Django tests</td>
          </tr>
          <tr>
            <td>
              <code>make mk-mig</code>
            </td>
            <td>Create and apply migrations</td>
          </tr>
          <tr>
            <td>
              <code>make drop-db</code>
            </td>
            <td>Reset the database</td>
          </tr>
        </tbody>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Explore the <a href="/docs/project-structure">Project Structure</a>
        </li>
        <li>
          Set up <a href="/docs/authentication">Authentication</a>
        </li>
        <li>
          Configure <a href="/docs/stripe-setup">Stripe Payments</a>
        </li>
      </ul>
    </div>
  );
}
