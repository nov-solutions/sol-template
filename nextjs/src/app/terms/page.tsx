import { SITE_NAME } from "@/constants";
import Link from "next/link";

export const metadata = {
  title: `Terms of Service - ${SITE_NAME}`,
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <article className="prose prose-sm prose-neutral dark:prose-invert prose-headings:mb-2 prose-headings:mt-6 prose-p:my-2 prose-ul:my-2 prose-li:my-0">
        <h1>Terms of Service</h1>
        <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using {SITE_NAME}, you agree to be bound by these
          Terms of Service and all applicable laws and regulations.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use {SITE_NAME} for personal,
          non-commercial transitory viewing only.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on {SITE_NAME} are provided on an &apos;as is&apos;
          basis. {SITE_NAME} makes no warranties, expressed or implied, and
          hereby disclaims and negates all other warranties.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall {SITE_NAME} or its suppliers be liable for any
          damages arising out of the use or inability to use the materials on{" "}
          {SITE_NAME}.
        </p>

        <h2>5. Contact</h2>
        <p>If you have any questions about these Terms, please contact us.</p>

        <hr />

        <p>
          <Link href="/">&larr; Back to home</Link>
        </p>
      </article>
    </div>
  );
}
