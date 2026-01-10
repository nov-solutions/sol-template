import { SITE_NAME } from "@/constants";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div>
      <h1>Introduction</h1>
      <p className="lead">
        {SITE_NAME} is a production-ready full-stack template for building SaaS
        applications. It includes authentication, payments, background jobs, and
        more - all pre-configured and ready to customize.
      </p>

      <h2>What&apos;s Included</h2>
      <ul>
        <li>
          <strong>Next.js Frontend</strong> - React-based UI with App Router,
          TypeScript, and Tailwind CSS
        </li>
        <li>
          <strong>Django Backend</strong> - REST API with Django REST Framework,
          modular settings, and PostgreSQL
        </li>
        <li>
          <strong>Authentication</strong> - Email/password and Google OAuth with
          django-allauth, session-based auth
        </li>
        <li>
          <strong>Payments</strong> - Stripe integration with subscriptions,
          checkout, and customer portal
        </li>
        <li>
          <strong>Background Jobs</strong> - Celery with Redis for async tasks
          and scheduled jobs
        </li>
        <li>
          <strong>Email</strong> - Transactional email support with async
          sending
        </li>
        <li>
          <strong>Docker</strong> - Development and production Docker
          configurations
        </li>
      </ul>

      <h2>Tech Stack</h2>
      <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">Frontend</h4>
          <ul className="text-sm text-foreground space-y-1">
            <li>Next.js 14 (App Router)</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
            <li>shadcn/ui components</li>
          </ul>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">Backend</h4>
          <ul className="text-sm text-foreground space-y-1">
            <li>Django 5</li>
            <li>Django REST Framework</li>
            <li>PostgreSQL</li>
            <li>Celery + Redis</li>
          </ul>
        </div>
      </div>

      <h2>Next Steps</h2>
      <p>
        Ready to get started? Head to the{" "}
        <Link href="/docs/quick-start">Quick Start</Link> guide to set up your
        development environment in minutes.
      </p>
    </div>
  );
}
