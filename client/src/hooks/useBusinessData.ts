import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BusinessWithCategory, InsertBusiness } from "@shared/schema";

export function useBusinesses(params?: {
  categoryId?: number;
  search?: string;
  city?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());
  if (params?.search) searchParams.set("search", params.search);
  if (params?.city) searchParams.set("city", params.city);
  if (params?.featured) searchParams.set("featured", "true");
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());
  
  const queryKey = searchParams.toString() 
    ? ["/api/businesses", params] 
    : ["/api/businesses"];
    
  return useQuery<BusinessWithCategory[]>({
    queryKey,
  });
}

export function useBusiness(identifier: string) {
  return useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/${identifier}`],
    enabled: !!identifier,
  });
}

export function useFeaturedBusinesses(limit = 6) {
  return useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/businesses/featured?limit=${limit}`],
  });
}

export function useUserBusinesses(userId?: string) {
  return useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/user/businesses"],
    enabled: !!userId,
  });
}

export function useBusinessMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createBusiness = useMutation({
    mutationFn: async (businessData: InsertBusiness) => {
      const response = await apiRequest("POST", "/api/businesses", businessData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      toast({
        title: "Business created",
        description: "Business has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating business",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBusiness = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBusiness> }) => {
      const response = await apiRequest("PATCH", `/api/businesses/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      toast({
        title: "Business updated",
        description: "Business has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating business",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBusiness = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/businesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      toast({
        title: "Business deleted",
        description: "Business has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting business",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createBusiness,
    updateBusiness,
    deleteBusiness,
  };
}