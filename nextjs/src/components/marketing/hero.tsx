import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[90vh] px-6 pt-24 pb-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Optional: Small badge/pill above headline */}
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
          <span className="mr-2">🚀</span>
          <span>Now in public beta</span>
        </div>

        {/* Main headline - benefit-focused, not product-focused */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Ship your SaaS
          <br />
          <span className="text-primary">in days, not months</span>
        </h1>

        {/* Subheadline - expand on the value prop */}
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Stop rebuilding auth, payments, and email from scratch. Sol gives you
          a production-ready foundation so you can focus on what makes your
          product unique.
        </p>

        {/* Single, focused CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="text-base px-8" asChild>
            <Link href="/register">Start Building Free</Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            No credit card required
          </span>
        </div>
      </div>

      {/* Product demo video/screenshot - the most important visual */}
      <div className="mt-16 w-full max-w-5xl mx-auto">
        <div className="relative rounded-xl border bg-muted/30 shadow-2xl overflow-hidden">
          {/* Video placeholder - replace with actual demo video */}
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm">
                Watch 60-second demo
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
