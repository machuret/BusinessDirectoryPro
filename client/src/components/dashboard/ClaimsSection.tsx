import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

interface ClaimsSectionProps {
  claims: any[];
  isLoading: boolean;
}

export function ClaimsSection({ claims, isLoading }: ClaimsSectionProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: "outline" as const, icon: Clock, text: "Pending" },
      approved: { variant: "default" as const, icon: CheckCircle, text: "Approved" },
      rejected: { variant: "destructive" as const, icon: XCircle, text: "Rejected" },
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
            Ownership Claims
          </CardTitle>
          <CardDescription>Track your business ownership claim requests</CardDescription>
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
          Ownership Claims
        </CardTitle>
        <CardDescription>Track your business ownership claim requests</CardDescription>
      </CardHeader>
      <CardContent>
        {claims && claims.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">
                    {claim.businessTitle || claim.business?.title || "Unknown Business"}
                  </TableCell>
                  <TableCell>
                    {claim.createdAt 
                      ? new Date(claim.createdAt).toLocaleDateString()
                      : "Unknown"
                    }
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(claim.status)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {claim.message || claim.adminMessage || "No message"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No ownership claims</h3>
            <p className="text-gray-600">You haven't submitted any business ownership claims yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Default export for backward compatibility
export default ClaimsSection;