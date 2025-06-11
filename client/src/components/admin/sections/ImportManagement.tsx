import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function ImportManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV Data Import</CardTitle>
          <CardDescription>Import businesses, users, and other data from CSV files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Business Import</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Upload Business CSV</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Select CSV File
                  </Button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Required CSV Format:</h4>
                  <p className="text-sm text-muted-foreground">
                    title, address, city, state, phone, website, category, description
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Import History</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">business-data-2025.csv</div>
                    <div className="text-sm text-muted-foreground">Imported 1,247 businesses • 2 days ago</div>
                  </div>
                  <Badge variant="default">Success</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">user-export.csv</div>
                    <div className="text-sm text-muted-foreground">Imported 89 users • 1 week ago</div>
                  </div>
                  <Badge variant="default">Success</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}