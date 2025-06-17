import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContent } from "@/contexts/ContentContext";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import type { FAQ } from "@/hooks/useBusinessEditor";

interface BusinessFAQsTabProps {
  faqs: FAQ[];
  onAddFaq: () => void;
  onUpdateFaq: (index: number, field: 'question' | 'answer', value: string) => void;
  onRemoveFaq: (index: number) => void;
}

export function BusinessFAQsTab({
  faqs,
  onAddFaq,
  onUpdateFaq,
  onRemoveFaq,
}: BusinessFAQsTabProps) {
  const { t } = useContent();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {t("dashboard.businesses.faqs.title")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("dashboard.businesses.faqs.description")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAddFaq}>
          <Plus className="h-4 w-4 mr-1" />
          {t("dashboard.businesses.faqs.add")}
        </Button>
      </div>
      
      {faqs.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
          <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{t("dashboard.businesses.faqs.empty.title")}</p>
          <p className="text-sm text-muted-foreground">{t("dashboard.businesses.faqs.empty.description")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Label htmlFor={`question-${index}`} className="text-sm font-medium">
                    {t("dashboard.businesses.faqs.question")} {index + 1}
                  </Label>
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
                <Input
                  id={`question-${index}`}
                  value={faq.question}
                  onChange={(e) => onUpdateFaq(index, 'question', e.target.value)}
                  placeholder={t("dashboard.businesses.faqs.question.placeholder")}
                />
                <div>
                  <Label htmlFor={`answer-${index}`} className="text-sm font-medium">
                    {t("dashboard.businesses.faqs.answer")}
                  </Label>
                  <Textarea
                    id={`answer-${index}`}
                    value={faq.answer}
                    onChange={(e) => onUpdateFaq(index, 'answer', e.target.value)}
                    placeholder={t("dashboard.businesses.faqs.answer.placeholder")}
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {faqs.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            {t("dashboard.businesses.faqs.tips.title")}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>{t("dashboard.businesses.faqs.tips.specific")}</li>
            <li>{t("dashboard.businesses.faqs.tips.helpful")}</li>
            <li>{t("dashboard.businesses.faqs.tips.common")}</li>
            <li>{t("dashboard.businesses.faqs.tips.update")}</li>
          </ul>
        </div>
      )}
    </div>
  );
}