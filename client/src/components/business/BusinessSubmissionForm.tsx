import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building, Loader2, AlertTriangle, Save } from "lucide-react";
import FAQManager from "../admin/FAQManager";

const businessSubmissionSchema = z.object({
  title: z.string().min(2, "Business name is required").max(100, "Business name is too long"),
  description: z.string().min(10, "Please provide a brief description (at least 10 characters)").max(1000, "Description is too long"),
  address: z.string().min(5, "Please provide the full address"),
  city: z.string().min(2, "City is required"),
  phone: z.string().optional().refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/\s/g, "")), {
    message: "Please enter a valid phone number"
  }),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  website: z.string().optional().refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: "Website must start with http:// or https://"
  }),
  hours: z.string().optional(),
  categoryId: z.number().min(1, "Please select a category"),
  faq: z.array(z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string()
  })).optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms of service"
  }),
});

type BusinessSubmissionData = z.infer<typeof businessSubmissionSchema>;

interface BusinessSubmissionFormProps {
  onSuccess: () => void;
}

export default function BusinessSubmissionForm({ onSuccess }: BusinessSubmissionFormProps) {
  const { toast } = useToast();
  const [duplicateCheck, setDuplicateCheck] = useState<{ isChecking: boolean; isDuplicate: boolean }>({
    isChecking: false,
    isDuplicate: false
  });

  // Fetch categories
  const { data: categories } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<BusinessSubmissionData>({
    resolver: zodResolver(businessSubmissionSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      website: "",
      hours: "",
      categoryId: 0,
      faq: [],
      acceptTerms: false,
    },
  });

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem("business-submission-draft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        form.reset(draftData);
        toast({
          title: "Draft Restored",
          description: "Your previous submission has been restored.",
        });
      } catch (error) {
        localStorage.removeItem("business-submission-draft");
      }
    }
  }, [form, toast]);

  // Auto-save draft
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.title || data.description || data.address) {
        localStorage.setItem("business-submission-draft", JSON.stringify(data));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Duplicate checking
  const checkForDuplicates = async (title: string, address: string) => {
    if (!title || !address) return false;
    
    setDuplicateCheck({ isChecking: true, isDuplicate: false });
    try {
      const res = await apiRequest("POST", "/api/check-duplicate-business", { title, address });
      const result = await res.json();
      setDuplicateCheck({ isChecking: false, isDuplicate: result.isDuplicate });
      return result.isDuplicate;
    } catch (error) {
      setDuplicateCheck({ isChecking: false, isDuplicate: false });
      return false;
    }
  };

  // Business submission mutation
  const businessMutation = useMutation({
    mutationFn: async (data: BusinessSubmissionData) => {
      // Check for duplicates first
      const isDuplicate = await checkForDuplicates(data.title, data.address);
      if (isDuplicate) {
        throw new Error("A business with this name and address already exists. Please verify the details.");
      }

      const res = await apiRequest("POST", "/api/submit-business", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Business submission failed");
      }
      return res.json();
    },
    onSuccess: () => {
      localStorage.removeItem("business-submission-draft");
      toast({ 
        title: "Business Submitted Successfully!", 
        description: "Your business listing is now under review. You'll be notified once it's approved." 
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Submission Failed", 
        description: error.message || "Unable to submit business. Please check your details and try again.",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: BusinessSubmissionData) => {
    businessMutation.mutate(data);
  };

  const saveDraft = () => {
    const currentData = form.getValues();
    localStorage.setItem("business-submission-draft", JSON.stringify(currentData));
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved.",
    });
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
            <Building className="w-8 h-8 text-green-600 dark:text-green-100" />
          </div>
        </div>
        <CardTitle>Add Your Business</CardTitle>
        <CardDescription>
          Provide details about your business for our directory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Basic Information
              </h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your business name"
                        onBlur={() => {
                          const address = form.getValues('address');
                          if (field.value && address) {
                            checkForDuplicates(field.value, address);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        placeholder="Describe your business, services, and what makes you unique..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Street address"
                        onBlur={() => {
                          const title = form.getValues('title');
                          if (field.value && title) {
                            checkForDuplicates(title, field.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+1 (555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="business@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://yourwebsite.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Hours</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={3}
                        placeholder="e.g. Mon-Fri 9am-5pm, Sat 10am-2pm, Closed Sunday"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Frequently Asked Questions (Optional)
              </h3>
              <p className="text-sm text-muted-foreground">
                Add common questions and answers about your business to help potential customers.
              </p>
              
              <FormField
                control={form.control}
                name="faq"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FAQManager
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Terms of Service */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        I accept the terms of service and confirm that all information provided is accurate *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Duplicate Check Warning */}
            {duplicateCheck.isDuplicate && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      A business with this name and address may already exist. 
                      Please verify your details before submitting.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={saveDraft}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={businessMutation.isPending || duplicateCheck.isChecking}
              >
                {businessMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : duplicateCheck.isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Submit Business"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}