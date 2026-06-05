import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { JsonLd } from '~/components/json-ld';
import { faqPageSchema } from '~/lib/structured-data';

const faqs = [
  {
    question: 'What is Retailytics?',
    answer:
      'Retailytics is a comprehensive retail intelligence platform that helps businesses collect, analyze, and understand market data through systematic store enumeration and data analysis.',
  },
  {
    question: 'How does the enumeration process work?',
    answer:
      'Our platform allows administrators to assign enumerators to specific geographic areas. These enumerators visit retail locations, capture detailed business information, and submit data in real-time for validation and analysis.',
  },
  {
    question: 'What type of data is collected?',
    answer:
      'We collect comprehensive retail data including store locations, business types, operating hours, contact information, product categories, and market positioning details to provide actionable business insights.',
  },
  {
    question: 'How accurate is the data?',
    answer:
      'Our data goes through a rigorous validation process with quality control checks. Enumerators are trained to ensure data accuracy, and our system includes verification steps to maintain high data quality standards.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-10">
      <JsonLd data={faqPageSchema(faqs)} />
      <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-primary/10 blur-[128px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-accent/10 blur-[128px] -translate-y-1/2" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-16">
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Everything you need to know about Retailytics and how it can help
            your business
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-primary/30 transition-all duration-300 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
