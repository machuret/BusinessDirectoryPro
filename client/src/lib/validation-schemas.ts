import { z } from 'zod';

// Base validation patterns for reuse across forms
export const validationPatterns = {
  // Name validation
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),

  // Email validation
  email: z.string()
    .email("Please enter a valid email address")
    .max(100, "Email address is too long"),

  // Phone validation (optional)
  phoneOptional: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),

  // Phone validation (required)
  phoneRequired: z.string()
    .min(1, "Phone number is required")
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),

  // Password validation
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  // Simple password (for existing accounts)
  passwordSimple: z.string()
    .min(6, "Password must be at least 6 characters"),

  // Subject validation
  subject: z.string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject must be less than 100 characters"),

  // Message validation
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),

  // Short message validation
  messageShort: z.string()
    .min(5, "Message must be at least 5 characters")
    .max(500, "Message must be less than 500 characters"),

  // URL validation (optional)
  urlOptional: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),

  // Required URL validation
  urlRequired: z.string()
    .url("Please enter a valid URL"),

  // Business name validation
  businessName: z.string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),

  // Address validation
  address: z.string()
    .min(5, "Please enter a complete address")
    .max(200, "Address is too long"),

  // ZIP/Postal code validation
  zipCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),

  // Review rating validation
  rating: z.number()
    .min(1, "Please select a rating")
    .max(5, "Rating cannot exceed 5 stars"),

  // Review title validation
  reviewTitle: z.string()
    .min(5, "Review title must be at least 5 characters")
    .max(100, "Review title must be less than 100 characters"),

  // File validation helper
  fileRequired: z.any()
    .refine((files) => files?.length > 0, "Please select at least one file"),

  // Multiple files validation
  filesOptional: z.any()
    .optional(),
};

// Common form schemas
export const authSchemas = {
  login: z.object({
    email: validationPatterns.email,
    password: validationPatterns.passwordSimple,
    rememberMe: z.boolean().default(false)
  }),

  register: z.object({
    email: validationPatterns.email,
    password: validationPatterns.password,
    confirmPassword: z.string(),
    firstName: validationPatterns.name,
    lastName: validationPatterns.name,
    agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms of service")
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  forgotPassword: z.object({
    email: validationPatterns.email
  }),

  resetPassword: z.object({
    password: validationPatterns.password,
    confirmPassword: z.string(),
    token: z.string().min(1, "Reset token is required")
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
};

export const contactSchemas = {
  general: z.object({
    name: validationPatterns.name,
    email: validationPatterns.email,
    phone: validationPatterns.phoneOptional,
    subject: validationPatterns.subject,
    message: validationPatterns.message,
    inquiryType: z.enum(['general', 'business', 'technical', 'billing'], {
      required_error: 'Please select an inquiry type'
    })
  }),

  business: z.object({
    senderName: validationPatterns.name,
    senderEmail: validationPatterns.email,
    senderPhone: validationPatterns.phoneOptional,
    message: validationPatterns.message,
    businessId: z.string().min(1, "Business ID is required")
  }),

  support: z.object({
    name: validationPatterns.name,
    email: validationPatterns.email,
    subject: validationPatterns.subject,
    message: validationPatterns.message,
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
  })
};

export const businessSchemas = {
  claim: z.object({
    ownerName: validationPatterns.name,
    ownerEmail: validationPatterns.email,
    ownerPhone: validationPatterns.phoneRequired,
    verificationMethod: z.enum(['document', 'phone', 'email', 'postcard']),
    message: validationPatterns.messageShort,
    documents: validationPatterns.filesOptional,
    businessId: z.string().min(1, "Business ID is required")
  }),

  review: z.object({
    reviewerName: validationPatterns.name,
    title: validationPatterns.reviewTitle,
    rating: validationPatterns.rating,
    comment: validationPatterns.message
  }),

  submission: z.object({
    title: validationPatterns.businessName,
    description: validationPatterns.message,
    address: validationPatterns.address,
    phone: validationPatterns.phoneRequired,
    email: validationPatterns.email,
    website: validationPatterns.urlOptional,
    category: z.string().min(1, "Please select a category"),
    hours: z.object({
      monday: z.string().optional(),
      tuesday: z.string().optional(),
      wednesday: z.string().optional(),
      thursday: z.string().optional(),
      friday: z.string().optional(),
      saturday: z.string().optional(),
      sunday: z.string().optional()
    }).optional()
  })
};

// Utility type extractors
export type LoginFormData = z.infer<typeof authSchemas.login>;
export type RegisterFormData = z.infer<typeof authSchemas.register>;
export type ContactFormData = z.infer<typeof contactSchemas.general>;
export type BusinessContactFormData = z.infer<typeof contactSchemas.business>;
export type ClaimBusinessFormData = z.infer<typeof businessSchemas.claim>;
export type ReviewFormData = z.infer<typeof businessSchemas.review>;
export type BusinessSubmissionFormData = z.infer<typeof businessSchemas.submission>;