import { Card, CardContent } from "@/components/ui/card";
import { RiDoubleQuotesL } from "@remixicon/react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "I went from idea to deployed MVP in a weekend. The auth system alone saved me weeks of work.",
      author: "Alex Chen",
      role: "Founder",
      company: "StartupCo",
    },
    {
      quote:
        "Finally, a template that doesn't cut corners on security. Production-ready from day one.",
      author: "Sarah Miller",
      role: "Senior Developer",
      company: "TechCorp",
    },
    {
      quote:
        "The Django + Next.js combo is exactly what I needed. Everything is wired up correctly.",
      author: "James Wilson",
      role: "Full-stack Developer",
      company: "AgencyX",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Loved by developers
          </h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of developers shipping faster with Sol
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="flex flex-col">
              <CardContent className="flex flex-col flex-1 pt-6">
                <RiDoubleQuotesL className="h-8 w-8 text-primary/20 mb-4" />
                <p className="flex-1 text-muted-foreground mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
