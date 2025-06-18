import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string | null;
  isMultiple?: boolean;
  count?: number;
  onConfirm?: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmDialog({ 
  open, 
  onClose, 
  businessId, 
  isMultiple = false, 
  count = 0, 
  onConfirm, 
  isLoading = false 
}: DeleteConfirmDialogProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/businesses/${id}`);
      // DELETE requests return 204 No Content, no JSON to parse
      if (res.status === 204) {
        return null;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({
        title: "Success",
        description: "Business deleted successfully"
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    if (isMultiple && onConfirm) {
      onConfirm();
    } else if (businessId) {
      deleteMutation.mutate(businessId);
    }
  };

  const isPending = isMultiple ? isLoading : deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            {isMultiple ? (
              <>
                Are you sure you want to delete {count} business{count !== 1 ? 'es' : ''}? This action cannot be undone.
                All associated data including reviews and ratings will be permanently removed.
              </>
            ) : (
              <>
                Are you sure you want to delete this business? This action cannot be undone.
                All associated data including reviews and ratings will be permanently removed.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isMultiple ? `Delete ${count} Business${count !== 1 ? 'es' : ''}` : 'Delete Business'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}