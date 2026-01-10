export default function QuickStartPage() {
  return (
    <div>
      <h1>Quick Start</h1>
      <p className="lead">
        Get your new project set up and running from the Sol template.
      </p>

      <h2>Prerequisites</h2>

      <h3>Local Tools</h3>
      <ul>
        <li>Docker and Docker Compose</li>
        <li>Git</li>
        <li>Node.js 18+</li>
        <li>Python 3.10+</li>
      </ul>

      <h3>Accounts Required</h3>
      <ul>
        <li>
          <strong>GitHub</strong> - Repository hosting and CI/CD
        </li>
        <li>
          <strong>AWS</strong> - Production infrastructure (EC2, VPC)
        </li>
        <li>
          <strong>Stripe</strong> - Payment processing and subscriptions
        </li>
        <li>
          <strong>Google Cloud</strong> - OAuth authentication (optional)
        </li>
        <li>
          <strong>SendGrid</strong> - Transactional email (or other SMTP
          provider)
        </li>
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

      <h3>2.2 Create Branch Structure</h3>
      <p>Sol uses a two-branch strategy for deployments:</p>
      <ul>
        <li>
          <code>master</code> - Production environment
        </li>
        <li>
          <code>develop</code> - Development/staging environment
        </li>
      </ul>
      <p>Create the develop branch:</p>
      <pre>
        <code>{`git checkout -b develop
git push -u origin develop`}</code>
      </pre>

      <h3>2.3 Set Up Branch Protection Rules</h3>
      <p>
        Go to your repository → <strong>Settings</strong> →{" "}
        <strong>Branches</strong> → <strong>Add branch protection rule</strong>
      </p>
      <p>
        For both <code>master</code> and <code>develop</code> branches, enable:
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
      <p>
        <strong>Workflow:</strong> Create feature branches from{" "}
        <code>develop</code>, merge to <code>develop</code> for staging, then
        merge <code>develop</code> to <code>master</code> for production
        releases.
      </p>

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
        Create a <code>.env</code> file in the project root with the following
        variables:
      </p>
      <pre>
        <code>{`# App Configuration
ENVIRONMENT=dev
NEXT_PUBLIC_SITE_NAME=
NEXT_PUBLIC_SITE_BASE_DOMAIN=
SITE_DOMAIN=

# Django
SECRET_KEY=
DJANGO_SETTINGS_MODULE=settings

# Database
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=

# Email (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=`}</code>
      </pre>

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

      <h2>Part 5: Production Deployment (AWS)</h2>

      <h3>5.1 Prerequisites</h3>
      <p>Install the required CLI tools:</p>
      <ul>
        <li>
          <a
            href="https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
            target="_blank"
            rel="noopener"
          >
            AWS CLI
          </a>{" "}
          - Configure with <code>aws configure</code>
        </li>
        <li>
          <a
            href="https://docs.aws.amazon.com/cdk/latest/guide/cli.html"
            target="_blank"
            rel="noopener"
          >
            AWS CDK
          </a>{" "}
          - Install with <code>npm install -g aws-cdk</code>
        </li>
      </ul>

      <h3>5.2 Configure AWS Account</h3>
      <p>
        Update <code>cdk/app.py</code> with your AWS account ID and region:
      </p>
      <pre>
        <code>{`CDK_ACCOUNT = "123456789012"  # Your AWS account ID
CDK_REGION = "us-east-1"       # Your preferred region`}</code>
      </pre>

      <h3>5.3 Generate SSH Key Pair</h3>
      <pre>
        <code>{`make key-pair
chmod 400 app.pem`}</code>
      </pre>
      <p>
        Add the contents of <code>app.pem</code> to your GitHub secrets as{" "}
        <code>SSH_PRIVATE_KEY</code>.
      </p>

      <h3>5.4 Deploy Infrastructure</h3>
      <pre>
        <code>{`make deploy-cdk`}</code>
      </pre>
      <p>
        This provisions an EC2 instance, security groups, and other AWS
        resources. The instance IP will be saved to{" "}
        <code>cdk/outputs.json</code>.
      </p>

      <h3>5.5 Update Server IPs</h3>
      <p>
        Copy the IP address from <code>cdk/outputs.json</code> and update{" "}
        <code>.github/workflows/deploy.yaml</code>:
      </p>
      <pre>
        <code>{`echo "SERVER_IP=<your-production-ip>" >> $GITHUB_ENV  # Line 26
echo "SERVER_IP=<your-staging-ip>" >> $GITHUB_ENV    # Line 28`}</code>
      </pre>

      <h3>5.6 Configure Domain</h3>
      <ol>
        <li>Acquire a domain name from your registrar</li>
        <li>
          Add an <strong>A record</strong>: Host <code>@</code> → Your EC2 IP
        </li>
        <li>
          Add a <strong>CNAME record</strong>: Host <code>www</code> → Your
          domain
        </li>
        <li>
          Update domain references in <code>nginx/prod/site.conf</code>
        </li>
      </ol>

      <h3>5.7 Generate SSL Certificate</h3>
      <p>After your first deployment to master:</p>
      <pre>
        <code>{`make ssh
cd /app
chmod +x cert.sh
./cert.sh`}</code>
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
