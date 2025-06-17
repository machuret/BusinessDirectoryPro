import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBusinessMutations } from "@/hooks/useBusinessData";
import { useFormManagement, useModalState } from "@/hooks/useFormManagement";
import { useToast } from "@/hooks/use-toast";
import type { BusinessWithCategory } from "@shared/schema";

/**
 * useBusinessEditor - Manages business editing state, form data, and submission logic
 * 
 * Centralizes all business editing functionality including form management,
 * FAQs handling, image management, and business updates. Provides a complete
 * interface for business owners to edit their business information.
 * 
 * @returns Object containing editing state, form handlers, and business update functionality
 */
export function useBusinessEditor() {
  const { toast } = useToast();
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [businessImages, setBusinessImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const { updateBusiness } = useBusinessMutations();
  const editModal = useModalState();

  // Fetch reviews for the currently editing business
  const { 
    data: businessReviews = [], 
    isLoading: reviewsLoading,
    error: reviewsError 
  } = useQuery({
    queryKey: [`/api/reviews`, editingBusiness?.placeid],
    enabled: !!editingBusiness?.placeid,
  });

  // Ensure businessReviews is always an array
  const reviews = Array.isArray(businessReviews) ? businessReviews : [];

  // Log reviews data when it changes for debugging
  useEffect(() => {
    if (reviews.length > 0) {
      console.log('Reviews loaded for business:', editingBusiness?.placeid, reviews);
    }
    if (reviewsError) {
      console.error('Error loading reviews:', reviewsError);
    }
  }, [reviews, editingBusiness?.placeid, reviewsError]);

  const editForm = useFormManagement({
    initialValues: {
      title: "",
      description: "",
      phone: "",
      website: "",
      address: "",
    },
    onSubmit: async (values) => {
      if (!editingBusiness) {
        toast({
          title: "Error",
          description: "No business selected for editing",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Combine form data with FAQs and images
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
        
        toast({
          title: "Success",
          description: "Business information updated successfully",
        });
        
        setEditingBusiness(null);
        editModal.close();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update business information",
          variant: "destructive",
        });
        console.error('Business update error:', error);
      }
    },
  });

  const handleEditBusiness = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
    editForm.updateFields({
      title: business.title || "",
      description: business.description || "",
      phone: business.phone || "",
      website: business.website || "",
      address: business.address || "",
    });
    
    // Parse existing FAQs from the 'faq' field
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
    } catch (error) {
      console.error('Error parsing FAQs:', error);
      setFaqs([]);
    }
    
    // Parse existing images from the business data
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
      console.error('Error parsing images:', error);
      setBusinessImages([]);
    }
    
    editModal.open();
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !editingBusiness) {
      toast({
        title: "Error",
        description: "No files selected or no business selected",
        variant: "destructive",
      });
      return;
    }

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
        description: (error as Error).message,
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
    // Business editing state
    editingBusiness,
    setEditingBusiness,
    
    // Form management
    editForm,
    editModal,
    
    // FAQ management
    faqs,
    addFaq,
    updateFaq,
    removeFaq,
    
    // Image management
    businessImages,
    uploadingImages,
    handleFileUpload,
    removeImage,
    
    // Reviews data
    reviews,
    reviewsLoading,
    reviewsError,
    
    // Business actions
    handleEditBusiness,
    
    // Loading states
    isUpdating: updateBusiness.isPending,
  };
}