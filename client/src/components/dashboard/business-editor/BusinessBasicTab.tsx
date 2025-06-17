import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContent } from "@/contexts/ContentContext";
import { Building2, MapPin } from "lucide-react";

interface BusinessBasicTabProps {
  editForm: any;
}

export function BusinessBasicTab({ editForm }: BusinessBasicTabProps) {
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
          value={editForm.values.title}
          onChange={(e) => editForm.updateField("title", e.target.value)}
          placeholder={t("dashboard.businesses.form.name.placeholder")}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t("dashboard.businesses.form.description.label")}</Label>
        <Textarea
          id="description"
          value={editForm.values.description}
          onChange={(e) => editForm.updateField("description", e.target.value)}
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
          value={editForm.values.address}
          onChange={(e) => editForm.updateField("address", e.target.value)}
          placeholder={t("dashboard.businesses.form.address.placeholder")}
        />
      </div>
    </div>
  );
}