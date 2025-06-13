import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building, Loader2, User } from "lucide-react";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegistrationData = z.infer<typeof registrationSchema>;

interface BusinessRegistrationFormProps {
  onSuccess: () => void;
}

export default function BusinessRegistrationForm({ onSuccess }: BusinessRegistrationFormProps) {
  const { toast } = useToast();

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

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
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Registration Failed", 
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: RegistrationData) => {
    registerMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-100" />
          </div>
        </div>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>
          First, create an account to submit your business listing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
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
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}