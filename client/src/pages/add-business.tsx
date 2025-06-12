import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Building } from "lucide-react";
import BusinessRegistrationForm from "@/components/business/BusinessRegistrationForm";
import BusinessSubmissionForm from "@/components/business/BusinessSubmissionForm";

export default function AddBusinessPage() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"auth" | "business" | "success">(
    isAuthenticated ? "business" : "auth"
  );

  // Update step when authentication status changes
  if (isAuthenticated && step === "auth") {
    setStep("business");
  }

  const handleRegistrationSuccess = () => {
    setStep("business");
  };

  const handleBusinessSubmissionSuccess = () => {
    setStep("success");
  };

  const renderStepContent = () => {
    switch (step) {
      case "auth":
        return <BusinessRegistrationForm onSuccess={handleRegistrationSuccess} />;
      
      case "business":
        return <BusinessSubmissionForm onSuccess={handleBusinessSubmissionSuccess} />;
      
      case "success":
        return (
          <Card className="text-center">
            <CardContent className="py-8">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Submission Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your business listing has been submitted and is now under review. 
                We'll notify you once it's approved and published to our directory.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/">Return to Home</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Add Your Business</h1>
            <p className="text-gray-600">
              Join our directory and connect with local customers
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === "auth" ? "text-blue-600" : "text-green-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "auth" ? "bg-blue-100" : "bg-green-100"
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Account</span>
            </div>
            
            <div className={`w-8 h-1 ${step === "business" || step === "success" ? "bg-green-200" : "bg-gray-200"}`} />
            
            <div className={`flex items-center ${
              step === "business" ? "text-blue-600" : step === "success" ? "text-green-600" : "text-gray-400"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "business" ? "bg-blue-100" : step === "success" ? "bg-green-100" : "bg-gray-100"
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Business Details</span>
            </div>
            
            <div className={`w-8 h-1 ${step === "success" ? "bg-green-200" : "bg-gray-200"}`} />
            
            <div className={`flex items-center ${step === "success" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "success" ? "bg-green-100" : "bg-gray-100"
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
}