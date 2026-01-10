export default function QuickStartPage() {
  return (
    <div>
      <h1>Quick Start</h1>
      <p className="lead">
        Get your new project set up and running from the Sol template.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Docker and Docker Compose</li>
        <li>Git</li>
        <li>Node.js 18+ (for local frontend development)</li>
        <li>Python 3.10+ (for running setup scripts)</li>
        <li>A GitHub account</li>
      </ul>

      <hr />

      <h2>Part 1: Create Your Repository</h2>

      <ol>
        <li>Go to the Sol template repository on GitHub</li>
        <li>
          Click the green <strong>&quot;Use this template&quot;</strong> button
        </li>
        <li>
          Select <strong>&quot;Create a new repository&quot;</strong>
        </li>
        <li>Name your repository and choose visibility (public/private)</li>
        <li>
          Clone your new repository:
          <pre>
            <code>{`git clone https://github.com/your-org/your-project.git
cd your-project`}</code>
          </pre>
        </li>
      </ol>

      <hr />

      <h2>Part 2: Configure GitHub Repository</h2>

      <h3>2.1 Create Repository Secrets</h3>
      <p>
        Go to your repository → <strong>Settings</strong> →{" "}
        <strong>Secrets and variables</strong> → <strong>Actions</strong> →{" "}
        <strong>New repository secret</strong>
      </p>
      <p>Create the following secrets:</p>
      <table>
        <thead>
          <tr>
            <th>Secret Name</th>
            <th>Description</th>
            <th>How to Generate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>SECRET_KEY</code>
            </td>
            <td>Django secret key</td>
            <td>
              Run:{" "}
              <code>
                python -c &quot;from django.core.management.utils import
                get_random_secret_key; print(get_random_secret_key())&quot;
              </code>
            </td>
          </tr>
          <tr>
            <td>
              <code>POSTGRES_PASSWORD</code>
            </td>
            <td>Database password</td>
            <td>Generate a strong random password (32+ chars)</td>
          </tr>
          <tr>
            <td>
              <code>REDIS_PASSWORD</code>
            </td>
            <td>Redis password</td>
            <td>Generate a strong random password (32+ chars)</td>
          </tr>
          <tr>
            <td>
              <code>EMAIL_HOST_PASSWORD</code>
            </td>
            <td>SMTP password (SendGrid API key)</td>
            <td>Get from your email provider (e.g., SendGrid API key)</td>
          </tr>
          <tr>
            <td>
              <code>SSH_PRIVATE_KEY</code>
            </td>
            <td>Production server SSH key</td>
            <td>
              Run <code>make key-pair</code>, paste contents of{" "}
              <code>app.pem</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>DEV_SSH_PRIVATE_KEY</code>
            </td>
            <td>Staging server SSH key (optional)</td>
            <td>Same as above, for staging environment</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Set Up Branch Protection Rules</h3>
      <p>
        Go to your repository → <strong>Settings</strong> →{" "}
        <strong>Branches</strong> → <strong>Add branch protection rule</strong>
      </p>
      <p>
        For the <code>master</code> branch, enable:
      </p>
      <ul>
        <li>
          <strong>Require a pull request before merging</strong>
          <ul>
            <li>Require approvals: 1 (adjust based on team size)</li>
          </ul>
        </li>
        <li>
          <strong>Require status checks to pass before merging</strong>
          <ul>
            <li>Require branches to be up to date</li>
            <li>
              Add status check: <code>test</code>
            </li>
          </ul>
        </li>
        <li>
          <strong>Do not allow bypassing the above settings</strong> (optional
          but recommended)
        </li>
      </ul>

      <hr />

      <h2>Part 3: Customize Your Project</h2>

      <h3>3.1 Run the Find-Replace Script</h3>
      <p>Update project-specific values throughout the codebase:</p>
      <pre>
        <code>{`python find_replace.py`}</code>
      </pre>
      <p>
        This will prompt you to replace placeholder values like project name and
        domain.
      </p>

      <h3>3.2 Update Environment Configuration</h3>
      <p>
        Create your local <code>.env</code> file:
      </p>
      <pre>
        <code>{`cp .env.example .env`}</code>
      </pre>
      <p>Update the values for your project. Key variables:</p>
      <ul>
        <li>
          <code>NEXT_PUBLIC_SITE_NAME</code> - Your app name
        </li>
        <li>
          <code>SITE_DOMAIN</code> - Your domain (e.g., myapp.com)
        </li>
        <li>
          <code>NEXT_PUBLIC_SITE_BASE_DOMAIN</code> - Full URL (e.g.,
          https://myapp.com)
        </li>
      </ul>

      <h3>3.3 Update Branding Assets</h3>
      <p>
        Replace placeholder images in <code>nextjs/public/</code>:
      </p>
      <ul>
        <li>
          <code>assets/img/logos/logo.png</code> - Your logo
        </li>
        <li>
          <code>assets/img/logos/wordmark.png</code> - Your wordmark
        </li>
        <li>
          <code>assets/img/favicon.png</code> - Favicon
        </li>
        <li>
          <code>assets/img/social.png</code> - Social sharing image
        </li>
        <li>
          <code>assets/img/apple_touch_icon.png</code> - iOS icon
        </li>
        <li>
          <code>manifest.json</code> - PWA manifest
        </li>
      </ul>

      <h3>3.4 Address All TODOs</h3>
      <p>
        Search the codebase for <code>TODO</code> and update:
      </p>
      <ul>
        <li>
          Server IP addresses in <code>.github/workflows/deploy.yaml</code>
        </li>
        <li>Domain names in nginx configuration</li>
        <li>Any other project-specific values</li>
      </ul>

      <hr />

      <h2>Part 4: Local Development</h2>

      <h3>4.1 Install Pre-commit Hooks</h3>
      <pre>
        <code>{`pre-commit install`}</code>
      </pre>

      <h3>4.2 Start the Development Server</h3>
      <pre>
        <code>{`make dev`}</code>
      </pre>
      <p>This command will:</p>
      <ul>
        <li>Build the Docker images</li>
        <li>Start PostgreSQL, Redis, Django, Next.js, and Nginx</li>
        <li>Run database migrations</li>
      </ul>

      <h3>4.3 Access Your App</h3>
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

      <h3>4.4 Create an Admin User</h3>
      <pre>
        <code>{`docker exec -it sol-web-django python manage.py createsuperuser`}</code>
      </pre>

      <hr />

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
          <tr>
            <td>
              <code>make key-pair</code>
            </td>
            <td>Generate SSH key pair for deployment</td>
          </tr>
          <tr>
            <td>
              <code>make deploy-cdk</code>
            </td>
            <td>Deploy AWS infrastructure</td>
          </tr>
        </tbody>
      </table>

      <hr />

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
        <li>
          Deploy to <a href="/docs/deployment">Production</a>
        </li>
      </ul>
    </div>
  );
}
