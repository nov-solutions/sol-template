# CLAUDE.md

## What This Project Is

Sol-template is a **template repository** — it is not deployed directly. It serves as the blueprint that the [Sol Platform](https://github.com/nov-solutions/sol-web) clones and customizes to generate new web application projects. Placeholders like `{{PROJECT_NAME}}` are replaced with real values by `setup_project.py` during project generation.

**Stack**: Next.js 16 + React 19 frontend, Django 5.1 REST API backend, Celery + Redis task queue, PostgreSQL, Nginx reverse proxy, AWS CDK infrastructure.

## Development Commands

```bash
make dev          # Start all containers with hot-reload (docker-compose.dev.yaml overlay)
make test         # Run Django tests: docker exec -it {{PROJECT_SLUG}}-django python manage.py test
make prod         # Build and start production containers
make drop-db      # Stop containers and remove database volume
make init-mig     # Initialize migrations for user and admin apps
make mk-mig       # Create and apply new migrations
make key-pair     # Generate AWS EC2 SSH key pair (creates app.pem)
make deploy-cdk   # Deploy infrastructure to AWS via CDK
make ssh          # SSH into production EC2 instance
make venv         # Create Python virtual environment
cd nextjs && npm run lint  # Frontend linting
```

## Project Structure

```
├── nextjs/                    # Next.js 16 frontend (TypeScript, React 19)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/        # Auth routes: login, register, forgot-password, reset-password, verify-email
│   │   │   ├── (dashboard)/   # Protected routes: dashboard, settings, billing
│   │   │   ├── docs/          # Documentation pages
│   │   │   ├── pricing/       # Pricing page
│   │   │   ├── privacy/       # Privacy policy
│   │   │   ├── terms/         # Terms of service
│   │   │   ├── layout.tsx     # Root layout with metadata
│   │   │   └── page.tsx       # Landing page
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components (button, card, input, etc.)
│   │   │   ├── auth/          # Auth-related components
│   │   │   ├── dashboard/     # Sidebar navigation
│   │   │   └── marketing/     # Landing page sections
│   │   ├── hooks/             # Custom hooks (use-auth, use-subscription, use-csrf-token)
│   │   ├── contexts/          # Auth context (global user state)
│   │   ├── providers/         # Theme, progress bar providers
│   │   ├── lib/
│   │   │   ├── axiosClient.ts # Axios instance: baseURL="/api", withCredentials=true
│   │   │   └── utils.ts       # cn() utility (clsx + tailwind-merge)
│   │   └── constants.ts       # Site name, domain, contact info, page definitions
│   ├── eslint.config.mjs      # ESLint config
│   └── tailwind.config.js
│
├── web/                       # Django backend (Python 3.13)
│   ├── settings/
│   │   ├── components/        # Modular settings files (see below)
│   │   ├── __init__.py        # Imports and flattens all component settings
│   │   └── utils.py           # flatten_module_attributes() utility
│   ├── core/                  # Health check (/api/healthcheck/), CSRF token endpoint
│   ├── user/                  # Custom User model (email-based auth, no username)
│   ├── authapi/               # Auth views, serializers, tokens, Celery tasks
│   ├── billing/               # Stripe subscriptions, plan tiers, webhooks
│   ├── metrics/               # Prometheus metrics collection
│   ├── mail/                  # Email utilities (SendGrid prod, file-based dev)
│   ├── celeryapp/             # Celery config, beat schedule
│   ├── spectacular/           # OpenAPI docs (drf-spectacular)
│   └── requirements.txt
│
├── nginx/                     # Nginx configs (dev/prod/staging site.conf)
├── cdk/                       # AWS CDK: EC2 t2.medium, EBS 50GiB, Elastic IP
├── templates/workflows/       # GitHub Actions workflows copied during setup
├── tests/                     # Template variable validation tests + fixtures
├── docker-compose.yaml        # Base services definition
├── docker-compose.dev.yaml    # Dev overlay (volume mounts, hot-reload)
├── docker-compose.prod.yaml   # Prod overlay (optimized builds)
├── docker-compose.staging.yaml
├── setup_project.py           # Template variable replacement script
├── template.config.json       # Configuration for setup script
├── Makefile
└── .env
```

## Template Variable System

This is the core mechanism of the template repo. All config values are expressed as `{{VARIABLE_NAME}}` placeholders throughout the codebase.

### How It Works

1. `template.config.json` holds project configuration values
2. `setup_project.py` reads the config and calls `build_replacements()` to map `{{VAR}}` → value
3. Every text file in the repo is scanned and placeholders are replaced in-place
4. `tests/check_template_variables.py` validates all used variables are defined (runs in CI)

### All Template Variables

| Variable | Source in config | Purpose |
|---|---|---|
| `{{PROJECT_NAME}}` | `project.name` | Display name |
| `{{PROJECT_SLUG}}` | `project.name_slug` | Container/service prefix (lowercase, hyphens) |
| `{{TAGLINE}}` | `branding.tagline` | Subtitle |
| `{{DESCRIPTION}}` | `branding.description` | Project description |
| `{{KEYWORDS}}` | `branding.keywords` | Comma-separated keywords |
| `{{FOUNDING_YEAR}}` | `branding.founding_year` | Year founded |
| `{{CONTACT_EMAIL}}` | `contact.email` | Support email |
| `{{DOMAIN_PRODUCTION}}` | `domains.production` | Production domain |
| `{{DOMAIN_STAGING}}` | `domains.staging` | Staging domain |
| `{{SOCIAL_GITHUB}}` | `social.github` | GitHub URL |
| `{{SOCIAL_TWITTER}}` | `social.twitter` | Twitter/X URL |
| `{{SOCIAL_LINKEDIN}}` | `social.linkedin` | LinkedIn URL |
| `{{AWS_ACCOUNT_ID}}` | `aws.account_id` | AWS account number |
| `{{AWS_REGION}}` | `aws.region` | AWS region |
| `{{AWS_ACCESS_KEY_ID}}` | `aws.access_key_id` | AWS access key (optional) |
| `{{AWS_SECRET_ACCESS_KEY}}` | `aws.secret_access_key` | AWS secret key (optional) |
| `{{DB_NAME}}` | `database.name` | PostgreSQL database name |
| `{{DB_USER}}` | `database.user` | PostgreSQL username |
| `{{DB_PASSWORD}}` | `database.password` | PostgreSQL password |
| `{{REDIS_PASSWORD}}` | `database.redis_password` | Redis password |
| `{{PRODUCTION_IP}}` | `deployment.production_ip` | EC2 production IP |
| `{{STAGING_IP}}` | `deployment.staging_ip` | EC2 staging IP |
| `{{DJANGO_SECRET_KEY}}` | Auto-generated | Django secret key |
| `{{STRIPE_PUBLISHABLE_KEY}}` | `stripe.publishable_key` | Stripe public key |
| `{{STRIPE_SECRET_KEY}}` | `stripe.secret_key` | Stripe secret key |
| `{{STRIPE_WEBHOOK_SECRET}}` | `stripe.webhook_secret` | Stripe webhook secret |
| `{{STRIPE_PRO_PRICE_ID}}` | `stripe.pro_price_id` | Stripe Pro tier price ID |
| `{{GOOGLE_CLIENT_ID}}` | `google_oauth.client_id` | Google OAuth client ID |
| `{{GOOGLE_CLIENT_SECRET}}` | `google_oauth.client_secret` | Google OAuth secret |
| `{{GA_MEASUREMENT_ID}}` | `google_analytics.measurement_id` | Google Analytics ID |
| `{{SENDGRID_API_KEY}}` | `sendgrid.api_key` | SendGrid API key |
| `{{SENTRY_DSN}}` | `sentry.dsn` | Sentry error tracking DSN |

### setup_project.py

```bash
python setup_project.py              # Non-interactive (reads template.config.json)
python setup_project.py --interactive  # Interactive wizard
python setup_project.py --clean      # Remove template files after setup
```

**Excluded from processing**: `setup_project.py`, `template.config.json`, `template.schema.json`, `templates/`, `.git/`, binary files, `node_modules/`, `.next/`, `.venv/`, `cdk.out/`

**Workflow setup**: Also copies `templates/workflows/*.yaml` to `.github/workflows/` and removes the template repo's own `ci.yaml`.

### Adding a New Template Variable

1. Add the `{{VARIABLE}}` placeholder wherever needed in the codebase
2. Add the mapping in `build_replacements()` in `setup_project.py`
3. Add the config field in `template.config.json`
4. If using `--interactive`, add a prompt in `interactive_wizard()`
5. Run `python tests/check_template_variables.py` to verify (CI will also check)

## Django Settings System

**Critical**: Settings are NOT in a single `settings.py`. They are split across `web/settings/components/` and dynamically flattened into one namespace.

**How it works:**
- `web/settings/__init__.py` imports all component modules from `web/settings/components/`
- `web/settings/utils.py` provides `flatten_module_attributes()` which proxies attribute access
- Each component file is standalone — add a new `.py` file and it's auto-loaded

**Component files:**
- `base.py` — Core config: INSTALLED_APPS, MIDDLEWARE, DATABASES, AUTH, TEMPLATES
- `allauth.py` — Django-allauth + Google OAuth
- `logging_settings.py` — structlog JSON logging (note: NOT `logging.py` — that would shadow stdlib)
- `mail.py` — SendGrid SMTP email settings
- `metrics.py` — Prometheus metrics
- `redis.py` — Redis cache and session backend
- `sentry.py` — Sentry error tracking with event filtering
- `spectacular.py` — DRF Spectacular OpenAPI docs
- `stripe.py` — Stripe payment settings
- `user.py` — Custom user model setting (`AUTH_USER_MODEL`)

**Environment detection:** `ENVIRONMENT=dev` → DEBUG=True, `ENVIRONMENT=prod` → DEBUG=False.

## Custom User Model

`web/user/models.py` uses `AbstractBaseUser` + `PermissionsMixin`, NOT Django's default User.

**Fields:** `email` (unique, USERNAME_FIELD), `password` (nullable — OAuth users have no password), `is_staff`, `is_superuser`, `email_verified`, `email_verified_at`, `created_at`

**Manager:** `web/user/managers.py` — `create_user(email, password)` and `create_superuser(email, password)`.

**Important:** `groups` and `user_permissions` are set to None (disabled). Email is the sole identifier — no username field.

## Authentication System

**App:** `web/authapi/` — Session-based auth (not JWT). Django sessions with `sessionid` cookie. CSRF protected via `X-CSRFToken` header.

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

**Google OAuth:** django-allauth with custom adapters in `web/authapi/adapters.py`. Social accounts auto-connect by email and mark emails as verified.

**Security:** Forgot password returns success regardless of email existence (prevents enumeration).

## Billing & Stripe

**App:** `web/billing/`

**Models:**
- `StripeCustomer` — OneToOne to User, stores `stripe_customer_id`. Properties: `has_active_subscription`, `active_subscription`
- `Subscription` — ForeignKey to StripeCustomer. Statuses: trialing, active, past_due, canceled, unpaid. Properties: `is_active`, `is_trialing`, `days_until_period_end`

**Views** (`web/billing/views.py`): `create_checkout_session`, `create_portal_session`, `subscription_status`, `cancel_subscription`, `reactivate_subscription`, `stripe_webhook`

**Utils** (`web/billing/utils.py`): `get_or_create_stripe_customer(user)`, `sync_subscription_from_stripe(stripe_subscription_id)`, `check_subscription_access(user, required_status)`

**Frontend hook:** `nextjs/src/hooks/use-subscription.ts` — `useSubscription()` provides subscription state, `openBillingPortal()`, `cancelSubscription()`, `reactivateSubscription()`

## Frontend Patterns

### Routing

Uses Next.js App Router with route groups:
- `(auth)/*` — Login, register, password reset, email verification (public, minimal layout)
- `(dashboard)/*` — Dashboard, settings, billing (protected, sidebar layout)
- Public routes: `/`, `/pricing`, `/privacy`, `/terms`, `/docs`

Middleware at `src/middleware.ts` checks `sessionid` cookie for route protection. Redirects to `/login?redirect=/path`.

### State & API Communication

- **Auth context** (`src/contexts/auth-context.tsx`) — Global user state, provides `user`, `loading`, `login()`, `register()`, `logout()`, `refreshUser()`. Auto-logs out on 401/403.
- **Axios client** (`src/lib/axiosClient.ts`) — `baseURL="/api"`, `withCredentials=true`, auto-attaches `X-CSRFToken` from cookie.
- **Custom hooks** for all API interactions: `use-auth.ts`, `use-subscription.ts`, `use-csrf-token.ts`

### Styling

- Tailwind CSS with HSL CSS variable color system
- shadcn/ui "new-york" style with Radix UI primitives
- `cn()` utility for class merging (clsx + tailwind-merge)
- Dark mode forced via next-themes
- Fonts: Inter (sans), Roboto Mono (mono), Spectral (serif)
- Icons: Remix Icon (primary), Lucide (secondary)

## Backend Patterns

### App Structure

Each Django app follows:
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

### API Conventions

- All responses JSON only (`JSONRenderer` exclusively)
- `AllowAny` for public endpoints, `IsAuthenticated` for protected
- API docs at `/api/docs/` (conditional on `PUBLIC_API` env var)
- Custom error handlers return JSON for 400, 403, 404, 500
- Structured logging with `structlog` (not `print` or `logging`)

### URL Structure

```
/api/admin/          → Django admin
/api/healthcheck/    → Health check (no rate limit)
/api/csrf/           → CSRF token
/api/metrics/        → Prometheus
/api/auth/           → Authentication (13 endpoints)
/api/stripe/         → Billing & subscriptions
/api/docs/           → OpenAPI docs (conditional)
```

## Celery Task Queue

**Config:** `web/celeryapp/celery_config.py` — Redis broker (db 0), redbeat scheduler (db 1)

**Instance:** `web/celeryapp/celery.py` — `Celery("web")`, autodiscovers tasks from INSTALLED_APPS

**Current tasks** (`web/celeryapp/tasks.py` + `web/authapi/tasks.py`):
- `send_verification_email(user_id, ip_address=None)` — Sends verification link
- `send_password_reset_email(user_id)` — Sends reset link
- `cleanup_unverified_accounts()` — Daily at 3 AM, deletes 7-day unverified users

Beat schedule defined in `celery_config.py`.

## Nginx Routing

Configs: `nginx/dev/site.conf`, `nginx/prod/site.conf`, `nginx/staging/site.conf`

Rate limiting: 10 req/sec, burst 20. Healthcheck exempted.

**Routing rules:**
- `/api/healthcheck/` → django (no rate limit)
- `/api/` → django (rate limited, WebSocket upgrade headers)
- `/static/` → Django static files (`/app/static/`)
- `/_next/static/`, `/_next/webpack-hmr`, `/assets/` → nextjs (dev only for HMR)
- `/` → nextjs (catch-all)

New API endpoints automatically route through nginx if prefixed with `/api/`. No nginx config changes needed.

## Docker Services

| Service | Container Name | Port | Notes |
|---------|---------------|------|-------|
| nextjs | `{{PROJECT_SLUG}}-nextjs` | 3000 | Hot-reload in dev via volume mount |
| django | `{{PROJECT_SLUG}}-django` | 8000 | Daphne ASGI in prod, runserver in dev |
| nginx | `{{PROJECT_SLUG}}-nginx` | 80, 443 | Rate limiting: 10 req/s with burst 20 |
| postgres | `{{PROJECT_SLUG}}-postgres` | 5432 | PostgreSQL 17 Alpine, pgdata volume |
| redis | `{{PROJECT_SLUG}}-redis` | 6379 | Password-protected, Redis 7 Alpine |
| scheduler | `{{PROJECT_SLUG}}-scheduler` | — | Celery Beat with RedBeat scheduler |
| worker | `{{PROJECT_SLUG}}-worker` | — | Celery worker |

**Health checks:** postgres → `pg_isready`, redis → `redis-cli ping`, django → HTTP `/api/healthcheck/`, nextjs → `wget --spider`

**Dependency chain:** postgres → django → nextjs; redis + django → scheduler/worker

**Overlays:** `docker-compose.dev.yaml` adds volume mounts and `WATCHPACK_POLLING=true`. `docker-compose.prod.yaml` adds optimized builds. `docker-compose.staging.yaml` for staging.

## CI/CD Pipeline

**File:** `.github/workflows/ci.yaml` — Runs on PRs and pushes to master.

**Jobs (sequential dependency chain):**
1. **lint** — Runs all pre-commit hooks (prettier, eslint, tsc, black, isort, autoflake)
2. **template-validation** — Validates `setup_project.py` syntax, JSON configs, and runs `tests/check_template_variables.py`
3. **template-instantiation** (needs lint + validation) — Runs setup with test config, verifies no `{{VAR}}` remain, validates Python/YAML syntax, checks Next.js build
4. **docker-build** (needs instantiation) — Builds all Docker images in parallel
5. **integration-test** (needs docker-build, master only) — Starts containers, waits for health checks, runs Django test suite

**Workflow templates:** `templates/workflows/` contains the GitHub Actions workflows that get copied to `.github/workflows/` when a project is instantiated (replacing the template repo's `ci.yaml`).

## Pre-commit Hooks

Enforced via `.pre-commit-config.yaml`:

**Frontend:** Prettier → ESLint (with --fix) → TypeScript type check (`tsc --noEmit`)
**Backend:** Black → isort (black profile) → autoflake (remove unused imports/vars)
**General:** Merge conflict check, AWS credential detection, private key detection, trailing whitespace, end-of-file fixer

## Code Style & Conventions

### Commit Style
Lowercase imperative mood: `fix auth redirect`, `add ssl integration`, `improve error messages`

### Python
- Apps: snake_case, Models: PascalCase, Views: PascalCase + "View" suffix
- Serializers: PascalCase + "Serializer" suffix, functions/tasks: snake_case
- `structlog` for logging (not `print` or `logging` directly)
- `python-decouple` `config()` for env vars in settings
- Section separators: `# =============================================================================`

### TypeScript
- Components: PascalCase, hooks: camelCase with "use" prefix
- Context files: kebab-case, types/interfaces: PascalCase
- Frontend-exposed env vars: `NEXT_PUBLIC_` prefix
- `"use client"` on all interactive components
- Error handling: `(err as { response?: { data?: { error?: string } } })`

## Adding New Features

### New Django App
1. Create app directory under `web/` following the app structure pattern
2. Add to `INSTALLED_APPS` in `web/settings/components/base.py`
3. Add URL patterns in `web/web/urls.py` under the `/api/` prefix
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

## Critical Gotchas

- **Template variables in Docker Compose**: `{{.State.Health.Status}}` is Docker syntax, NOT a Sol template variable. The test checker knows to skip these.
- **Settings module naming**: `logging_settings.py` not `logging.py` — the latter would shadow Python's stdlib `logging` module.
- **`DJANGO_SECRET_KEY`** is auto-generated by `setup_project.py` — it's not read from config, it's created fresh each time setup runs.
- **`GA_MEASUREMENT_ID`** is defined twice in `build_replacements()` (from both `google_analytics` and `analytics` sections) — the `analytics` section takes precedence.
- **Container names use `{{PROJECT_SLUG}}`**: All `docker exec` commands in the Makefile reference these — they only work after template variables are replaced.
- **Pre-commit hooks require `nextjs/node_modules`**: Run `cd nextjs && npm install` before `pre-commit install`.

## Environment Variables

Set in `.env` and `docker-compose.yaml`. Key variables:
- `ENVIRONMENT` (dev/prod), `SECRET_KEY`, `SITE_DOMAIN`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `REDIS_HOST`, `REDIS_PASSWORD`
- `EMAIL_HOST_USER`, `EMAIL_PASSWORD` (SendGrid)
- `SENTRY_DSN`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SITE_BASE_DOMAIN`

## CDK Infrastructure

**File:** `cdk/cdk/web_stack.py`

Provisions: EC2 t2.medium (Ubuntu), 50GB EBS, Elastic IP, security groups (ports 22/80/443), Docker + Docker Compose installed via user data.

```bash
cd cdk && cdk bootstrap && cdk deploy --outputs-file outputs.json
```

Output `cdk/outputs.json` contains the EC2 instance's public IP.
