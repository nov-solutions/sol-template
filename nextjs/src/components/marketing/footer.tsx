import { CONTACT_EMAIL, SITE_NAME } from "@/constants";
import { RiGithubLine, RiTwitterXLine } from "@remixicon/react";
import Link from "next/link";

const links = [
  { name: "Features", href: "/#features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Docs", href: "/docs" },
  { name: "Contact", href: `mailto:${CONTACT_EMAIL}` },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

const socials = [
  { name: "GitHub", icon: RiGithubLine, href: "{{SOCIAL_GITHUB}}" },
  { name: "Twitter", icon: RiTwitterXLine, href: "{{SOCIAL_TWITTER}}" },
];

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="max-w-5xl px-6 py-6 mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/" className="font-bold">
              {SITE_NAME}
            </Link>
            <nav className="flex flex-wrap items-center gap-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm transition-colors text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors text-muted-foreground hover:text-foreground"
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {SITE_NAME}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
