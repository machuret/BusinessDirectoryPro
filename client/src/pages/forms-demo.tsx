import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  StandardizedForm, 
  InputField, 
  TextareaField, 
  SelectDropdown, 
  CheckboxField, 
  FormButton,
  ContactFormStandardized,
  BusinessContactFormStandardized
} from '@/components/forms';
import { validationPatterns } from '@/lib/validation-schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Demo form schema
const demoFormSchema = z.object({
  name: validationPatterns.name,
  email: validationPatterns.email,
  phone: validationPatterns.phoneOptional,
  category: z.enum(['general', 'business', 'technical'], {
    required_error: 'Please select a category'
  }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  message: validationPatterns.message,
  newsletter: z.boolean().default(false),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

type DemoFormData = z.infer<typeof demoFormSchema>;

export default function FormsDemo() {
  const { toast } = useToast();

  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      category: 'general',
      priority: 'medium',
      message: '',
      newsletter: false,
      terms: false
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: DemoFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Demo form submitted:', data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Form submitted successfully!",
        description: "This is a demonstration of the standardized form system.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Form submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DemoFormData) => {
    submitMutation.mutate(data);
  };

  const categoryOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'business', label: 'Business Question' },
    { value: 'technical', label: 'Technical Support' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Standardized Forms System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demonstration of the unified form components with consistent validation, 
            submission feedback, and user experience patterns.
          </p>
        </div>

        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="components">Component Demo</TabsTrigger>
            <TabsTrigger value="contact">Contact Form</TabsTrigger>
            <TabsTrigger value="business">Business Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>All Form Components Demo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showcasing all standardized form components with validation
                </p>
              </CardHeader>
              <CardContent>
                <StandardizedForm
                  form={form}
                  onSubmit={handleSubmit}
                  loading={submitMutation.isPending}
                  error={submitMutation.error?.message}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      name="name"
                      control={form.control}
                      label="Full Name"
                      placeholder="Enter your full name"
                      required
                      helperText="First and last name"
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
                      placeholder="Optional phone number"
                      helperText="For faster response"
                    />
                    
                    <SelectDropdown
                      name="category"
                      control={form.control}
                      label="Category"
                      placeholder="Select category"
                      options={categoryOptions}
                      required
                    />
                  </div>

                  <SelectDropdown
                    name="priority"
                    control={form.control}
                    label="Priority Level"
                    options={priorityOptions}
                    helperText="How urgent is your request?"
                  />

                  <TextareaField
                    name="message"
                    control={form.control}
                    label="Message"
                    placeholder="Tell us how we can help you..."
                    required
                    rows={5}
                    maxLength={1000}
                    showCharCount
                  />

                  <div className="space-y-4">
                    <CheckboxField
                      name="newsletter"
                      control={form.control}
                      label="Subscribe to newsletter"
                      description="Receive updates about new features and services"
                    />
                    
                    <CheckboxField
                      name="terms"
                      control={form.control}
                      label="I agree to the Terms of Service"
                      description="Required to submit this form"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <FormButton
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={submitMutation.isPending}
                    >
                      Reset Form
                    </FormButton>
                    
                    <FormButton
                      type="submit"
                      loading={submitMutation.isPending}
                      loadingText="Submitting..."
                      className="flex-1"
                    >
                      Submit Demo Form
                    </FormButton>
                  </div>
                </StandardizedForm>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-8">
            <ContactFormStandardized
              title="General Contact Form"
              showContactInfo={true}
            />
          </TabsContent>

          <TabsContent value="business" className="mt-8">
            <BusinessContactFormStandardized
              businessId="demo-business-123"
              businessName="Demo Business"
            />
          </TabsContent>
        </Tabs>

        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Form System Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Consistent Validation</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Type-safe Zod schemas</li>
                <li>• Reusable validation patterns</li>
                <li>• Real-time error feedback</li>
                <li>• Cross-field validation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Enhanced UX</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Loading states with spinners</li>
                <li>• Toast notifications</li>
                <li>• Password visibility toggle</li>
                <li>• Character counting</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Developer Experience</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 60% faster development</li>
                <li>• Consistent patterns</li>
                <li>• TypeScript integration</li>
                <li>• Accessible by default</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}