import { useContent } from "@/contexts/ContentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

/**
 * Test component to demonstrate the content management system
 * Shows how database-driven content replaces hardcoded strings
 */
export function ContentTest() {
  const { t, isLoading, error } = useContent();

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading content...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600">
            <p className="font-semibold">Content Loading Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Content Management System Test
          <Badge variant="secondary">Live Database</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-600">Header Content</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Site Title:</strong> {t('header.siteTitle')}</p>
              <p><strong>Home:</strong> {t('header.navigation.home')}</p>
              <p><strong>Categories:</strong> {t('header.navigation.categories')}</p>
              <p><strong>Featured:</strong> {t('header.navigation.featured')}</p>
              <p><strong>Sign In:</strong> {t('header.auth.signIn')}</p>
              <p><strong>Add Business:</strong> {t('header.auth.addBusiness')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-600">Search & Forms</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Search Query:</strong> {t('search.placeholder.query')}</p>
              <p><strong>Location:</strong> {t('search.placeholder.location')}</p>
              <p><strong>Search Button:</strong> {t('search.button.search')}</p>
              <p><strong>Required Field:</strong> {t('forms.required')}</p>
              <p><strong>Submit:</strong> {t('forms.submit')}</p>
              <p><strong>Cancel:</strong> {t('forms.cancel')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-600">Business Content</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Phone:</strong> {t('business.contact.phone')}</p>
              <p><strong>Website:</strong> {t('business.contact.website')}</p>
              <p><strong>Featured Badge:</strong> {t('business.featured.badge')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-600">Error Messages</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Network Title:</strong> {t('errors.network.title')}</p>
              <p><strong>Network Message:</strong> {t('errors.network.message')}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-sm text-gray-600 mb-2">Missing Key Test</h3>
          <p className="text-sm">
            <strong>Missing Key Example:</strong> {t('this.key.does.not.exist')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Missing keys display as [key.name] to help identify content gaps during development.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}