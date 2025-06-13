import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  StandardizedForm, 
  InputField, 
  TextareaField, 
  SelectDropdown, 
  FormButton 
} from '@/components/forms';
import { Mail, Phone, MapPin } from 'lucide-react';

// Validation schema with comprehensive rules
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject must be less than 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
  inquiryType: z.enum(['general', 'business', 'technical', 'billing'], {
    required_error: 'Please select an inquiry type'
  })
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormStandardizedProps {
  title?: string;
  showContactInfo?: boolean;
  className?: string;
}

export function ContactFormStandardized({ 
  title = "Contact Us", 
  showContactInfo = true,
  className 
}: ContactFormStandardizedProps) {
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for your message. We'll get back to you within 24 hours.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  const inquiryTypeOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'business', label: 'Business Listing' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' }
  ];

  return (
    <div className={className}>
      <StandardizedForm
        form={form}
        onSubmit={handleSubmit}
        title={title}
        description="We'd love to hear from you. Send us a message and we'll respond as soon as possible."
        loading={contactMutation.isPending}
        error={contactMutation.error?.message}
        cardWrapper
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="name"
            control={form.control}
            label="Full Name"
            placeholder="Enter your full name"
            required
          />
          
          <InputField
            name="email"
            control={form.control}
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="phone"
            control={form.control}
            type="tel"
            label="Phone Number"
            placeholder="Enter your phone number"
            helperText="Optional - for faster response"
          />
          
          <SelectDropdown
            name="inquiryType"
            control={form.control}
            label="Inquiry Type"
            placeholder="Select inquiry type"
            options={inquiryTypeOptions}
            required
          />
        </div>

        <InputField
          name="subject"
          control={form.control}
          label="Subject"
          placeholder="What is this regarding?"
          required
        />

        <TextareaField
          name="message"
          control={form.control}
          label="Message"
          placeholder="Tell us how we can help you..."
          required
          rows={6}
          maxLength={1000}
          showCharCount
        />

        <FormButton
          type="submit"
          loading={contactMutation.isPending}
          loadingText="Sending Message..."
          fullWidth
          size="lg"
        >
          Send Message
        </FormButton>
      </StandardizedForm>

      {/* Contact Information */}
      {showContactInfo && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600 text-sm">support@businesshub.com</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
            <p className="text-gray-600 text-sm">123 Business St, City, State 12345</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactFormStandardized;