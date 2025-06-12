import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface BusinessFAQProps {
  faqItems: FAQItem[];
  title?: string;
}

export default function BusinessFAQ({ faqItems, title = "Frequently Asked Questions" }: BusinessFAQProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqItems.map((faq: FAQItem, index: number) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <button
                className="flex items-center justify-between w-full text-left font-medium"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span>{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedFaq === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}