# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Sol is a full-stack web application template with a microservices-oriented Docker architecture:

- **Frontend**: Next.js (TypeScript/React) with Tailwind CSS and shadcn/ui components
- **Backend**: Django REST API with modular app structure
- **Task Queue**: Celery with Redis broker for asynchronous tasks
- **Database**: PostgreSQL with Django ORM
- **Reverse Proxy**: Nginx routing between services
- **Infrastructure**: AWS CDK for cloud deployment

## Development Commands

### Local Development

```bash
make dev          # Start development environment (builds and runs all containers)
make test         # Run Django tests inside container
make drop-db      # Stop containers and remove database volume
```

### Database Operations

```bash
make init-mig     # Initialize migrations for user and admin apps
make mk-mig       # Create and apply new migrations
```

### Production Deployment

```bash
make key-pair     # Generate AWS EC2 key pair
make deploy-cdk   # Deploy infrastructure to AWS
make ssh          # SSH into production EC2 instance
```

### Environment Setup

```bash
make venv         # Create Python virtual environment
```

## Key Architectural Patterns

### Django Settings Structure

Settings are modularized in `web/settings/components/` with:

- `base.py`: Core Django configuration
- `logging.py`: Structured logging setup
- `mail.py`: Email configuration
- `redis.py`: Cache and session configuration
- `sentry.py`: Error tracking
- `spectacular.py`: OpenAPI documentation
- `user.py`: Custom user model settings

Settings are dynamically flattened via `settings.utils.flatten_module_attributes()`.

### Container Architecture

The application runs as interconnected Docker services:

- `nextjs`: Frontend server (port 3000)
- `django`: Backend API (port 8000)
- `nginx`: Reverse proxy (ports 80/443)
- `postgres`: Database (port 5432)
- `redis`: Cache/message broker (port 6379)
- `scheduler`: Celery beat scheduler
- `worker`: Celery task worker

### Frontend Structure

Next.js app router with:

- `src/app/`: Route definitions and layouts
- `src/components/marketing/`: Landing page components
- `src/hooks/`: React hooks (e.g., `useCsrfToken`)
- `src/providers/`: Context providers
- `src/constants.ts`: Shared constants

### Backend Apps

Django follows a modular app structure:

- `core/`: Core business logic and health checks
- `user/`: Custom user management with managers
- `celeryapp/`: Task scheduling configuration
- `spectacular/`: API documentation
- `mail/`: Email utilities

## Lint Commands

Frontend linting:

```bash
cd nextjs && npm run lint
```

## Test Commands

Django tests:

```bash
make test
# Or directly: docker exec -it sol-web-django python manage.py test
```

## Development Notes

- Environment variables are set in `.env` file and `docker-compose.yaml`
- Django uses `DJANGO_SETTINGS_MODULE=settings` pointing to the modular settings
- The frontend communicates with Django API via the nginx reverse proxy
- Celery tasks are defined in `web/celeryapp/tasks.py`
- Static files are served from `web/static/` directory
