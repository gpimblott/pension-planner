import InputForm from "@/components/InputForm";

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-140px)] overflow-hidden bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[120px]" />
      <div className="absolute top-2/3 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-accent/5 blur-[100px]" />

      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs text-brand-muted hover:border-brand-primary/30 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            Dynamic Projection Engine Ready
          </div>

          <h1 className="mt-6 font-sans text-4xl font-black tracking-tight text-slate-100 sm:text-5xl">
            Pension Projection <span className="text-brand-primary">Dashboard</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-brand-muted font-light leading-relaxed">
            Project your retirement savings, evaluate inflation risks, and simulate dynamic withdrawals to secure your financial future.
          </p>
        </section>

        {/* Input & Form Container */}
        <section className="relative z-10">
          <InputForm />
        </section>

        {/* Disclaimer Block */}
        <footer className="mx-auto max-w-3xl mt-16 text-center text-brand-muted/60 text-xs leading-relaxed border-t border-brand-border/40 pt-6">
          <p>
            Disclaimer: The results provided by this tool are for illustrative purposes only and may not be accurate. 
            Please consult with a financial professional for personalised advice.
          </p>
        </footer>
      </div>
    </main>
  );
}
