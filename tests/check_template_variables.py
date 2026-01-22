#!/usr/bin/env python3
"""
Template Variable Checker

Verifies that all template variables ({{VARIABLE}}) used in the codebase
are defined in setup_project.py's build_replacements function.

Usage:
    python tests/check_template_variables.py

Exit codes:
    0 - All variables are properly defined
    1 - Found undefined or unused variables
"""

import os
import re
import sys
from pathlib import Path

# Patterns that look like template variables but are actually Docker syntax
DOCKER_SYNTAX_PATTERNS = {
    "{{.State.Health.Status}}",
}

# Files and directories to exclude from scanning
EXCLUDE_PATTERNS = (
    "setup_project.py",
    "template.config.json",
    "template.schema.json",
    "tests/",
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

# File extensions to scan
SCAN_EXTENSIONS = {
    ".py",
    ".yaml",
    ".yml",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".conf",
    ".sh",
    ".md",
    ".html",
    ".css",
    ".env",
}


def extract_defined_variables(setup_script_path: str) -> set[str]:
    """Extract all template variables defined in setup_project.py."""
    with open(setup_script_path, "r") as f:
        content = f.read()

    # Find all "{{VARIABLE}}" patterns in the build_replacements function
    # These are the keys in the replacements dictionary
    pattern = r'"(\{\{[A-Z_]+\}\})":'
    matches = re.findall(pattern, content)

    return set(matches)


def should_skip_file(filepath: str) -> bool:
    """Check if a file should be skipped based on exclude patterns."""
    return any(pattern in filepath for pattern in EXCLUDE_PATTERNS)


def should_scan_file(filepath: str) -> bool:
    """Check if a file should be scanned based on extension."""
    # Also scan Makefile which has no extension
    if filepath.endswith("Makefile"):
        return True
    return Path(filepath).suffix.lower() in SCAN_EXTENSIONS


def extract_used_variables(root_dir: str) -> dict[str, list[str]]:
    """
    Find all template variables used in the codebase.
    Returns a dict mapping variable -> list of files where it's used.
    """
    variable_pattern = re.compile(r"\{\{[A-Z_]+\}\}")
    used_variables: dict[str, list[str]] = {}

    for root, dirs, files in os.walk(root_dir):
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

            if not should_scan_file(filepath):
                continue

            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
            except (UnicodeDecodeError, PermissionError):
                continue

            matches = variable_pattern.findall(content)
            for match in matches:
                # Skip Docker syntax patterns
                if match in DOCKER_SYNTAX_PATTERNS:
                    continue

                if match not in used_variables:
                    used_variables[match] = []
                if filepath not in used_variables[match]:
                    used_variables[match].append(filepath)

    return used_variables


def main():
    # Determine project root (parent of tests directory)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    setup_script = project_root / "setup_project.py"
    if not setup_script.exists():
        print(f"Error: setup_project.py not found at {setup_script}")
        sys.exit(1)

    print("Template Variable Checker")
    print("=" * 60)
    print()

    # Extract defined variables
    print("Scanning setup_project.py for defined variables...")
    defined_vars = extract_defined_variables(str(setup_script))
    print(f"  Found {len(defined_vars)} defined variables")
    print()

    # Extract used variables
    print("Scanning codebase for used variables...")
    used_vars = extract_used_variables(str(project_root))
    print(f"  Found {len(used_vars)} unique variables in use")
    print()

    # Compare
    defined_set = defined_vars
    used_set = set(used_vars.keys())

    undefined = used_set - defined_set
    unused = defined_set - used_set

    errors_found = False

    if undefined:
        errors_found = True
        print("UNDEFINED VARIABLES (used but not defined in setup_project.py):")
        print("-" * 60)
        for var in sorted(undefined):
            print(f"  {var}")
            for filepath in used_vars[var][:5]:  # Show max 5 files
                print(f"    - {filepath}")
            if len(used_vars[var]) > 5:
                print(f"    ... and {len(used_vars[var]) - 5} more files")
        print()

    if unused:
        # Unused variables are just a warning, not an error
        print("UNUSED VARIABLES (defined but not used in codebase):")
        print("-" * 60)
        for var in sorted(unused):
            print(f"  {var}")
        print()
        print("  Note: Unused variables may be intentional for optional features.")
        print()

    if not undefined and not unused:
        print("All variables are properly defined and used.")
        print()

    # Summary
    print("=" * 60)
    print("Summary:")
    print(f"  Defined variables: {len(defined_vars)}")
    print(f"  Used variables: {len(used_vars)}")
    print(f"  Undefined: {len(undefined)}")
    print(f"  Unused: {len(unused)}")
    print()

    if errors_found:
        print("FAILED: Found undefined template variables")
        sys.exit(1)
    else:
        print("PASSED: All template variables are properly defined")
        sys.exit(0)


if __name__ == "__main__":
    main()
