import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, MapPin } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";

interface BusinessBasicTabProps {
  values: {
    title: string;
    description: string;
    address: string;
  };
  onFieldUpdate: (field: string, value: string) => void;
}

/**
 * BusinessBasicTab - Form component for editing basic business information
 * 
 * Handles the core business details including name, description, and address.
 * Provides a clean interface for business owners to update their primary
 * business information with proper validation and user-friendly form controls.
 * 
 * @param values - Current form values for basic business fields
 * @param onFieldUpdate - Callback function to update field values in parent form
 * 
 * @returns JSX.Element - Form fields for basic business information editing
 * 
 * @example
 * <BusinessBasicTab 
 *   values={editForm.values}
 *   onFieldUpdate={editForm.updateField}
 * />
 */
export function BusinessBasicTab({ values, onFieldUpdate }: BusinessBasicTabProps) {
  const { t } = useContent();

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Label htmlFor="title" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {t("dashboard.businesses.form.name.label")} *
        </Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => onFieldUpdate("title", e.target.value)}
          placeholder={t("dashboard.businesses.form.name.placeholder")}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t("dashboard.businesses.form.description.label")}</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => onFieldUpdate("description", e.target.value)}
          placeholder={t("dashboard.businesses.form.description.placeholder")}
          rows={4}
        />
      </div>
      
      <div>
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {t("dashboard.businesses.form.address.label")}
        </Label>
        <Input
          id="address"
          value={values.address}
          onChange={(e) => onFieldUpdate("address", e.target.value)}
          placeholder={t("dashboard.businesses.form.address.placeholder")}
        />
      </div>
    </div>
  );
}