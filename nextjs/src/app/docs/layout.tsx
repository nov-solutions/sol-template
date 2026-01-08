import Footer from "@/components/marketing/footer";
import Nav from "@/components/marketing/nav";
import { DocsNav } from "@/components/docs/docs-nav";
import { SITE_NAME } from "@/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: `%s - ${SITE_NAME} Docs`,
    default: `Documentation - ${SITE_NAME}`,
  },
  description: "Learn how to use Sol to build your SaaS application.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <div className="min-h-screen pt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Sidebar */}
            <aside className="md:w-64 shrink-0">
              <DocsNav />
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <article className="prose prose-neutral dark:prose-invert max-w-none">
                {children}
              </article>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
