#!/usr/bin/env python3
"""
Project Setup Script

Reads template.config.json and replaces all template variables ({{VARIABLE_NAME}})
across the codebase with the configured values.

Usage:
    1. Edit template.config.json with your project values
    2. Run: python setup_project.py
    3. Optionally run with --clean to remove template files after setup

Or use interactive mode:
    python setup_project.py --interactive
"""

import json
import os
import shutil
import sys
from pathlib import Path

EXCLUDE_PATTERNS = (
    "setup_project.py",
    "template.config.json",
    "template.schema.json",
    "templates/",
    ".git/",
    ".pyc",
    "__pycache__",
    ".eot",
    ".ttf",
    ".woff",
    ".woff2",
    ".png",
    ".jpg",
    ".jpeg",
    ".ico",
    ".gif",
    ".webp",
    ".svg",
    ".tgz",
    "node_modules/",
    ".next/",
    ".DS_Store",
    "venv/",
    ".venv/",
    "cdk.out/",
)


def load_config() -> dict:
    """Load and validate the template configuration."""
    config_path = Path("template.config.json")
    if not config_path.exists():
        print("Error: template.config.json not found")
        print("Please create the config file first.")
        sys.exit(1)

    with open(config_path) as f:
        config = json.load(f)

    return config


def prompt(
    label: str, default: str = "", required: bool = False, secret: bool = False
) -> str:
    """Prompt user for input with optional default value."""
    if default:
        display = f"{label} [{default}]: "
    else:
        display = f"{label}: "

    while True:
        if secret:
            import getpass

            value = getpass.getpass(display)
        else:
            value = input(display).strip()

        if not value and default:
            return default
        if not value and required:
            print("  This field is required.")
            continue
        return value


def prompt_section(title: str) -> None:
    """Print a section header."""
    print()
    print(f"{'─' * 50}")
    print(f"  {title}")
    print(f"{'─' * 50}")


def interactive_wizard() -> dict:
    """Run an interactive wizard to collect all configuration values."""
    print()
    print("=" * 60)
    print("  Sol Project Setup Wizard")
    print("=" * 60)
    print()
    print("This wizard will guide you through configuring your project.")
    print("Press Enter to accept default values shown in [brackets].")
    print()

    config: dict = {}

    # Project
    prompt_section("Project Information")
    config["project"] = {
        "name": prompt("Project name (display name)", "My App", required=True),
        "name_slug": prompt(
            "Project slug (lowercase, hyphens)", "my-app-web", required=True
        ),
    }

    # Branding
    prompt_section("Branding")
    config["branding"] = {
        "tagline": prompt("Tagline", "Your awesome app"),
        "description": prompt("Description", "A web application built with Sol"),
        "keywords": prompt("Keywords (comma-separated)", "web app, saas"),
        "founding_year": prompt("Founding year", "2024"),
    }

    # Contact
    prompt_section("Contact")
    config["contact"] = {
        "email": prompt("Contact email", "hello@example.com", required=True),
    }

    # Domains
    prompt_section("Domains")
    config["domains"] = {
        "production": prompt("Production domain", "example.com", required=True),
        "staging": prompt("Staging domain", "dev.example.com"),
    }

    # Social
    prompt_section("Social Links (optional)")
    config["social"] = {
        "github": prompt("GitHub URL", ""),
        "twitter": prompt("Twitter/X URL", ""),
        "linkedin": prompt("LinkedIn URL", ""),
    }

    # AWS
    prompt_section("AWS Configuration")
    config["aws"] = {
        "account_id": prompt("AWS Account ID", "", required=True),
        "region": prompt("AWS Region", "us-west-2", required=True),
    }

    # Database
    prompt_section("Database")
    config["database"] = {
        "name": prompt("Database name", "appdb", required=True),
        "user": prompt("Database user", "appuser", required=True),
        "password": prompt(
            "Database password", "change_me_secure_password", required=True
        ),
        "redis_password": prompt(
            "Redis password", "change_me_redis_password", required=True
        ),
    }

    # Deployment
    prompt_section("Deployment (can be filled later)")
    config["deployment"] = {
        "production_ip": prompt("Production IP (leave blank if unknown)", ""),
        "staging_ip": prompt("Staging IP (leave blank if unknown)", ""),
    }

    # Stripe
    prompt_section("Stripe Integration (optional)")
    print("  Get your keys at: https://dashboard.stripe.com/apikeys")
    config["stripe"] = {
        "publishable_key": prompt("Stripe Publishable Key", ""),
        "secret_key": prompt("Stripe Secret Key", "", secret=True),
        "webhook_secret": prompt("Stripe Webhook Secret", "", secret=True),
        "pro_price_id": prompt("Stripe Pro Price ID", ""),
    }

    # Google OAuth
    prompt_section("Google OAuth (optional)")
    print("  Set up at: https://console.cloud.google.com/apis/credentials")
    config["google_oauth"] = {
        "client_id": prompt("Google Client ID", ""),
        "client_secret": prompt("Google Client Secret", "", secret=True),
    }

    # SendGrid
    prompt_section("SendGrid Email (optional)")
    print("  Get your API key at: https://app.sendgrid.com/settings/api_keys")
    config["sendgrid"] = {
        "api_key": prompt("SendGrid API Key", "", secret=True),
    }

    # Sentry
    prompt_section("Sentry Error Tracking (optional)")
    print("  Get your DSN at: https://sentry.io/settings/projects/")
    config["sentry"] = {
        "dsn": prompt("Sentry DSN", ""),
    }

    # Analytics
    prompt_section("Analytics (optional)")
    config["analytics"] = {
        "ga_measurement_id": prompt("Google Analytics Measurement ID", ""),
    }

    print()
    return config


def save_config(config: dict) -> None:
    """Save configuration to template.config.json."""
    config_path = Path("template.config.json")

    # Add metadata
    config["$schema"] = "./template.schema.json"
    config["_instructions"] = "This file was generated by the setup wizard"

    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)

    print(f"Configuration saved to {config_path}")


def generate_secret_key() -> str:
    """Generate a Django-compatible secret key."""
    import secrets
    import string

    chars = string.ascii_letters + string.digits + "!@#$%^&*(-_=+)"
    return "".join(secrets.choice(chars) for _ in range(50))


def build_replacements(config: dict) -> dict[str, str]:
    """Build a mapping of template variables to their replacement values."""
    return {
        # Project identifiers
        "{{PROJECT_NAME}}": config["project"]["name"],
        "{{PROJECT_SLUG}}": config["project"]["name_slug"],
        # Branding
        "{{TAGLINE}}": config["branding"]["tagline"],
        "{{DESCRIPTION}}": config["branding"]["description"],
        "{{KEYWORDS}}": config["branding"]["keywords"],
        "{{FOUNDING_YEAR}}": config["branding"]["founding_year"],
        # Contact
        "{{CONTACT_EMAIL}}": config["contact"]["email"],
        # Domains
        "{{DOMAIN_PRODUCTION}}": config["domains"]["production"],
        "{{DOMAIN_STAGING}}": config["domains"]["staging"],
        # Social links
        "{{SOCIAL_GITHUB}}": config["social"]["github"],
        "{{SOCIAL_TWITTER}}": config["social"]["twitter"],
        "{{SOCIAL_LINKEDIN}}": config["social"]["linkedin"],
        # AWS
        "{{AWS_ACCOUNT_ID}}": config["aws"]["account_id"],
        "{{AWS_REGION}}": config["aws"]["region"],
        "{{AWS_ACCESS_KEY_ID}}": config["aws"].get("access_key_id", ""),
        "{{AWS_SECRET_ACCESS_KEY}}": config["aws"].get("secret_access_key", ""),
        # Database
        "{{DB_NAME}}": config["database"]["name"],
        "{{DB_USER}}": config["database"]["user"],
        "{{DB_PASSWORD}}": config["database"].get("password", ""),
        "{{REDIS_PASSWORD}}": config["database"].get("redis_password", ""),
        # Deployment IPs
        "{{PRODUCTION_IP}}": config["deployment"]["production_ip"],
        "{{STAGING_IP}}": config["deployment"]["staging_ip"],
        # Django
        "{{DJANGO_SECRET_KEY}}": generate_secret_key(),
        # Stripe
        "{{STRIPE_PUBLISHABLE_KEY}}": config.get("stripe", {}).get(
            "publishable_key", ""
        ),
        "{{STRIPE_SECRET_KEY}}": config.get("stripe", {}).get("secret_key", ""),
        "{{STRIPE_WEBHOOK_SECRET}}": config.get("stripe", {}).get("webhook_secret", ""),
        "{{STRIPE_PRO_PRICE_ID}}": config.get("stripe", {}).get("pro_price_id", ""),
        # Google OAuth
        "{{GOOGLE_CLIENT_ID}}": config.get("google_oauth", {}).get("client_id", ""),
        "{{GOOGLE_CLIENT_SECRET}}": config.get("google_oauth", {}).get(
            "client_secret", ""
        ),
        # SendGrid
        "{{SENDGRID_API_KEY}}": config.get("sendgrid", {}).get("api_key", ""),
        # Sentry
        "{{SENTRY_DSN}}": config.get("sentry", {}).get("dsn", ""),
        # Analytics
        "{{GA_MEASUREMENT_ID}}": config.get("analytics", {}).get(
            "ga_measurement_id", ""
        ),
    }


def should_skip_file(filepath: str) -> bool:
    """Check if a file should be skipped based on exclude patterns."""
    return any(pattern in filepath for pattern in EXCLUDE_PATTERNS)


def process_file(filepath: str, replacements: dict[str, str]) -> bool:
    """
    Process a single file, replacing all template variables.
    Returns True if any replacements were made.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except (UnicodeDecodeError, PermissionError):
        return False

    original_content = content
    for template_var, replacement in replacements.items():
        content = content.replace(template_var, replacement)

    if content != original_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True

    return False


def find_remaining_templates(filepath: str) -> list[str]:
    """Find any remaining template variables in a file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except (UnicodeDecodeError, PermissionError):
        return []

    import re

    return re.findall(r"\{\{[A-Z_]+\}\}", content)


def setup_workflows() -> None:
    """
    Copy workflow templates to .github/workflows/ and remove template repo CI.

    The template repo has its own CI workflow (ci.yaml) which should be removed
    when setting up a new project. The actual project workflows are stored in
    templates/workflows/ and need to be copied to .github/workflows/.
    """
    templates_dir = Path("templates/workflows")
    workflows_dir = Path(".github/workflows")

    if not templates_dir.exists():
        print("  Warning: templates/workflows/ not found, skipping workflow setup")
        return

    # Remove template repo's CI workflow
    template_ci = workflows_dir / "ci.yaml"
    if template_ci.exists():
        template_ci.unlink()
        print("  Removed: .github/workflows/ci.yaml (template repo CI)")

    # Copy workflow templates to .github/workflows/
    for template_file in templates_dir.glob("*.yaml"):
        dest = workflows_dir / template_file.name
        shutil.copy2(template_file, dest)
        print(f"  Copied: {template_file} -> {dest}")


def main():
    print("=" * 60)
    print("Project Setup Script")
    print("=" * 60)
    print()

    # Check for flags
    clean_after = "--clean" in sys.argv
    interactive = "--interactive" in sys.argv or "-i" in sys.argv

    # Load or collect configuration
    if interactive:
        config = interactive_wizard()
        save_config(config)
    else:
        print("Loading configuration from template.config.json...")
        print("  (Run with --interactive or -i for guided setup)")
        print()
        config = load_config()

    print(f"  Project Name: {config['project']['name']}")
    print(f"  Project Slug: {config['project']['name_slug']}")
    print(f"  Domain: {config['domains']['production']}")
    print()

    # Build replacement mapping
    replacements = build_replacements(config)
    print(f"Prepared {len(replacements)} template variables for replacement.")
    print()

    # Setup workflows (copy from templates/, remove template repo CI)
    print("Setting up GitHub workflows...")
    setup_workflows()
    print()

    # Process all files
    print("Processing files...")
    files_modified = 0
    files_scanned = 0

    for root, dirs, files in os.walk("."):
        # Skip hidden directories and excluded paths
        dirs[:] = [
            d
            for d in dirs
            if not d.startswith(".")
            and d not in ("node_modules", "venv", ".venv", "cdk.out", "__pycache__")
        ]

        for filename in files:
            filepath = os.path.join(root, filename)

            if should_skip_file(filepath):
                continue

            files_scanned += 1
            if process_file(filepath, replacements):
                files_modified += 1
                print(f"  Modified: {filepath}")

    print()
    print(f"Scanned {files_scanned} files, modified {files_modified} files.")
    print()

    # Check for any remaining template variables
    print("Checking for remaining template variables...")
    remaining_found = False
    for root, dirs, files in os.walk("."):
        dirs[:] = [
            d
            for d in dirs
            if not d.startswith(".")
            and d not in ("node_modules", "venv", ".venv", "cdk.out", "__pycache__")
        ]

        for filename in files:
            filepath = os.path.join(root, filename)
            if should_skip_file(filepath):
                continue

            remaining = find_remaining_templates(filepath)
            if remaining:
                remaining_found = True
                print(
                    f"  Warning: {filepath} still contains: {', '.join(set(remaining))}"
                )

    if not remaining_found:
        print("  No remaining template variables found.")

    print()

    # Clean up template files if requested
    if clean_after:
        print("Cleaning up template files...")
        template_files = [
            "template.config.json",
            "template.schema.json",
            "setup_project.py",
        ]
        for tf in template_files:
            if os.path.exists(tf):
                os.remove(tf)
                print(f"  Removed: {tf}")

        # Remove templates directory
        templates_dir = Path("templates")
        if templates_dir.exists():
            shutil.rmtree(templates_dir)
            print(f"  Removed: {templates_dir}/")
        print()

    print("=" * 60)
    print("Setup complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Review the changes made to your files")
    print("  2. Update placeholder images in nextjs/public/assets/img/")
    print("  3. Update nextjs/public/manifest.json")
    print("  4. Run 'make dev' to start local development")
    print()
    print("For production deployment:")
    print("  1. Run 'make key-pair' to generate SSH keys")
    print("  2. Run 'make deploy-cdk' to provision AWS infrastructure")
    print("  3. Update PRODUCTION_IP in template.config.json with the EC2 IP")
    print("  4. Re-run 'python setup_project.py' to update IP references")
    print("  5. Configure DNS A record pointing to the EC2 IP")
    print("  6. Push to master to trigger deployment")
    print("  7. SSH in and run './cert.sh' for TLS certificate")
    print()
    print("GitHub Secrets to configure (Settings > Secrets > Actions):")
    print("  - SECRET_KEY: Django secret (auto-generated in .env)")
    print("  - POSTGRES_PASSWORD: From your .env file")
    print("  - REDIS_PASSWORD: From your .env file")
    print("  - SSH_PRIVATE_KEY: Contents of app.pem (from make key-pair)")
    if config.get("stripe", {}).get("secret_key"):
        print("  - STRIPE_SECRET_KEY: Already configured")
        print("  - STRIPE_WEBHOOK_SECRET: Already configured")
    if config.get("google_oauth", {}).get("client_secret"):
        print("  - GOOGLE_CLIENT_SECRET: Already configured")
    if config.get("sendgrid", {}).get("api_key"):
        print("  - SENDGRID_API_KEY: Already configured")
    print("=" * 60)


if __name__ == "__main__":
    main()
