import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";

interface FAQ {
  question: string;
  answer: string;
}

interface BusinessFAQsTabProps {
  faqs: FAQ[];
  onAddFaq: () => void;
  onUpdateFaq: (index: number, field: 'question' | 'answer', value: string) => void;
  onRemoveFaq: (index: number) => void;
}

/**
 * BusinessFAQsTab - Component for managing business frequently asked questions
 * 
 * Provides an interface for business owners to create, edit, and manage FAQs
 * that help customers understand their services. Supports dynamic addition
 * and removal of FAQ items with validation and user-friendly form controls.
 * 
 * @param faqs - Array of FAQ objects with question and answer properties
 * @param onAddFaq - Callback function to add a new FAQ item
 * @param onUpdateFaq - Callback function to update a specific FAQ field
 * @param onRemoveFaq - Callback function to remove an FAQ item by index
 * 
 * @returns JSX.Element - Dynamic FAQ management interface with add/edit/remove functionality
 * 
 * @example
 * <BusinessFAQsTab 
 *   faqs={businessEditor.faqs}
 *   onAddFaq={businessEditor.addFaq}
 *   onUpdateFaq={businessEditor.updateFaq}
 *   onRemoveFaq={businessEditor.removeFaq}
 * />
 */
export function BusinessFAQsTab({ 
  faqs, 
  onAddFaq, 
  onUpdateFaq, 
  onRemoveFaq 
}: BusinessFAQsTabProps) {
  const { t } = useContent();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          {t("dashboard.businesses.form.faqs.label")}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddFaq}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 && (
        <div className="text-center py-8">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            No FAQs added yet. Click "Add FAQ" to get started.
          </p>
        </div>
      )}

      {faqs.map((faq, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  FAQ #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFaq(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Label htmlFor={`question-${index}`} className="text-sm font-medium">
                  Question
                </Label>
                <Input
                  id={`question-${index}`}
                  value={faq.question}
                  onChange={(e) => onUpdateFaq(index, 'question', e.target.value)}
                  placeholder="What is your most common customer question?"
                />
              </div>
              
              <div>
                <Label htmlFor={`answer-${index}`} className="text-sm font-medium">
                  Answer
                </Label>
                <Textarea
                  id={`answer-${index}`}
                  value={faq.answer}
                  onChange={(e) => onUpdateFaq(index, 'answer', e.target.value)}
                  placeholder="Provide a helpful and detailed answer..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}