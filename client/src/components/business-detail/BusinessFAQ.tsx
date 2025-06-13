import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessFAQProps {
  business: BusinessWithCategory;
}

export function BusinessFAQ({ business }: BusinessFAQProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  // Parse FAQ data from business object
  let faqData = [];
  try {
    if (business.faq && typeof business.faq === 'string') {
      faqData = JSON.parse(business.faq);
    } else if (Array.isArray(business.faq)) {
      faqData = business.faq;
    }
  } catch (e) {
    console.error('Error parsing FAQ data:', e);
  }

  if (!faqData || faqData.length === 0) return null;

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center text-black">
          <HelpCircle className="w-5 h-5 mr-2" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {faqData.map((faq: any, index: number) => (
            <Collapsible
              key={index}
              open={openItems.includes(index)}
              onOpenChange={() => toggleItem(index)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="font-medium text-black pr-4">
                  {faq.question || faq.q || faq.title}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pt-2 pb-3">
                <p className="text-black leading-relaxed">
                  {faq.answer || faq.a || faq.content}
                </p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}