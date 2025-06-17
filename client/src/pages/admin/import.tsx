import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/admin/import/businesses', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setResults(result);
      setProgress(100);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        imported: 0,
        errors: []
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Import</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload a CSV file with business data. Maximum file size: 10MB
                </p>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                  </AlertDescription>
                </Alert>
              )}

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600">Importing businesses...</p>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                className="w-full"
              >
                {importing ? 'Importing...' : 'Import Businesses'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Format Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <code>title</code> - Business name</li>
                  <li>• <code>category</code> - Business category</li>
                  <li>• <code>city</code> - City location</li>
                  <li>• <code>state</code> - State/Province</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Optional Columns:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <code>description</code> - Business description</li>
                  <li>• <code>phone</code> - Contact phone</li>
                  <li>• <code>website</code> - Website URL</li>
                  <li>• <code>email</code> - Contact email</li>
                  <li>• <code>address</code> - Street address</li>
                  <li>• <code>postal_code</code> - ZIP/Postal code</li>
                </ul>
              </div>

              <Button variant="outline" className="w-full">
                Download Sample CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              {results.success ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.imported || 0}
                  </div>
                  <div className="text-sm text-green-700">Imported</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.skipped || 0}
                  </div>
                  <div className="text-sm text-yellow-700">Skipped</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {results.errors?.length || 0}
                  </div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
              </div>

              {results.errors && results.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Import Errors:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {results.errors.map((error: any, index: number) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}