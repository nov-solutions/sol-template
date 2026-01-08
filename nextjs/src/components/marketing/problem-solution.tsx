import { RiCloseLine, RiCheckLine } from "@remixicon/react";

export default function ProblemSolution() {
  const problems = [
    "Weeks spent on auth, payments, and email setup",
    "Debugging obscure Docker and deployment issues",
    "Stitching together incompatible libraries",
    "Rewriting the same boilerplate for every project",
  ];

  const solutions = [
    "Production-ready auth with email + Google OAuth",
    "One-command local dev and cloud deployment",
    "Pre-integrated Django, Next.js, Celery, Redis stack",
    "Start building features on day one",
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Stop rebuilding infrastructure.
            <br />
            Start shipping products.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every new project shouldn&apos;t start with weeks of setup.
            We&apos;ve done the boring work so you can focus on what matters.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Problem column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-muted-foreground">
              The old way
            </h3>
            <ul className="space-y-4">
              {problems.map((problem, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-destructive/10 p-1">
                    <RiCloseLine className="h-4 w-4 text-destructive" />
                  </div>
                  <span className="text-muted-foreground">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">With Sol</h3>
            <ul className="space-y-4">
              {solutions.map((solution, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                    <RiCheckLine className="h-4 w-4 text-primary" />
                  </div>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
