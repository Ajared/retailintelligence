import { UserPlus, MapPinned, FileText, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Assign Enumerators',
    description:
      'Admins assign enumerators to specific locations for comprehensive coverage.',
    step: '01',
  },
  {
    icon: MapPinned,
    title: 'Capture Store Data',
    description:
      'Enumerators visit and capture detailed information about retail businesses in their assigned areas.',
    step: '02',
  },
  {
    icon: FileText,
    title: 'Submit & Validate',
    description:
      'Data is submitted in real-time and validated through our quality control system.',
    step: '03',
  },
  {
    icon: TrendingUp,
    title: 'Analyze & Report',
    description:
      'Access comprehensive reports and analytics to answer critical market questions.',
    step: '04',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-16 lg:py-32"
    >
      <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-primary/10 blur-[128px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-accent/10 blur-[128px] -translate-y-1/2" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-16">
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            How Retailytics works
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            A simple, systematic approach to collecting and analyzing retail
            data
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="space-y-4 p-6 h-full rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-primary/30 transition-all duration-300">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.step}
                  </div>
                </div>

                <h3 className="font-semibold text-xl text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 via-accent/30 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
