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

```bash
make dev          # Start development environment (builds and runs all containers)
make test         # Run Django tests inside container
make drop-db      # Stop containers and remove database volume
make init-mig     # Initialize migrations for user and admin apps
make mk-mig       # Create and apply new migrations
make key-pair     # Generate AWS EC2 key pair
make deploy-cdk   # Deploy infrastructure to AWS
make ssh          # SSH into production EC2 instance
make venv         # Create Python virtual environment
```

Frontend linting: `cd nextjs && npm run lint`

## Django Settings System

**This is critical to understand.** Settings are NOT in a single `settings.py` file. They are split into component modules under `web/settings/components/` and dynamically flattened into the root settings namespace.

**How it works:**
- `web/settings/__init__.py` imports all component modules from `web/settings/components/`
- `web/settings/utils.py` provides `flatten_module_attributes()` which proxies attribute access so Django sees a flat namespace
- Each component file is a standalone settings module (e.g., `base.py`, `redis.py`, `sentry.py`)

**Component files:**
- `base.py` — Core config: INSTALLED_APPS, MIDDLEWARE, DATABASES, AUTH, TEMPLATES
- `allauth.py` — Django-allauth + Google OAuth configuration
- `logging_settings.py` — structlog JSON logging (note: NOT `logging.py`)
- `mail.py` — SendGrid SMTP email settings
- `metrics.py` — Prometheus metrics
- `redis.py` — Redis cache and session backend
- `sentry.py` — Sentry error tracking with event filtering and data scrubbing
- `spectacular.py` — DRF Spectacular OpenAPI docs
- `stripe.py` — Stripe payment settings
- `user.py` — Custom user model setting (`AUTH_USER_MODEL`)

**Adding a new settings component:** Create a new `.py` file in `web/settings/components/`. It will be automatically picked up — no registration needed. Use `python-decouple` `config()` for env vars.

**Environment detection:** `ENVIRONMENT=dev` → DEBUG=True, `ENVIRONMENT=prod` → DEBUG=False.

## Custom User Model

The user model (`web/user/models.py`) uses `AbstractBaseUser` + `PermissionsMixin`, NOT Django's default User.

**Fields:** `email` (unique, USERNAME_FIELD), `password` (nullable — OAuth users have no password), `is_staff`, `is_superuser`, `email_verified`, `email_verified_at`, `created_at`

**Manager:** `web/user/managers.py` — `UserManager` with `create_user(email, password)` and `create_superuser(email, password)`.

**Important:** `groups` and `user_permissions` are set to None (disabled). Email is the sole identifier — there is no username field.

## Authentication System

**App:** `web/authapi/`

**Session-based auth** (not JWT). Django sessions with `sessionid` cookie. CSRF protected via `X-CSRFToken` header.

**Endpoints:**
| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/register/` | POST | Public | Register with email + password |
| `/api/auth/login/` | POST | Public | Login, returns session |
| `/api/auth/logout/` | POST | Auth | Clear session |
| `/api/auth/user/` | GET | Auth | Current user info |
| `/api/auth/validate/` | GET | Public | Check session validity |
| `/api/auth/change-password/` | POST | Auth | Change password |
| `/api/auth/delete-account/` | POST | Auth | Delete account |
| `/api/auth/forgot-password/` | POST | Public | Request reset token |
| `/api/auth/reset-password/` | POST | Public | Reset with token |
| `/api/auth/verify-email/<token>/` | GET | Public | Verify email |
| `/api/auth/resend-verification/` | POST | Auth | Resend verification |
| `/api/auth/google/login/` | GET | Public | Google OAuth redirect |
| `/api/auth/google/callback/` | GET | Public | Google OAuth callback |

**Token models** (`web/authapi/models.py`): `EmailVerificationToken` (7-day TTL) and `PasswordResetToken` (1-hour TTL). Both use `secrets.token_urlsafe(32)`.

**Google OAuth:** Uses django-allauth with custom adapters in `web/authapi/adapters.py`. Social accounts auto-connect by email and mark emails as verified.

**Security:** Forgot password returns success regardless of email existence (prevents enumeration).

## Frontend Auth

**Auth Context:** `nextjs/src/contexts/auth-context.tsx` — React Context providing `user`, `loading`, `login()`, `register()`, `logout()`, `refreshUser()`. Checks auth on mount via `/api/auth/user/`. Auto-logs out on 401/403.

**Axios Client:** `nextjs/src/lib/axiosClient.ts` — Base URL `/api`, `withCredentials: true`, auto-attaches `X-CSRFToken` from cookie.

**Middleware:** `nextjs/src/middleware.ts` — Protects `/dashboard` routes by checking `sessionid` cookie. Redirects to `/login?redirect=/path`.

## Billing & Stripe

**App:** `web/billing/`

**Models:**
- `StripeCustomer` — OneToOne to User, stores `stripe_customer_id`. Properties: `has_active_subscription`, `active_subscription`
- `Subscription` — ForeignKey to StripeCustomer. Statuses: trialing, active, past_due, canceled, unpaid. Properties: `is_active`, `is_trialing`, `days_until_period_end`

**Views** (`web/billing/views.py`): `create_checkout_session`, `create_portal_session`, `subscription_status`, `cancel_subscription`, `reactivate_subscription`, `stripe_webhook`

**Utils** (`web/billing/utils.py`): `get_or_create_stripe_customer(user)`, `sync_subscription_from_stripe(stripe_subscription_id)`, `check_subscription_access(user, required_status)`

**Frontend hook:** `nextjs/src/hooks/use-subscription.ts` — `useSubscription()` provides subscription state, `openBillingPortal()`, `cancelSubscription()`, `reactivateSubscription()`

## Celery Task Queue

**Config:** `web/celeryapp/celery_config.py` — Redis broker (db 0), redbeat scheduler (db 1)

**Instance:** `web/celeryapp/celery.py` — `Celery("web")`, autodiscovers tasks from INSTALLED_APPS

**Current tasks** (`web/celeryapp/tasks.py` + `web/authapi/tasks.py`):
- `send_verification_email(user_id, ip_address=None)` — Sends verification link
- `send_password_reset_email(user_id)` — Sends reset link
- `cleanup_unverified_accounts()` — Daily at 3 AM, deletes 7-day unverified users

**Beat schedule** defined in `celery_config.py`.

## Nginx Routing

Config: `nginx/dev/site.conf` (dev), `nginx/prod/site.conf` (prod), `nginx/staging/site.conf` (staging)

Rate limiting: 10 req/sec, burst 20.

**Routing rules:**
- `/api/healthcheck/` → django (no rate limit)
- `/api/` → django (rate limited, WebSocket upgrade headers)
- `/static/` → Django static files (`/app/static/`)
- `/_next/static/`, `/_next/webpack-hmr`, `/assets/` → nextjs
- `/` → nextjs (catch-all)

**When adding new API endpoints:** They automatically route through nginx if they start with `/api/`. No nginx config changes needed.

## Frontend Structure

**App Router** (Next.js 13+): `nextjs/src/app/`

**Route Groups:**
- `(auth)/` — Auth pages: login, register, forgot-password, verify-email/[token], reset-password/[token]. Uses minimal auth layout.
- `(dashboard)/` — Protected pages: dashboard, dashboard/settings, dashboard/billing. Uses sidebar layout with auth check.
- Public routes: `/`, `/pricing`, `/privacy`, `/terms`, `/docs`

**Key directories:**
- `src/components/ui/` — shadcn/ui primitives (button, card, input, dialog, etc.)
- `src/components/marketing/` — Landing page sections
- `src/components/dashboard/` — Dashboard sidebar and nav
- `src/components/auth/` — Verification banner
- `src/hooks/` — Custom hooks (useAuth, useSubscription, useCsrfToken)
- `src/contexts/` — React contexts (auth-context)
- `src/providers/` — Theme provider (next-themes, dark mode default), progress bar
- `src/constants.ts` — SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, PAGES

## Backend App Structure

Each Django app follows this structure:
```
appname/
├── models.py        # Data models
├── views.py         # API views (DRF APIView or @api_view)
├── serializers.py   # DRF serializers
├── urls.py          # URL patterns
├── admin.py         # Admin registrations
├── tasks.py         # Celery tasks (if applicable)
└── tests/           # Test directory
```

**Installed apps:** `core`, `user`, `authapi`, `billing`, `celeryapp`, `spectacular`, `mail`, `metrics`

**API conventions:**
- All responses are JSON only (`JSONRenderer` exclusively)
- Use `AllowAny` for public endpoints, `IsAuthenticated` for protected
- API docs at `/api/docs/` (conditional on `PUBLIC_API` env var)
- Custom error handlers return JSON for 400, 403, 404, 500

## Adding New Features

### New Django App
1. Create app directory under `web/` following the structure above
2. Add to `INSTALLED_APPS` in `web/settings/components/base.py`
3. Add URL patterns in `web/urls.py` under the `/api/` prefix
4. Run `make mk-mig` to create and apply migrations

### New Settings Component
1. Create `.py` file in `web/settings/components/` — automatically loaded
2. Use `config("VAR_NAME")` from python-decouple for env vars
3. Add env vars to `.env` and `docker-compose.yaml`

### New Frontend Route
1. Create directory in `nextjs/src/app/` (use route groups for layouts)
2. Add `page.tsx` (and optionally `layout.tsx`)
3. Protected routes go under `(dashboard)/`, public under root or `(auth)/`

### New Celery Task
1. Define task in the app's `tasks.py` with `@shared_task` decorator
2. Import in `web/celeryapp/tasks.py` to ensure discovery
3. For scheduled tasks, add to `beat_schedule` in `web/celeryapp/celery_config.py`

## Naming Conventions

**Python:** Apps = snake_case, Models = PascalCase, Views = PascalCase + "View" suffix, Serializers = PascalCase + "Serializer" suffix, functions/tasks = snake_case

**TypeScript:** Components = PascalCase, hooks = camelCase with "use" prefix, context files = kebab-case, types/interfaces = PascalCase

**Env vars:** UPPERCASE_WITH_UNDERSCORES. Frontend-exposed vars use `NEXT_PUBLIC_` prefix.

## Docker Services

All services defined in `docker-compose.yaml` with environment-specific overrides (`docker-compose.dev.yaml`, `docker-compose.prod.yaml`, `docker-compose.staging.yaml`).

Container names use `{{PROJECT_SLUG}}` prefix (replaced during project setup via `setup_project.py`).

**Health checks:** postgres uses `pg_isready`, redis uses `redis-cli ping`, nextjs uses `wget --spider`. Django depends on postgres healthy, nextjs depends on django healthy.

## Environment Variables

Set in `web/.env` and `docker-compose.yaml`. Key variables:
- `ENVIRONMENT` (dev/prod), `SECRET_KEY`, `SITE_DOMAIN`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `REDIS_HOST`, `REDIS_PASSWORD`
- `EMAIL_HOST_USER`, `EMAIL_PASSWORD` (SendGrid)
- `SENTRY_DSN`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SITE_BASE_DOMAIN`

## Template Variables

This is a template project. Placeholders like `{{PROJECT_SLUG}}`, `{{DOMAIN_PRODUCTION}}`, `{{TAGLINE}}`, etc. are replaced by `setup_project.py` during initial setup. The test at `tests/check_template_variables.py` validates all placeholders are defined.
