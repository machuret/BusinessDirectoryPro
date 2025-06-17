import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";

interface ClaimsSectionProps {
  claims: any[];
  isLoading: boolean;
}

/**
 * ClaimsSection - Dashboard component for displaying and managing business ownership claims
 * 
 * Provides a comprehensive interface for business owners to view the status of their ownership
 * claims, including pending, approved, and rejected claims. Displays claim details in a table
 * format with status badges and timestamps. Handles loading states and empty states gracefully
 * with appropriate messaging and visual indicators.
 * 
 * @param claims - Array of ownership claim objects containing business details and claim status
 * @param isLoading - Boolean indicating whether claims data is currently being fetched
 * 
 * @returns JSX.Element - A responsive card containing claims table with status indicators and empty states
 * 
 * @example
 * // Basic usage in dashboard
 * <ClaimsSection 
 *   claims={userClaims}
 *   isLoading={claimsQuery.isLoading}
 * />
 * 
 * @example
 * // Usage with empty state
 * <ClaimsSection 
 *   claims={[]}
 *   isLoading={false}
 * />
 */
export function ClaimsSection({ claims, isLoading }: ClaimsSectionProps) {
  const { t } = useContent();
  
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: "outline" as const, icon: Clock, text: t("dashboard.claims.status.pending") },
      approved: { variant: "default" as const, icon: CheckCircle, text: t("dashboard.claims.status.approved") },
      rejected: { variant: "destructive" as const, icon: XCircle, text: t("dashboard.claims.status.rejected") },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            {t("dashboard.claims.title")}
          </CardTitle>
          <CardDescription>{t("dashboard.claims.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          {t("dashboard.claims.title")}
        </CardTitle>
        <CardDescription>{t("dashboard.claims.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {claims && claims.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.claims.table.business")}</TableHead>
                <TableHead>{t("dashboard.claims.table.date")}</TableHead>
                <TableHead>{t("dashboard.claims.table.status")}</TableHead>
                <TableHead>{t("dashboard.claims.table.message")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">
                    {claim.businessTitle || claim.business?.title || t("dashboard.claims.table.unknown")}
                  </TableCell>
                  <TableCell>
                    {claim.createdAt 
                      ? new Date(claim.createdAt).toLocaleDateString()
                      : t("dashboard.claims.table.unknown")
                    }
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(claim.status)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {claim.message || claim.adminMessage || t("dashboard.claims.table.nomessage")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">{t("dashboard.claims.empty.title")}</h3>
            <p className="text-gray-600">{t("dashboard.claims.empty.description")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Default export for backward compatibility
export default ClaimsSection;