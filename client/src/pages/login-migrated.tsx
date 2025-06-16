import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";
import { User } from "@shared/schema";
import { 
  StandardizedForm, 
  InputField, 
  CheckboxField, 
  FormButton 
} from "@/components/forms";
import { authSchemas, LoginFormData, RegisterFormData } from "@/lib/validation-schemas";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(authSchemas.login),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(authSchemas.register),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      agreeToTerms: false
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.firstName || user.email}`,
      });
      
      // Redirect admin users to admin dashboard
      if (user.role === 'admin') {
        setLocation("/admin/settings");
      } else {
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      
      loginForm.setValue("password", "");
      loginForm.setFocus("password");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { confirmPassword, ...submitData } = data;
      const res = await apiRequest("POST", "/api/auth/register", submitData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Account created successfully!",
        description: `Welcome to BusinessHub, ${user.firstName}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">BusinessHub</h1>
          <p className="mt-2 text-gray-600">Welcome back! Please sign in to your account</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Access Your Account</CardTitle>
            <CardDescription>
              Sign in to manage your business listings and connect with customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectionErrorBoundary>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <StandardizedForm
                    form={loginForm}
                    onSubmit={handleLogin}
                    loading={loginMutation.isPending}
                    error={loginMutation.error?.message}
                  >
                    <InputField
                      name="email"
                      control={loginForm.control}
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      required
                    />

                    <InputField
                      name="password"
                      control={loginForm.control}
                      type="password"
                      label="Password"
                      placeholder="Enter your password"
                      required
                      showPasswordToggle
                    />

                    <div className="flex items-center justify-between">
                      <CheckboxField
                        name="rememberMe"
                        control={loginForm.control}
                        label="Remember me"
                        description="Keep me signed in for 30 days"
                      />
                      
                      <a href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>

                    <FormButton
                      type="submit"
                      loading={loginMutation.isPending}
                      loadingText="Signing in..."
                      fullWidth
                      size="lg"
                    >
                      Sign In
                    </FormButton>
                  </StandardizedForm>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <StandardizedForm
                    form={registerForm}
                    onSubmit={handleRegister}
                    loading={registerMutation.isPending}
                    error={registerMutation.error?.message}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        name="firstName"
                        control={registerForm.control}
                        label="First Name"
                        placeholder="John"
                        required
                      />

                      <InputField
                        name="lastName"
                        control={registerForm.control}
                        label="Last Name"
                        placeholder="Doe"
                        required
                      />
                    </div>

                    <InputField
                      name="email"
                      control={registerForm.control}
                      type="email"
                      label="Email Address"
                      placeholder="john@example.com"
                      required
                      helperText="We'll use this to send you important updates"
                    />

                    <InputField
                      name="password"
                      control={registerForm.control}
                      type="password"
                      label="Password"
                      placeholder="Create a strong password"
                      required
                      showPasswordToggle
                      helperText="Must be at least 8 characters with uppercase letter and number"
                    />

                    <InputField
                      name="confirmPassword"
                      control={registerForm.control}
                      type="password"
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      required
                    />

                    <CheckboxField
                      name="agreeToTerms"
                      control={registerForm.control}
                      label="I agree to the Terms of Service and Privacy Policy"
                      description="By creating an account, you agree to our terms and conditions"
                      required
                    />

                    <FormButton
                      type="submit"
                      loading={registerMutation.isPending}
                      loadingText="Creating account..."
                      fullWidth
                      size="lg"
                    >
                      Create Account
                    </FormButton>
                  </StandardizedForm>
                </TabsContent>
              </Tabs>
            </SectionErrorBoundary>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            New to BusinessHub?{' '}
            <button
              onClick={() => setActiveTab('register')}
              className="text-primary hover:underline font-medium"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}