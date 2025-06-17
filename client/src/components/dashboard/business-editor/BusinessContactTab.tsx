import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone, Globe } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";

interface BusinessContactTabProps {
  values: {
    phone: string;
    website: string;
  };
  onFieldUpdate: (field: string, value: string) => void;
}

/**
 * BusinessContactTab - Form component for editing business contact information
 * 
 * Manages phone number and website URL fields for business listings.
 * Provides validation-ready inputs with proper formatting and user guidance
 * for contact information that customers use to reach the business.
 * 
 * @param values - Current form values for contact fields (phone, website)
 * @param onFieldUpdate - Callback function to update field values in parent form
 * 
 * @returns JSX.Element - Form fields for business contact information editing
 * 
 * @example
 * <BusinessContactTab 
 *   values={editForm.values}
 *   onFieldUpdate={editForm.updateField}
 * />
 */
export function BusinessContactTab({ values, onFieldUpdate }: BusinessContactTabProps) {
  const { t } = useContent();

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {t("dashboard.businesses.form.phone.label")}
        </Label>
        <Input
          id="phone"
          value={values.phone}
          onChange={(e) => onFieldUpdate("phone", e.target.value)}
          placeholder={t("dashboard.businesses.form.phone.placeholder")}
        />
      </div>
      
      <div>
        <Label htmlFor="website" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {t("dashboard.businesses.form.website.label")}
        </Label>
        <Input
          id="website"
          type="url"
          value={values.website}
          onChange={(e) => onFieldUpdate("website", e.target.value)}
          placeholder={t("dashboard.businesses.form.website.placeholder")}
        />
      </div>
    </div>
  );
}