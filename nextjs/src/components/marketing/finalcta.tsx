import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-primary text-primary-foreground">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to ship faster?
        </h2>
        <p className="text-lg opacity-90">
          Join developers who have stopped rebuilding the same infrastructure
          and started focusing on what makes their product unique.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="secondary"
            className="text-base px-8"
            asChild
          >
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
        <p className="text-sm opacity-75">
          Free forever for side projects. No credit card required.
        </p>
      </div>
    </section>
  );
}
