import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface PageFormData {
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: "draft" | "published";
  type: "page" | "blog" | "help";
}

export interface UsePageMutationsCallbacks {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useCreatePage(callbacks?: UsePageMutationsCallbacks) {
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: PageFormData) => {
      const pageData = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        seoTitle: data.title, // Use title as SEO title
        seoDescription: data.metaDescription || "",
        status: data.status,
        authorId: (user as any)?.id || "admin-user" // Use actual user ID or fallback
      };
      const res = await apiRequest("POST", "/api/admin/pages", pageData);
      return await res.json();
    },
    onSuccess: () => {
      // Force a complete refresh of the pages query
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/pages"] });
      callbacks?.onCreateSuccess?.();
      toast({
        title: "Success",
        description: "Page created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePage(callbacks?: UsePageMutationsCallbacks) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PageFormData }) => {
      const pageData = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        seoTitle: data.title,
        seoDescription: data.metaDescription || "",
        status: data.status,
        authorId: "demo-admin"
      };
      const res = await apiRequest("PUT", `/api/admin/pages/${id}`, pageData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      callbacks?.onUpdateSuccess?.();
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeletePage(callbacks?: UsePageMutationsCallbacks) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      callbacks?.onDeleteSuccess?.();
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}