import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessFAQProps {
  business: BusinessWithCategory;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function BusinessFAQ({ business }: BusinessFAQProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  // Parse FAQ data - it could be a JSON string or array
  const parseFAQData = (): FAQItem[] => {
    if (!business.faq) return [];
    
    try {
      let faqData = business.faq;
      
      // If it's a string, try to parse it
      if (typeof faqData === 'string') {
        faqData = JSON.parse(faqData);
      }
      
      // Ensure it's an array
      if (Array.isArray(faqData)) {
        return faqData.filter(item => item && item.question && item.answer);
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing FAQ data:', error);
      return [];
    }
  };

  const faqItems = parseFAQData();

  if (faqItems.length === 0) {
    return null;
  }

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Collapsible 
              key={index} 
              open={openItems.includes(index)}
              onOpenChange={() => toggleItem(index)}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900">{item.question}</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    openItems.includes(index) ? 'transform rotate-180' : ''
                  }`} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="text-gray-700 leading-relaxed">
                  {item.answer}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}