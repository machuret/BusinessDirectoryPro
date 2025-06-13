import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Phone, User, MessageSquare } from "lucide-react";

interface BusinessContactFormProps {
  businessId: string;
  businessName: string;
}

export function BusinessContactForm({ businessId, businessName }: BusinessContactFormProps) {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    message: ""
  });
  
  const { toast } = useToast();

  const submitLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await apiRequest('POST', '/api/leads/submit', leadData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your message has been sent successfully. The business owner will get back to you soon.",
      });
      // Reset form
      setFormData({
        senderName: "",
        senderEmail: "",
        senderPhone: "",
        message: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.senderName || !formData.senderEmail || !formData.message) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your name, email, and message.",
        variant: "destructive",
      });
      return;
    }

    submitLeadMutation.mutate({
      businessId,
      ...formData
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Contact {businessName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName" className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4" />
                <span>Your Name *</span>
              </Label>
              <Input
                id="senderName"
                type="text"
                value={formData.senderName}
                onChange={(e) => handleInputChange('senderName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="senderEmail" className="flex items-center space-x-2 mb-2">
                <Mail className="w-4 h-4" />
                <span>Your Email *</span>
              </Label>
              <Input
                id="senderEmail"
                type="email"
                value={formData.senderEmail}
                onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="senderPhone" className="flex items-center space-x-2 mb-2">
              <Phone className="w-4 h-4" />
              <span>Your Phone (Optional)</span>
            </Label>
            <Input
              id="senderPhone"
              type="tel"
              value={formData.senderPhone}
              onChange={(e) => handleInputChange('senderPhone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="message" className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Your Message *</span>
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell them what you're looking for, ask about services, pricing, availability..."
              rows={4}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitLeadMutation.isPending}
          >
            {submitLeadMutation.isPending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Default export for compatibility
export default BusinessContactForm;