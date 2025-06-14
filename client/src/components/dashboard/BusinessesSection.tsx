import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessMutations } from "@/hooks/useBusinessData";
import { useFormManagement, useModalState } from "@/hooks/useFormManagement";
import { LoadingState } from "@/components/loading/LoadingState";
import { ErrorState } from "@/components/error/ErrorState";
import { Building2, Edit, Star, MapPin, Phone, Clock, Globe, Mail, Plus, Trash2, HelpCircle } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessesSectionProps {
  businesses: BusinessWithCategory[];
  isLoading: boolean;
}

export function BusinessesSection({ businesses, isLoading }: BusinessesSectionProps) {
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const { updateBusiness } = useBusinessMutations();
  const editModal = useModalState();

  const editForm = useFormManagement({
    initialValues: {
      title: "",
      description: "",
      phone: "",
      website: "",
      address: "",
    },
    onSubmit: async (values) => {
      if (!editingBusiness) return;
      
      // Combine form data with FAQs
      const updateData = {
        ...values,
        faq: JSON.stringify(faqs.filter(faq => faq.question && faq.answer))
      };
      
      await updateBusiness.mutateAsync({
        id: editingBusiness.placeid,
        data: updateData,
      });
      
      setEditingBusiness(null);
      editModal.close();
    },
  });

  const handleEditBusiness = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
    editForm.updateFields({
      title: business.title || "",
      description: business.description || "",
      phone: business.phone || "",
      website: business.website || "",
      address: business.address || "",
      hours: business.hours || "",
      email: business.email || "",
    });
    
    // Parse existing FAQs
    try {
      const existingFaqs = business.faqs ? JSON.parse(business.faqs) : [];
      setFaqs(Array.isArray(existingFaqs) ? existingFaqs : []);
    } catch {
      setFaqs([]);
    }
    
    editModal.open();
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Your Businesses
          </CardTitle>
          <CardDescription>Manage your business listings</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading your businesses..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          Your Businesses
        </CardTitle>
        <CardDescription>Manage your business listings</CardDescription>
      </CardHeader>
      <CardContent>
        {businesses && businesses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.placeid}>
                  <TableCell className="font-medium">{business.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {business.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 text-yellow-500" />
                      {(business as any).averagerating || "No ratings"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={business.featured ? "default" : "secondary"}>
                      {business.featured ? "Featured" : "Standard"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={editModal.isOpen} onOpenChange={editModal.setIsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBusiness(business)}
                          aria-label={`Edit business ${business.title}`}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Edit Business: {business.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <Tabs defaultValue="basic" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="contact">Contact & Hours</TabsTrigger>
                            <TabsTrigger value="faqs">FAQs</TabsTrigger>
                          </TabsList>
                          
                          <form onSubmit={editForm.handleSubmit}>
                            <TabsContent value="basic" className="space-y-4 mt-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <Label htmlFor="title" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Business Name *
                                  </Label>
                                  <Input
                                    id="title"
                                    value={editForm.values.title}
                                    onChange={(e) => editForm.updateField("title", e.target.value)}
                                    placeholder="Enter your business name"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="description">Business Description</Label>
                                  <Textarea
                                    id="description"
                                    value={editForm.values.description}
                                    onChange={(e) => editForm.updateField("description", e.target.value)}
                                    placeholder="Describe your business, services, and what makes you unique..."
                                    rows={4}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="address" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Business Address
                                  </Label>
                                  <Input
                                    id="address"
                                    value={editForm.values.address}
                                    onChange={(e) => editForm.updateField("address", e.target.value)}
                                    placeholder="123 Main Street, City, State ZIP"
                                  />
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="contact" className="space-y-4 mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone Number
                                  </Label>
                                  <Input
                                    id="phone"
                                    value={editForm.values.phone}
                                    onChange={(e) => editForm.updateField("phone", e.target.value)}
                                    placeholder="(555) 123-4567"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                  </Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={editForm.values.email}
                                    onChange={(e) => editForm.updateField("email", e.target.value)}
                                    placeholder="business@example.com"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="website" className="flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  Website URL
                                </Label>
                                <Input
                                  id="website"
                                  type="url"
                                  value={editForm.values.website}
                                  onChange={(e) => editForm.updateField("website", e.target.value)}
                                  placeholder="https://yourwebsite.com"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="hours" className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Business Hours
                                </Label>
                                <Textarea
                                  id="hours"
                                  value={editForm.values.hours}
                                  onChange={(e) => editForm.updateField("hours", e.target.value)}
                                  placeholder="Monday-Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
                                  rows={3}
                                />
                              </div>
                            </TabsContent>

                            <TabsContent value="faqs" className="space-y-4 mt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-medium flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5" />
                                    Frequently Asked Questions
                                  </h3>
                                  <p className="text-sm text-muted-foreground">Help customers by answering common questions about your business.</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add FAQ
                                </Button>
                              </div>
                              
                              {faqs.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                  <p className="text-muted-foreground">No FAQs added yet</p>
                                  <p className="text-sm text-muted-foreground">Click "Add FAQ" to create your first question and answer</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {faqs.map((faq, index) => (
                                    <Card key={index} className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                          <Label htmlFor={`question-${index}`} className="text-sm font-medium">
                                            Question {index + 1}
                                          </Label>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFaq(index)}
                                            className="text-destructive hover:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <Input
                                          id={`question-${index}`}
                                          value={faq.question}
                                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                          placeholder="Enter your question (e.g., What are your business hours?)"
                                        />
                                        <div>
                                          <Label htmlFor={`answer-${index}`} className="text-sm font-medium">Answer</Label>
                                          <Textarea
                                            id={`answer-${index}`}
                                            value={faq.answer}
                                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                            placeholder="Provide a helpful answer to this question..."
                                            rows={2}
                                          />
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </TabsContent>

                            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={editModal.close}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={editForm.isSubmitting}>
                                {editForm.isSubmitting ? "Updating..." : "Update Business"}
                              </Button>
                            </div>
                          </form>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
            <p className="text-gray-600">You don't own any business listings yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Default export for backward compatibility
export default BusinessesSection;