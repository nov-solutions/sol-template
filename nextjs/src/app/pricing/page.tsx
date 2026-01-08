"use client";

import Footer from "@/components/marketing/footer";
import Nav from "@/components/marketing/nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { RiCheckLine, RiLoader4Line } from "@remixicon/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  priceId?: string; // Stripe price ID - leave empty for free/enterprise
  highlighted?: boolean;
  isFree?: boolean;
  isEnterprise?: boolean;
}

// Configure your Stripe price IDs here
// Get these from your Stripe Dashboard > Products > Prices
const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for side projects and experiments.",
    features: [
      "Up to 100 users",
      "Basic analytics",
      "Community support",
      "1 team member",
    ],
    cta: "Get Started",
    isFree: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For growing products that need more power.",
    features: [
      "Unlimited users",
      "Advanced analytics",
      "Priority support",
      "Up to 5 team members",
      "Custom domain",
      "Remove branding",
    ],
    cta: "Start Free Trial",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "", // Set in .env
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large teams with specific needs.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO / SAML",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    isEnterprise: true,
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade at any time. Changes take effect immediately and we'll prorate your billing.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoicing for Enterprise customers.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! Pro plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What happens if I exceed my limits?",
    answer:
      "We'll notify you when you're approaching your limits. You can upgrade anytime, and we won't cut off your service unexpectedly.",
  },
];

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    subscription,
    loading: subLoading,
    createCheckoutSession,
  } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");
  const plan = searchParams.get("plan");
  const hasTriggeredCheckout = useRef(false);

  // Auto-trigger checkout when user returns from registration with a plan
  useEffect(() => {
    if (
      plan &&
      user &&
      !authLoading &&
      !subLoading &&
      !subscription?.has_active_subscription &&
      !hasTriggeredCheckout.current
    ) {
      const tier = tiers.find(
        (t) => t.name.toLowerCase() === plan.toLowerCase(),
      );
      if (tier?.priceId) {
        hasTriggeredCheckout.current = true;
        setLoadingTier(tier.name);
        createCheckoutSession(tier.priceId).catch((err) => {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setLoadingTier(null);
        });
      }
    }
  }, [
    plan,
    user,
    authLoading,
    subLoading,
    subscription,
    createCheckoutSession,
  ]);

  const handleSubscribe = async (tier: PricingTier) => {
    setError(null);

    // Free tier - just go to register/dashboard
    if (tier.isFree) {
      window.location.href = user ? "/dashboard" : "/register";
      return;
    }

    // Enterprise - contact sales
    if (tier.isEnterprise) {
      window.location.href = "/contact";
      return;
    }

    // Must be logged in to subscribe
    if (!user) {
      window.location.href = `/register?plan=${tier.name.toLowerCase()}`;
      return;
    }

    // Already has subscription
    if (subscription?.has_active_subscription) {
      window.location.href = "/dashboard/billing";
      return;
    }

    // Create Stripe checkout session
    if (!tier.priceId) {
      setError("Price ID not configured. Please contact support.");
      return;
    }

    try {
      setLoadingTier(tier.name);
      await createCheckoutSession(tier.priceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingTier(null);
    }
  };

  const getButtonText = (tier: PricingTier) => {
    if (loadingTier === tier.name) {
      return <RiLoader4Line className="h-4 w-4 animate-spin" />;
    }
    if (
      subscription?.has_active_subscription &&
      !tier.isFree &&
      !tier.isEnterprise
    ) {
      return "Manage Subscription";
    }
    return tier.cta;
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-16">
        {/* Header */}
        <section className="px-6 text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>

          {canceled && (
            <div className="mt-6 p-4 bg-muted rounded-lg max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">
                Checkout was canceled. No worries, you can try again anytime.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg max-w-md mx-auto">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </section>

        {/* Pricing cards */}
        <section className="px-6 mb-24">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  tier.highlighted
                    ? "border-primary shadow-lg scale-105"
                    : "border-border"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">
                      /{tier.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <RiCheckLine className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.highlighted ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleSubscribe(tier)}
                  disabled={loadingTier !== null || authLoading}
                >
                  {getButtonText(tier)}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">
              Frequently asked questions
            </h2>
            <div className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            We&apos;re here to help. Reach out and we&apos;ll get back to you
            within 24 hours.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
