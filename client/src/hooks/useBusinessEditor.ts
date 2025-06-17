import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useBusinessMutations } from "@/hooks/useBusinessData";
import { useFormManagement, useModalState } from "@/hooks/useFormManagement";
import type { BusinessWithCategory } from "@shared/schema";

export interface FAQ {
  question: string;
  answer: string;
}

export interface BusinessFormData {
  title: string;
  description: string;
  phone: string;
  website: string;
  address: string;
}

/**
 * Custom hook for managing business editing functionality
 * Handles form state, FAQ management, image management, and business updates
 */
export function useBusinessEditor() {
  const { toast } = useToast();
  const { updateBusiness } = useBusinessMutations();
  const editModal = useModalState();
  
  // State management
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [businessImages, setBusinessImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form management
  const editForm = useFormManagement<BusinessFormData>({
    initialValues: {
      title: "",
      description: "",
      phone: "",
      website: "",
      address: "",
    },
    onSubmit: async (values) => {
      if (!editingBusiness) return;
      
      try {
        // Only save FAQs that have both question and answer filled
        const validFaqs = faqs.filter(faq => faq.question.trim() && faq.answer.trim());
        const updateData = {
          ...values,
          faq: validFaqs.length > 0 ? JSON.stringify(validFaqs) : null,
          imageurls: businessImages.length > 0 ? JSON.stringify(businessImages) : null
        };
        
        await updateBusiness.mutateAsync({
          id: editingBusiness.placeid,
          data: updateData,
        });
        
        // Success feedback handled by useBusinessMutations
        closeEditor();
        
        toast({
          title: "Business Updated",
          description: "Your business information has been updated successfully.",
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description: error instanceof Error ? error.message : "Failed to update business",
          variant: "destructive",
        });
      }
    },
  });

  // Business editor actions
  const openEditor = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
    editForm.updateFields({
      title: business.title || "",
      description: business.description || "",
      phone: business.phone || "",
      website: business.website || "",
      address: business.address || "",
    });
    
    // Parse existing FAQs
    try {
      let existingFaqs: any[] = [];
      if (business.faq) {
        if (typeof business.faq === 'string') {
          existingFaqs = JSON.parse(business.faq);
        } else if (Array.isArray(business.faq)) {
          existingFaqs = business.faq;
        }
      }
      setFaqs(Array.isArray(existingFaqs) ? existingFaqs : []);
    } catch {
      setFaqs([]);
    }
    
    // Parse existing images
    try {
      let images: string[] = [];
      
      if (business.imageurls) {
        if (typeof business.imageurls === 'string') {
          images = JSON.parse(business.imageurls);
        } else if (Array.isArray(business.imageurls)) {
          images = business.imageurls as string[];
        }
      } else if (business.imageurl) {
        images = [business.imageurl];
      }
      
      // Add any additional images from business fields
      const additionalImages = [];
      if (business.logo && typeof business.logo === 'string' && business.logo.startsWith('http')) {
        additionalImages.push(business.logo);
      }
      
      const allImages = [...images, ...additionalImages].filter(Boolean);
      const uniqueImages = Array.from(new Set(allImages));
      setBusinessImages(Array.isArray(uniqueImages) ? uniqueImages : []);
    } catch (error) {
      setBusinessImages([]);
    }
    
    editModal.open();
  };

  const closeEditor = () => {
    setEditingBusiness(null);
    setFaqs([]);
    setBusinessImages([]);
    editForm.reset();
    editModal.close();
  };

  // FAQ management
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Image management
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !editingBusiness) return;

    setUploadingImages(true);
    
    try {
      console.log('Files selected for upload:', files.length, 'files');
      
      // Future Azure integration placeholder
      // import { uploadToAzure } from '@/lib/azure-storage';
      // const uploadResults = await uploadToAzure(files);
      // const newImageUrls = uploadResults.map(result => result.url);
      // setBusinessImages([...businessImages, ...newImageUrls]);
      
      toast({
        title: "Upload Ready",
        description: `Ready to upload ${files.length} photos. Azure Blob Storage integration will be configured next.`,
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const removeImage = (imageUrl: string) => {
    setBusinessImages(businessImages.filter(url => url !== imageUrl));
  };

  return {
    // State
    editingBusiness,
    faqs,
    businessImages,
    uploadingImages,
    
    // Form
    editForm,
    editModal,
    
    // Actions
    openEditor,
    closeEditor,
    addFaq,
    updateFaq,
    removeFaq,
    handleFileUpload,
    removeImage,
    
    // Loading states
    isUpdating: updateBusiness.isPending,
  };
}