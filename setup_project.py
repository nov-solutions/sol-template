#!/usr/bin/env python3
"""
Project Setup Script

Reads template.config.json and replaces all template variables ({{VARIABLE_NAME}})
across the codebase with the configured values.

Usage:
    1. Edit template.config.json with your project values
    2. Run: python setup_project.py
    3. Optionally run with --clean to remove template files after setup
"""

import json
import os
import sys
from pathlib import Path

EXCLUDE_PATTERNS = (
    "setup_project.py",
    "template.config.json",
    "template.schema.json",
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
        # Database
        "{{DB_NAME}}": config["database"]["name"],
        "{{DB_USER}}": config["database"]["user"],
        # Deployment IPs
        "{{PRODUCTION_IP}}": config["deployment"]["production_ip"],
        "{{STAGING_IP}}": config["deployment"]["staging_ip"],
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


def main():
    print("=" * 60)
    print("Project Setup Script")
    print("=" * 60)
    print()

    # Check for --clean flag
    clean_after = "--clean" in sys.argv

    # Load configuration
    print("Loading configuration from template.config.json...")
    config = load_config()
    print(f"  Project Name: {config['project']['name']}")
    print(f"  Project Slug: {config['project']['name_slug']}")
    print(f"  Domain: {config['domains']['production']}")
    print()

    # Build replacement mapping
    replacements = build_replacements(config)
    print(f"Prepared {len(replacements)} template variables for replacement.")
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
        print()

    print("=" * 60)
    print("Setup complete!")
    print()
    print("Next steps:")
    print("  1. Review the changes made to your files")
    print("  2. Update placeholder images in nextjs/public/assets/img/")
    print("  3. Update nextjs/public/manifest.json")
    print("  4. Run 'make dev' to start development")
    print("=" * 60)


if __name__ == "__main__":
    main()
