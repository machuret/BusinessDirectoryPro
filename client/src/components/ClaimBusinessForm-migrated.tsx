import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  StandardizedForm, 
  InputField, 
  TextareaField, 
  SelectDropdown, 
  FormButton 
} from '@/components/forms';
import { businessSchemas, ClaimBusinessFormData } from '@/lib/validation-schemas';

interface ClaimBusinessFormProps {
  businessId: string;
  businessName: string;
  onSuccess?: () => void;
}

export default function ClaimBusinessForm({ businessId, businessName, onSuccess }: ClaimBusinessFormProps) {
  const { toast } = useToast();

  const form = useForm<ClaimBusinessFormData>({
    resolver: zodResolver(businessSchemas.claim),
    defaultValues: {
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      verificationMethod: 'document',
      message: '',
      documents: null,
      businessId
    }
  });

  const claimMutation = useMutation({
    mutationFn: async (data: ClaimBusinessFormData) => {
      const formDataToSend = new FormData();
      formDataToSend.append("businessId", data.businessId);
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
        title: "Claim Submitted Successfully",
        description: "Your business ownership claim has been submitted for review. We'll contact you within 24-48 hours.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit claim. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ClaimBusinessFormData) => {
    claimMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      form.setValue('documents', Array.from(files) as any);
    }
  };

  const verificationMethodOptions = [
    { value: 'document', label: 'Business License/Tax Document' },
    { value: 'phone', label: 'Phone Verification' },
    { value: 'email', label: 'Email Domain Verification' },
    { value: 'postcard', label: 'Postcard Verification' }
  ];

  return (
    <StandardizedForm
      form={form}
      onSubmit={handleSubmit}
      loading={claimMutation.isPending}
      error={claimMutation.error?.message}
      title={`Claim ${businessName}`}
      description="Verify your ownership to manage this business listing"
      cardWrapper
    >
      <div className="text-sm text-muted-foreground mb-4">
        Claiming <strong>{businessName}</strong>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          name="ownerName"
          control={form.control}
          label="Full Name"
          placeholder="Enter your full name"
          required
        />

        <InputField
          name="ownerEmail"
          control={form.control}
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          required
        />
      </div>

      <InputField
        name="ownerPhone"
        control={form.control}
        type="tel"
        label="Phone Number"
        placeholder="Enter your phone number"
        required
      />

      <SelectDropdown
        name="verificationMethod"
        control={form.control}
        label="Verification Method"
        options={verificationMethodOptions}
        helperText="Choose how you'd like to verify ownership"
      />

      <div className="space-y-2">
        <label htmlFor="documents" className="text-sm font-medium text-gray-700">
          Supporting Documents
        </label>
        <input
          id="documents"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileChange}
          className="w-full p-2 border border-input rounded-md bg-background cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          Upload business license, tax documents, or other proof of ownership
        </p>
      </div>

      <TextareaField
        name="message"
        control={form.control}
        label="Additional Information"
        placeholder="Tell us why you should be verified as the owner of this business..."
        rows={4}
        maxLength={500}
        showCharCount
        helperText="Provide any additional context to support your claim"
      />

      <div className="bg-muted p-4 rounded-md text-sm">
        <strong>What happens next:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>We'll review your claim within 24-48 hours</li>
          <li>You may be contacted for additional verification</li>
          <li>Once approved, you can manage your business listing</li>
          <li>Update photos, hours, contact information, and more</li>
        </ul>
      </div>

      <FormButton
        type="submit"
        loading={claimMutation.isPending}
        loadingText="Submitting Claim..."
        fullWidth
        size="lg"
      >
        Submit Ownership Claim
      </FormButton>
    </StandardizedForm>
  );
}