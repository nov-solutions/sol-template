import { SITE_NAME } from "@/constants";
import { RiGithubLine, RiTwitterXLine } from "@remixicon/react";
import Link from "next/link";

export default function Footer() {
  const links = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/docs" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ];

  const socials = [
    { name: "GitHub", icon: RiGithubLine, href: "https://github.com" },
    { name: "Twitter", icon: RiTwitterXLine, href: "https://twitter.com" },
  ];

  return (
    <footer className="border-t">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold">
              {SITE_NAME}
            </Link>
            <nav className="flex items-center gap-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <social.icon className="h-5 w-5" />
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
