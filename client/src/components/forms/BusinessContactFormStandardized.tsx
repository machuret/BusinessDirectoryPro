import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  StandardizedForm, 
  InputField, 
  TextareaField, 
  FormButton 
} from '@/components/forms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User, Mail, Phone } from 'lucide-react';
import { contactSchemas, BusinessContactFormData } from '@/lib/validation-schemas';

interface BusinessContactFormStandardizedProps {
  businessId: string;
  businessName: string;
  className?: string;
  onSuccess?: () => void;
}

export function BusinessContactFormStandardized({
  businessId,
  businessName,
  className,
  onSuccess
}: BusinessContactFormStandardizedProps) {
  const { toast } = useToast();

  const form = useForm<BusinessContactFormData>({
    resolver: zodResolver(contactSchemas.business),
    defaultValues: {
      senderName: '',
      senderEmail: '',
      senderPhone: '',
      message: '',
      businessId
    }
  });

  const submitLeadMutation = useMutation({
    mutationFn: async (data: BusinessContactFormData) => {
      const response = await apiRequest('POST', '/api/leads/submit', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: `Your message has been sent to ${businessName}. They will get back to you soon.`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again or contact the business directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BusinessContactFormData) => {
    submitLeadMutation.mutate(data);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Contact {businessName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StandardizedForm
          form={form}
          onSubmit={handleSubmit}
          loading={submitLeadMutation.isPending}
          error={submitLeadMutation.error?.message}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              name="senderName"
              control={form.control}
              label="Your Name"
              placeholder="Enter your full name"
              required
              helperText="How should we address you?"
            />
            
            <InputField
              name="senderEmail"
              control={form.control}
              type="email"
              label="Your Email"
              placeholder="Enter your email address"
              required
              helperText="For the business to respond to you"
            />
          </div>

          <InputField
            name="senderPhone"
            control={form.control}
            type="tel"
            label="Your Phone Number"
            placeholder="Enter your phone number"
            helperText="Optional - for faster response"
          />

          <TextareaField
            name="message"
            control={form.control}
            label="Your Message"
            placeholder="Tell them what you're looking for, ask about services, pricing, availability..."
            required
            rows={5}
            maxLength={1000}
            showCharCount
            helperText="Be specific about your needs to get the best response"
          />

          <FormButton
            type="submit"
            loading={submitLeadMutation.isPending}
            loadingText="Sending message..."
            fullWidth
            size="lg"
          >
            Send Message
          </FormButton>
        </StandardizedForm>

        {/* Quick Contact Options */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Prefer to contact directly?</p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>Call for immediate assistance</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span>Email for detailed inquiries</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span>Message through this form for tracked communication</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BusinessContactFormStandardized;