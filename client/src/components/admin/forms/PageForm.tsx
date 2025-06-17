import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Page schema for form validation  
export const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  content: z.string().min(1, "Content is required"),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  status: z.enum(["draft", "published"]),
  type: z.enum(["page", "blog", "help"]),
});

export type PageFormData = z.infer<typeof pageSchema>;

interface PageFormProps {
  onSubmit: (data: PageFormData) => void;
  initialValues?: Partial<PageFormData>;
  isSubmitting?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}

/**
 * PageForm - A comprehensive form component for creating and editing pages, blog posts, and help articles with rich text editing capabilities.
 * 
 * This component provides a complete content management interface with form validation, 
 * SEO metadata fields, rich text editing via ReactQuill, and flexible submission handling.
 * Supports both creation and editing workflows with proper form state management and validation.
 * 
 * @param onSubmit - Callback function triggered when form is submitted with valid data
 * @param initialValues - Optional initial form values for editing existing pages. When provided, populates form fields with existing data
 * @param isSubmitting - Optional boolean indicating form submission state. Defaults to false. Controls button disabled state and loading text
 * @param submitLabel - Optional custom text for submit button. Defaults to "Save Page". Allows customization for different contexts
 * @param showCancel - Optional boolean to display cancel button. Defaults to false. Useful in modal or multi-step workflows
 * @param onCancel - Optional callback function for cancel button click. Required when showCancel is true
 * 
 * @returns JSX.Element - A responsive form with title, slug, content (rich text), meta description, meta keywords, type selection, and status controls
 * 
 * @example
 * // Creating a new page
 * <PageForm 
 *   onSubmit={(data) => createPage(data)}
 *   submitLabel="Create Page"
 * />
 * 
 * @example
 * // Editing an existing page with cancel option
 * <PageForm 
 *   onSubmit={(data) => updatePage(pageId, data)}
 *   initialValues={{
 *     title: "About Us",
 *     slug: "about-us",
 *     content: "<p>Welcome to our company...</p>",
 *     status: "published",
 *     type: "page"
 *   }}
 *   isSubmitting={mutation.isPending}
 *   submitLabel="Update Page"
 *   showCancel={true}
 *   onCancel={() => setIsEditing(false)}
 * />
 * 
 * @example
 * // Creating a blog post
 * <PageForm 
 *   onSubmit={(data) => createBlogPost(data)}
 *   initialValues={{ type: "blog", status: "draft" }}
 *   submitLabel="Save Draft"
 * />
 */
export default function PageForm({
  onSubmit,
  initialValues,
  isSubmitting = false,
  submitLabel = "Save Page",
  showCancel = false,
  onCancel
}: PageFormProps) {
  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: initialValues?.title || "",
      slug: initialValues?.slug || "",
      content: initialValues?.content || "",
      metaDescription: initialValues?.metaDescription || "",
      metaKeywords: initialValues?.metaKeywords || "",
      status: initialValues?.status || "draft",
      type: initialValues?.type || "page",
    },
  });

  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'image', 'align'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Page title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="page-slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="SEO meta description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metaKeywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Keywords</FormLabel>
                <FormControl>
                  <Input placeholder="keyword1, keyword2, keyword3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="help">Help Article</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <div className="h-64">
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ height: '200px' }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end mt-8">
          {showCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}