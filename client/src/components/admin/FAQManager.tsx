import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQManagerProps {
  value: FAQItem[];
  onChange: (faqs: FAQItem[]) => void;
}

export default function FAQManager({ value, onChange }: FAQManagerProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(value || []);

  const addFAQ = () => {
    const newFAQ: FAQItem = {
      id: `faq_${Date.now()}`,
      question: "",
      answer: ""
    };
    const updatedFaqs = [...faqs, newFAQ];
    setFaqs(updatedFaqs);
    onChange(updatedFaqs);
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    );
    setFaqs(updatedFaqs);
    onChange(updatedFaqs);
  };

  const removeFAQ = (id: string) => {
    const updatedFaqs = faqs.filter(faq => faq.id !== id);
    setFaqs(updatedFaqs);
    onChange(updatedFaqs);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(faqs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFaqs(items);
    onChange(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Frequently Asked Questions</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addFAQ}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No FAQs added yet. Click "Add FAQ" to create your first question and answer.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="faqs">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {faqs.map((faq, index) => (
                  <Draggable key={faq.id} draggableId={faq.id} index={index}>
                    {(provided, snapshot) => (
                      <Card 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              FAQ #{index + 1}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFAQ(faq.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label htmlFor={`question-${faq.id}`} className="text-sm">
                              Question
                            </Label>
                            <Input
                              id={`question-${faq.id}`}
                              placeholder="Enter your question here..."
                              value={faq.question}
                              onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`answer-${faq.id}`} className="text-sm">
                              Answer
                            </Label>
                            <Textarea
                              id={`answer-${faq.id}`}
                              placeholder="Enter the answer here..."
                              value={faq.answer}
                              onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {faqs.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>Drag and drop FAQs to reorder them. They will appear in this order on the business page.</p>
        </div>
      )}
    </div>
  );
}