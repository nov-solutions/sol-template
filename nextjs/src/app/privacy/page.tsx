// TODO: Review and customize privacy policy for your application
import { CONTACT_EMAIL, SITE_NAME } from "@/constants";
import Link from "next/link";

export const metadata = {
  title: `Privacy Policy - ${SITE_NAME}`,
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <article className="prose prose-sm prose-neutral dark:prose-invert prose-headings:mb-2 prose-headings:mt-6 prose-p:my-2 prose-ul:my-2 prose-li:my-0">
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you
          create an account, make a purchase, or contact us for support.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve
          our services, process transactions, and send you technical notices and
          support messages.
        </p>

        <h2>3. Information Sharing</h2>
        <p>
          We do not share your personal information with third parties except as
          described in this policy or with your consent.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We take reasonable measures to help protect your personal information
          from loss, theft, misuse, and unauthorized access.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We use cookies and similar technologies to collect information about
          your browsing activities and to personalize your experience.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You may access, update, or delete your account information at any time
          by logging into your account settings.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <hr />

        <p>
          <Link href="/">&larr; Back to home</Link>
        </p>
      </article>
    </div>
  );
}
