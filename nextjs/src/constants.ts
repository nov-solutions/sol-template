export const SITE_NAME = String(process.env.NEXT_PUBLIC_SITE_NAME).replace(
  /\b\w/g,
  (char) => char.toUpperCase(),
);
export const SITE_TAGLINE = "{{TAGLINE}}";
export const SITE_DESCRIPTION = "{{DESCRIPTION}}";
export const SITE_KEYWORDS = "{{KEYWORDS}}";
export const SITE_BASE_DOMAIN = String(
  process.env.NEXT_PUBLIC_SITE_BASE_DOMAIN,
);
export const CONTACT_EMAIL = "{{CONTACT_EMAIL}}";

export interface Page {
  name: string;
  relativePath: string;
  appPage?: boolean;
  icon?: string;
  external?: boolean;
}
export const PAGES: Page[] = [{ name: "Home", relativePath: "/" }];
