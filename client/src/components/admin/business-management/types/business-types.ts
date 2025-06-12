import { z } from "zod";

export interface Business {
  placeid: string;
  name?: string;
  businessname?: string;
  title?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  hours?: string;
  categoryId: number;
  featured: boolean;
  verified?: boolean;
  status?: string;
  rating: number;
  reviewCount?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: { name: string };
}

export const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  hours: z.string().optional(),
  categoryId: z.number().min(1, "Category is required"),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  faq: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  ownerInfo: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export type BusinessFormData = z.infer<typeof businessSchema>;

export interface BusinessFilters {
  search: string;
  category: string;
  status: string;
  featured?: boolean;
}

export interface BusinessTableProps {
  businesses: Business[];
  isLoading: boolean;
  selectedBusinesses: string[];
  onSelectBusiness: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (business: Business) => void;
  onView: (business: Business) => void;
  onDelete: (id: string) => void;
}

export interface BusinessFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingBusiness?: Business | null;
  categories: Array<{ id: number; name: string }>;
  onSubmit: (data: BusinessFormData) => void;
  isSubmitting: boolean;
}

export interface BusinessFiltersProps {
  filters: BusinessFilters;
  onFiltersChange: (filters: BusinessFilters) => void;
  categories: Array<{ id: number; name: string }>;
}

export interface BusinessActionsProps {
  selectedBusinesses: string[];
  onBulkDelete: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkCategoryChange: (categoryId: number) => void;
  onCreateNew: () => void;
}