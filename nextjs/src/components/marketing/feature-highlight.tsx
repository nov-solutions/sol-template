import { Card, CardContent } from "@/components/ui/card";
import {
  RiShieldCheckLine,
  RiMailLine,
  RiGoogleLine,
  RiTimeLine,
} from "@remixicon/react";

export default function FeatureHighlight() {
  const features = [
    {
      icon: RiShieldCheckLine,
      title: "Secure by default",
      description:
        "Session-based auth, CSRF protection, and password hashing built in.",
    },
    {
      icon: RiMailLine,
      title: "Email verification",
      description:
        "Async email sending with Celery. Verification and password reset flows ready.",
    },
    {
      icon: RiGoogleLine,
      title: "Social login",
      description:
        "Google OAuth pre-configured. Add more providers with a few lines.",
    },
    {
      icon: RiTimeLine,
      title: "Background tasks",
      description:
        "Celery + Redis for async jobs. Scheduled tasks with Celery Beat.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-2">
            Everything you need
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Authentication that just works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Full auth system out of the box. Email/password, OAuth,
            verification, password reset - all wired up and tested.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="flex-row gap-4">
              <CardContent className="flex gap-4 pt-6">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
