export default function DockerPage() {
  return (
    <div>
      <h1>Docker</h1>
      <p className="lead">
        Sol uses Docker and Docker Compose to manage development and production
        environments.
      </p>

      <h2>Architecture</h2>
      <p>The application runs as a set of interconnected containers:</p>

      <pre>
        <code>{`┌─────────────────────────────────────────────────┐
│                    nginx (:80)                   │
│              Reverse Proxy / Router              │
└─────────────────────────────────────────────────┘
                    │             │
         ┌──────────┘             └──────────┐
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│  nextjs (:3000) │                 │  django (:8000) │
│    Frontend     │                 │    Backend      │
└─────────────────┘                 └─────────────────┘
                                             │
                    ┌────────────────────────┼───────────┐
                    ▼                        ▼           ▼
          ┌─────────────────┐      ┌────────────┐  ┌──────────┐
          │ postgres (:5432)│      │redis (:6379│  │  worker  │
          │    Database     │      │   Cache    │  │  Celery  │
          └─────────────────┘      └────────────┘  └──────────┘`}</code>
      </pre>

      <h2>Services</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Image</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>nginx</code>
            </td>
            <td>nginx:alpine</td>
            <td>Reverse proxy, routes /api to Django, / to Next.js</td>
          </tr>
          <tr>
            <td>
              <code>nextjs</code>
            </td>
            <td>Custom</td>
            <td>Next.js frontend server</td>
          </tr>
          <tr>
            <td>
              <code>django</code>
            </td>
            <td>Custom</td>
            <td>Django REST API server</td>
          </tr>
          <tr>
            <td>
              <code>postgres</code>
            </td>
            <td>postgres:16</td>
            <td>PostgreSQL database</td>
          </tr>
          <tr>
            <td>
              <code>redis</code>
            </td>
            <td>redis:alpine</td>
            <td>Cache, session store, message broker</td>
          </tr>
          <tr>
            <td>
              <code>worker</code>
            </td>
            <td>Custom (Django)</td>
            <td>Celery background worker</td>
          </tr>
          <tr>
            <td>
              <code>scheduler</code>
            </td>
            <td>Custom (Django)</td>
            <td>Celery beat scheduler</td>
          </tr>
        </tbody>
      </table>

      <h2>Common Commands</h2>
      <pre>
        <code>{`# Start all services
make dev

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f django

# Rebuild containers
docker compose up --build

# Remove all data (including database)
make drop-db`}</code>
      </pre>

      <h2>Accessing Containers</h2>
      <pre>
        <code>{`# Shell into Django container
docker exec -it newsolwebapp-web-django bash

# Django management commands
docker exec -it newsolwebapp-web-django python manage.py shell
docker exec -it newsolwebapp-web-django python manage.py createsuperuser

# Access PostgreSQL
docker exec -it newsolwebapp-db-postgres psql -U postgres -d sol

# Access Redis CLI
docker exec -it newsolwebapp-cache-redis redis-cli`}</code>
      </pre>

      <h2>Docker Compose Configuration</h2>
      <pre>
        <code>{`# docker-compose.yaml (simplified)
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - nextjs
      - django

  nextjs:
    build:
      context: ./nextjs
      dockerfile: Dockerfile
    volumes:
      - ./nextjs:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development

  django:
    build:
      context: ./web
      dockerfile: Dockerfile
    volumes:
      - ./web:/app
    env_file:
      - .env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=sol
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}

  redis:
    image: redis:alpine

  worker:
    build:
      context: ./web
    command: celery -A celeryapp worker -l info
    depends_on:
      - django
      - redis

volumes:
  postgres_data:`}</code>
      </pre>

      <h2>Nginx Configuration</h2>
      <pre>
        <code>{`# nginx/nginx.conf
upstream nextjs {
    server nextjs:3000;
}

upstream django {
    server django:8000;
}

server {
    listen 80;

    # API routes go to Django
    location /api {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Everything else goes to Next.js
    location / {
        proxy_pass http://nextjs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`}</code>
      </pre>

      <h2>Development vs Production</h2>
      <h3>Development</h3>
      <ul>
        <li>Hot reloading enabled for both frontend and backend</li>
        <li>Source code mounted as volumes</li>
        <li>Debug mode enabled</li>
        <li>No SSL</li>
      </ul>

      <h3>Production</h3>
      <ul>
        <li>Optimized builds (no hot reloading)</li>
        <li>Code baked into images</li>
        <li>Debug mode disabled</li>
        <li>SSL via reverse proxy</li>
        <li>Gunicorn for Django</li>
      </ul>

      <h2>Building for Production</h2>
      <pre>
        <code>{`# Build production images
docker compose -f docker-compose.prod.yaml build

# Push to container registry
docker tag myapp-django:latest registry.example.com/myapp-django:latest
docker push registry.example.com/myapp-django:latest`}</code>
      </pre>

      <h2>Troubleshooting</h2>
      <h3>Container won&apos;t start</h3>
      <pre>
        <code>{`# Check logs
docker compose logs django

# Check if ports are in use
lsof -i :80
lsof -i :5432`}</code>
      </pre>

      <h3>Database connection issues</h3>
      <pre>
        <code>{`# Ensure postgres is healthy
docker compose ps postgres

# Check postgres logs
docker compose logs postgres`}</code>
      </pre>

      <h3>Reset everything</h3>
      <pre>
        <code>{`# Stop containers, remove volumes, rebuild
docker compose down -v
docker compose up --build`}</code>
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
