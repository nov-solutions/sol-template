export default function ProductionPage() {
  return (
    <div>
      <h1>Production Deployment</h1>
      <p className="lead">
        Deploy Sol to production using AWS CDK for infrastructure provisioning.
      </p>

      <h2>Deployment Options</h2>
      <p>Sol supports multiple deployment strategies:</p>
      <ul>
        <li>
          <strong>AWS EC2</strong> (included) - Single server deployment with
          Docker Compose
        </li>
        <li>
          <strong>AWS ECS</strong> - Container orchestration for scaling
        </li>
        <li>
          <strong>Kubernetes</strong> - For complex multi-service deployments
        </li>
      </ul>

      <h2>AWS EC2 Deployment (CDK)</h2>
      <p>Sol includes AWS CDK infrastructure code for deploying to EC2.</p>

      <h3>Prerequisites</h3>
      <ul>
        <li>AWS CLI configured with credentials</li>
        <li>
          AWS CDK installed: <code>npm install -g aws-cdk</code>
        </li>
        <li>A registered domain name</li>
      </ul>

      <h3>1. Generate SSH Key Pair</h3>
      <pre>
        <code>{`make key-pair`}</code>
      </pre>
      <p>This creates an EC2 key pair for SSH access to your server.</p>

      <h3>2. Configure Environment</h3>
      <p>
        Update <code>cdk/lib/config.ts</code> with your settings:
      </p>
      <pre>
        <code>{`export const config = {
  domainName: "yourdomain.com",
  instanceType: "t3.small",
  region: "us-east-1",
  // ...
};`}</code>
      </pre>

      <h3>3. Deploy Infrastructure</h3>
      <pre>
        <code>{`make deploy-cdk`}</code>
      </pre>
      <p>This provisions:</p>
      <ul>
        <li>EC2 instance with Docker</li>
        <li>Application Load Balancer</li>
        <li>RDS PostgreSQL database</li>
        <li>ElastiCache Redis</li>
        <li>SSL certificate (via ACM)</li>
        <li>Security groups</li>
      </ul>

      <h3>4. SSH into Server</h3>
      <pre>
        <code>{`make ssh`}</code>
      </pre>

      <h2>Production Checklist</h2>

      <h3>Security</h3>
      <ul>
        <li>
          <input type="checkbox" readOnly /> Generate new{" "}
          <code>DJANGO_SECRET_KEY</code>
        </li>
        <li>
          <input type="checkbox" readOnly /> Set strong database passwords
        </li>
        <li>
          <input type="checkbox" readOnly /> Configure HTTPS (SSL certificate)
        </li>
        <li>
          <input type="checkbox" readOnly /> Set <code>ENVIRONMENT=prod</code>
        </li>
        <li>
          <input type="checkbox" readOnly /> Enable CORS only for your domain
        </li>
        <li>
          <input type="checkbox" readOnly /> Configure CSP headers
        </li>
      </ul>

      <h3>Performance</h3>
      <ul>
        <li>
          <input type="checkbox" readOnly /> Enable database connection pooling
        </li>
        <li>
          <input type="checkbox" readOnly /> Configure Redis for caching
        </li>
        <li>
          <input type="checkbox" readOnly /> Set up CDN for static assets
        </li>
        <li>
          <input type="checkbox" readOnly /> Enable gzip compression
        </li>
      </ul>

      <h3>Monitoring</h3>
      <ul>
        <li>
          <input type="checkbox" readOnly /> Configure Sentry for error tracking
        </li>
        <li>
          <input type="checkbox" readOnly /> Set up CloudWatch or similar for
          logs
        </li>
        <li>
          <input type="checkbox" readOnly /> Configure uptime monitoring
        </li>
        <li>
          <input type="checkbox" readOnly /> Set up database backups
        </li>
      </ul>

      <h3>Third-Party Services</h3>
      <ul>
        <li>
          <input type="checkbox" readOnly /> Switch to live Stripe keys
        </li>
        <li>
          <input type="checkbox" readOnly /> Configure production webhook
          endpoint
        </li>
        <li>
          <input type="checkbox" readOnly /> Set up transactional email
          (SendGrid, SES, etc.)
        </li>
        <li>
          <input type="checkbox" readOnly /> Configure Google OAuth redirect
          URIs
        </li>
      </ul>

      <h2>Environment Variables</h2>
      <p>Production environment variables:</p>

      <pre>
        <code>{`# Required
ENVIRONMENT=prod
SITE_DOMAIN=yourdomain.com
DJANGO_SECRET_KEY=<generate-new-key>

# Database (use RDS endpoint)
POSTGRES_HOST=your-rds-endpoint.rds.amazonaws.com
POSTGRES_PASSWORD=<strong-password>

# Redis (use ElastiCache endpoint)
REDIS_HOST=your-elasticache-endpoint

# Stripe (live keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<your-api-key>

# Monitoring
SENTRY_DSN=https://...@sentry.io/...`}</code>
      </pre>

      <h2>Nginx Production Config</h2>
      <pre>
        <code>{`server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location /api {
        proxy_pass http://django:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`}</code>
      </pre>

      <h2>Database Migrations</h2>
      <p>Run migrations on deployment:</p>
      <pre>
        <code>{`# SSH into server
make ssh

# Run migrations
docker exec -it app-django python manage.py migrate`}</code>
      </pre>

      <h2>Zero-Downtime Deployments</h2>
      <pre>
        <code>{`# Pull latest code
git pull origin main

# Pull new images
docker compose pull

# Restart with new images (minimal downtime)
docker compose up -d --no-deps --build django nextjs

# Run migrations
docker exec -it app-django python manage.py migrate`}</code>
      </pre>

      <h2>Backup Strategy</h2>
      <pre>
        <code>{`# Database backup (run daily via cron)
pg_dump -h $POSTGRES_HOST -U postgres sol > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/`}</code>
      </pre>

      <h2>Scaling</h2>
      <p>For higher traffic, consider:</p>
      <ul>
        <li>
          <strong>Horizontal scaling</strong> - Multiple EC2 instances behind a
          load balancer
        </li>
        <li>
          <strong>Database scaling</strong> - RDS read replicas or larger
          instance
        </li>
        <li>
          <strong>Caching</strong> - Redis caching for frequently accessed data
        </li>
        <li>
          <strong>CDN</strong> - CloudFront for static assets and API caching
        </li>
      </ul>

      <h2>Monitoring & Alerts</h2>
      <pre>
        <code>{`# CloudWatch metrics to monitor:
- CPU utilization > 80%
- Memory utilization > 80%
- Disk usage > 80%
- 5xx errors > threshold
- Response time > threshold`}</code>
      </pre>

      <h2>Troubleshooting</h2>
      <pre>
        <code>{`# Check service status
docker compose ps

# View logs
docker compose logs -f --tail=100

# Check disk space
df -h

# Check memory
free -m

# Check running processes
htop`}</code>
      </pre>
    </div>
  );
}
