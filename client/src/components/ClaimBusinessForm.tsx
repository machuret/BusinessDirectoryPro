import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClaimBusinessFormProps {
  businessId: string;
  businessName: string;
}

export default function ClaimBusinessForm({ businessId, businessName }: ClaimBusinessFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    verificationMethod: "document",
    message: "",
    documents: null as File[] | null,
  });

  const claimMutation = useMutation({
    mutationFn: async (data: any) => {
      const formDataToSend = new FormData();
      formDataToSend.append("businessId", businessId);
      formDataToSend.append("ownerName", data.ownerName);
      formDataToSend.append("ownerEmail", data.ownerEmail);
      formDataToSend.append("ownerPhone", data.ownerPhone);
      formDataToSend.append("verificationMethod", data.verificationMethod);
      formDataToSend.append("message", data.message);
      
      if (data.documents) {
        data.documents.forEach((file: File) => {
          formDataToSend.append("documents", file);
        });
      }

      const res = await fetch("/api/ownership-claims", {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Claim Submitted",
        description: "Your business ownership claim has been submitted for review. We'll contact you within 24-48 hours.",
      });
      setFormData({
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        verificationMethod: "document",
        message: "",
        documents: null,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit claim. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    claimMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev: any) => ({ ...prev, documents: Array.from(files) }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim Business Ownership</CardTitle>
        <div className="text-sm text-muted-foreground">
          Claiming ownership of <strong>{businessName}</strong>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="text-sm font-medium after:content-['*'] after:text-destructive after:ml-1">
                Full Name
              </Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, ownerName: e.target.value }))}
                required
                aria-describedby="name-helper"
                className="focus-visible:ring-primary"
              />
              <p id="name-helper" className="text-xs text-muted-foreground">Your legal name as business owner</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail" className="text-sm font-medium after:content-['*'] after:text-destructive after:ml-1">
                Email Address
              </Label>
              <Input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, ownerEmail: e.target.value }))}
                required
                aria-describedby="email-helper"
                className="focus-visible:ring-primary"
              />
              <p id="email-helper" className="text-xs text-muted-foreground">Primary contact email for verification</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerPhone" className="text-sm font-medium after:content-['*'] after:text-destructive after:ml-1">
              Phone Number
            </Label>
            <Input
              id="ownerPhone"
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, ownerPhone: e.target.value }))}
              required
              aria-describedby="phone-helper"
              className="focus-visible:ring-primary"
            />
            <p id="phone-helper" className="text-xs text-muted-foreground">Business phone number for verification</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verificationMethod" className="text-sm font-medium">
              Verification Method
            </Label>
            <Select
              value={formData.verificationMethod}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, verificationMethod: value }))}
            >
              <SelectTrigger className="focus-visible:ring-primary">
                <SelectValue placeholder="Choose verification method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Business License/Tax Document</SelectItem>
                <SelectItem value="phone">Phone Verification</SelectItem>
                <SelectItem value="email">Email Domain Verification</SelectItem>
                <SelectItem value="postcard">Postcard Verification</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Select how you'd like to verify your ownership</p>
          </div>

      <div>
        <Label htmlFor="documents">Supporting Documents</Label>
        <Input
          id="documents"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Upload business license, tax documents, or other proof of ownership
        </p>
      </div>

      <div>
        <Label htmlFor="message">Additional Information</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Tell us why you should be verified as the owner of this business..."
          rows={3}
        />
      </div>

      <div className="bg-muted p-3 rounded-md text-sm">
        <strong>What happens next:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>We'll review your claim within 24-48 hours</li>
          <li>You may be contacted for additional verification</li>
          <li>Once approved, you can manage your business listing</li>
          <li>Update photos, hours, contact information, and more</li>
        </ul>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={claimMutation.isPending} className="flex-1">
          {claimMutation.isPending ? "Submitting..." : "Submit Claim"}
        </Button>
      </div>
    </form>
  );
}