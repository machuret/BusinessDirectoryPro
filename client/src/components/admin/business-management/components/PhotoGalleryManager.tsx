import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, ExternalLink, Image, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PhotoGalleryManagerProps {
  businessId: string;
  business?: any;
}

export default function PhotoGalleryManager({ businessId, business }: PhotoGalleryManagerProps) {
  const { toast } = useToast();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Use business data from props
  const isLoading = false;

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      const response = await apiRequest('DELETE', `/api/admin/businesses/${businessId}/photos`, {
        photoUrl
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/businesses', businessId] });
      toast({
        title: "Photo deleted",
        description: "Photo has been removed from the gallery",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting photo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (photoUrls: string[]) => {
      const response = await apiRequest('DELETE', `/api/admin/businesses/${businessId}/photos/bulk`, {
        photoUrls
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/businesses', businessId] });
      setSelectedPhotos([]);
      toast({
        title: "Photos deleted",
        description: `${selectedPhotos.length} photos have been removed`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting photos",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading photo gallery...</p>
        </div>
      </div>
    );
  }

  const photos = business?.images ? (Array.isArray(business.images) ? business.images : JSON.parse(business.images as string)) : [];

  if (!photos || photos.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This business has no photos in their gallery yet.
        </AlertDescription>
      </Alert>
    );
  }

  const handlePhotoSelect = (photoUrl: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoUrl) 
        ? prev.filter(url => url !== photoUrl)
        : [...prev, photoUrl]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedPhotos.length > 0) {
      bulkDeleteMutation.mutate(selectedPhotos);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Photo Gallery</h3>
          <p className="text-sm text-muted-foreground">
            Manage business photos and gallery images
          </p>
        </div>
        {selectedPhotos.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedPhotos.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo: string, index: number) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all ${
              selectedPhotos.includes(photo) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handlePhotoSelect(photo)}
          >
            <CardContent className="p-2">
              <div className="aspect-square relative overflow-hidden rounded-md">
                <img
                  src={photo}
                  alt={`Business photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {selectedPhotos.includes(photo) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Badge variant="default">Selected</Badge>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  Photo {index + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(photo, '_blank');
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhotoMutation.mutate(photo);
                    }}
                    disabled={deletePhotoMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        Total photos: {photos.length}
      </div>
    </div>
  );
}