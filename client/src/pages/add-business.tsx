import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Building, CheckCircle, Loader2, AlertCircle } from "lucide-react";

// Registration form schema
const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Business submission schema with enhanced validation
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
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms of service"
  }),
});

type RegistrationData = z.infer<typeof registrationSchema>;
type BusinessSubmissionData = z.infer<typeof businessSubmissionSchema>;

export default function AddBusinessPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"auth" | "business" | "success">("auth");
  const [duplicateCheck, setDuplicateCheck] = useState<{ isChecking: boolean; isDuplicate: boolean }>({
    isChecking: false,
    isDuplicate: false
  });

  // Fetch categories for business form
  const { data: categories } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["/api/categories"],
  });

  // Registration form
  const registrationForm = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  // Business submission form with draft loading
  const businessForm = useForm<BusinessSubmissionData>({
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
      acceptTerms: false,
    },
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("business-submission-draft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        businessForm.reset(draftData);
        toast({
          title: "Draft Restored",
          description: "Your previous submission has been restored.",
        });
      } catch (error) {
        localStorage.removeItem("business-submission-draft");
      }
    }
  }, [businessForm, toast]);

  // Save draft on form changes
  useEffect(() => {
    const subscription = businessForm.watch((data) => {
      if (step === "business" && (data.title || data.description || data.address)) {
        localStorage.setItem("business-submission-draft", JSON.stringify(data));
      }
    });
    return () => subscription.unsubscribe();
  }, [businessForm, step]);

  // Duplicate checking function
  const checkForDuplicates = async (title: string, address: string) => {
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

  // Registration mutation with enhanced error handling
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const res = await apiRequest("POST", "/api/register", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Account Created!", 
        description: "Welcome! Now let's add your business details." 
      });
      setStep("business");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Registration Failed", 
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive" 
      });
    },
  });

  // Business submission mutation with duplicate checking
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
    onSuccess: (data) => {
      // Clear draft on successful submission
      localStorage.removeItem("business-submission-draft");
      toast({ 
        title: "Business Submitted Successfully!", 
        description: "Your business listing is now under review. You'll be notified once it's approved." 
      });
      setStep("success");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Submission Failed", 
        description: error.message || "Unable to submit business. Please check your details and try again.",
        variant: "destructive" 
      });
    },
  });

  // Check if user is already authenticated
  if (isAuthenticated && user && step === "auth") {
    setStep("business");
  }

  const onRegister = (data: RegistrationData) => {
    registerMutation.mutate(data);
  };

  const onSubmitBusiness = (data: BusinessSubmissionData) => {
    businessMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Building className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Add Your Business</h1>
          <p className="text-gray-600 mt-2">
            Join our directory and connect with potential customers
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === "auth" ? "text-primary" : "text-green-600"}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                step === "auth" ? "border-primary bg-primary text-white" : "border-green-600 bg-green-600 text-white"
              }`}>
                {step === "auth" ? "1" : "✓"}
              </div>
              <span className="ml-2">Account</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === "business" ? "text-primary" : step === "success" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                step === "business" ? "border-primary bg-primary text-white" : 
                step === "success" ? "border-green-600 bg-green-600 text-white" : "border-gray-300"
              }`}>
                {step === "success" ? "✓" : "2"}
              </div>
              <span className="ml-2">Business</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === "success" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                step === "success" ? "border-green-600 bg-green-600 text-white" : "border-gray-300"
              }`}>
                {step === "success" ? "✓" : "3"}
              </div>
              <span className="ml-2">Complete</span>
            </div>
          </div>
        </div>

        {/* Step 1: Registration/Login */}
        {step === "auth" && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Account</CardTitle>
              <CardDescription>
                Register to submit your business listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...registrationForm}>
                <form onSubmit={registrationForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registrationForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registrationForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={registrationForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Business Information */}
        {step === "business" && (
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Tell us about your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onSubmitBusiness)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
                    <FormField
                      control={businessForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
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
                      control={businessForm.control}
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
                      control={businessForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Street address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                      control={businessForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
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

                  {/* Terms of Service */}
                  <div className="space-y-4">
                    <FormField
                      control={businessForm.control}
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
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                          <p className="text-sm text-yellow-800">
                            A business with this name and address may already exist. 
                            Please verify your details before submitting.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={businessMutation.isPending || duplicateCheck.isChecking}
                  >
                    {businessMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting Business...
                      </>
                    ) : duplicateCheck.isChecking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking for duplicates...
                      </>
                    ) : (
                      "Submit Business"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Business Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for submitting your business. Our team will review your listing 
                and it will be published to our directory shortly.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}