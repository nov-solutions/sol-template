![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Python](https://img.shields.io/badge/python-3.13-blue)
![CI](https://github.com/nov-solutions/sol-template/actions/workflows/ci.yaml/badge.svg)
![Docker](https://img.shields.io/badge/docker-compose-blue)
![License](https://img.shields.io/badge/license-proprietary-gray)

# sol-template

Template repository for scaffolding full stack web applications. Not deployed directly. `setup_project.py` replaces `{{VARIABLE}}` placeholders throughout the codebase with real values from `template.config.json` to generate a new project.

## Quick Start

```bash
cp template.config.json template.config.json  # fill in project values
python setup_project.py                        # replace all template variables
make dev                                       # start all containers with hot reload
```

## Project Setup

```bash
python setup_project.py                # non-interactive (reads template.config.json)
python setup_project.py --interactive  # interactive wizard
python setup_project.py --clean        # remove template files after setup
```

## Development

```bash
make dev          # start dev containers (docker-compose.dev.yaml overlay)
make test         # run Django tests inside container
make drop-db      # stop containers, remove database volume
make mk-mig       # create and apply migrations
make deploy-cdk   # deploy infrastructure to AWS via CDK
```

## Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Django 5.1, Django REST Framework, Celery, Redis
- **Database**: PostgreSQL 17
- **Proxy**: Nginx with rate limiting
- **Infra**: AWS CDK (EC2, EBS, Elastic IP), Docker Compose
- **CI**: GitHub Actions (lint, template validation, docker build, integration tests)
- **Auth**: Session based with Google OAuth via django-allauth
- **Billing**: Stripe subscriptions with webhook sync
