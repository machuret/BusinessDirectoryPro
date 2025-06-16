import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreatePage, useUpdatePage, useDeletePage } from "@/hooks/usePageMutations";
import PageForm, { type PageFormData } from "@/components/admin/forms/PageForm";
import PagesTable from "@/components/admin/tables/PagesTable";

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: "draft" | "published";
  type: "page" | "blog" | "help";
  createdAt: string;
  updatedAt: string;
}

export default function CMSManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  // Fetch pages
  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ["/api/admin/pages"],
  });

  // Custom hooks for page mutations
  const createMutation = useCreatePage({
    onCreateSuccess: () => {
      setIsCreateDialogOpen(false);
    }
  });

  const updateMutation = useUpdatePage({
    onUpdateSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedPage(null);
    }
  });

  const deleteMutation = useDeletePage();

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setIsEditDialogOpen(true);
  };

  const handlePreview = (page: Page) => {
    setSelectedPage(page);
    setIsPreviewDialogOpen(true);
  };

  const handleCreateSubmit = (data: PageFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: PageFormData) => {
    if (selectedPage) {
      updateMutation.mutate({ id: selectedPage.id, data });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pages Management</h2>
          <p className="text-muted-foreground">Create and manage website pages, blog posts, and help articles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>Add a new page to your website</DialogDescription>
            </DialogHeader>
            <PageForm
              onSubmit={handleCreateSubmit}
              isSubmitting={createMutation.isPending}
              submitLabel="Create Page"
              showCancel={true}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages Table with integrated filtering */}
      <PagesTable
        pages={pages}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(pageId) => deleteMutation.mutate(pageId)}
        onPreview={handlePreview}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>Update page content and settings</DialogDescription>
          </DialogHeader>
          {selectedPage && (
            <PageForm
              onSubmit={handleUpdateSubmit}
              initialValues={{
                title: selectedPage.title,
                slug: selectedPage.slug,
                content: selectedPage.content,
                metaDescription: selectedPage.metaDescription || "",
                metaKeywords: selectedPage.metaKeywords || "",
                status: selectedPage.status,
                type: selectedPage.type,
              }}
              isSubmitting={updateMutation.isPending}
              submitLabel="Update Page"
              showCancel={true}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {selectedPage?.title}</DialogTitle>
            <DialogDescription>Page preview</DialogDescription>
          </DialogHeader>
          {selectedPage && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Title:</h3>
                <p>{selectedPage.title}</p>
              </div>
              <div>
                <h3 className="font-semibold">Slug:</h3>
                <p>/{selectedPage.slug}</p>
              </div>
              <div>
                <h3 className="font-semibold">Type:</h3>
                <p className="capitalize">{selectedPage.type}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status:</h3>
                <p className="capitalize">{selectedPage.status}</p>
              </div>
              {selectedPage.metaDescription && (
                <div>
                  <h3 className="font-semibold">Meta Description:</h3>
                  <p>{selectedPage.metaDescription}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold">Content:</h3>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedPage.content }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}