import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useContent } from "@/contexts/ContentContext";
import { Phone, Globe, Clock } from "lucide-react";

interface BusinessContactTabProps {
  editForm: any;
}

export function BusinessContactTab({ editForm }: BusinessContactTabProps) {
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
          value={editForm.values.phone}
          onChange={(e) => editForm.updateField("phone", e.target.value)}
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
          value={editForm.values.website}
          onChange={(e) => editForm.updateField("website", e.target.value)}
          placeholder={t("dashboard.businesses.form.website.placeholder")}
        />
      </div>
      
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t("dashboard.businesses.form.hours.title")}
        </h4>
        <p className="text-sm text-muted-foreground">
          {t("dashboard.businesses.form.hours.description")}
        </p>
      </div>
    </div>
  );
}