export default function SocialProof() {
  // Replace with actual customer logos
  const logos = [
    { name: "Company 1", placeholder: true },
    { name: "Company 2", placeholder: true },
    { name: "Company 3", placeholder: true },
    { name: "Company 4", placeholder: true },
    { name: "Company 5", placeholder: true },
  ];

  return (
    <section className="py-16 px-6 border-y bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by developers at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="h-8 w-24 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground"
            >
              {logo.placeholder ? "Logo" : logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
