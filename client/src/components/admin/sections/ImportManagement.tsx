import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle, Download, Eye, Loader2, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    field: string;
    value: any;
    message: string;
  }>;
  warnings: string[];
  duplicatesSkipped: number;
  created: number;
  updated: number;
  message: string;
}

interface PreviewData {
  headers: string[];
  sampleData: any[];
  totalRows: number;
  validationErrors: Array<{
    row: number;
    field: string;
    value: any;
    message: string;
  }>;
}

export function ImportManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'options' | 'complete'>('upload');
  const [importOptions, setImportOptions] = useState({
    updateDuplicates: false,
    skipDuplicates: true,
    batchSize: 50
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      handlePreview(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      handlePreview(file);
    }
  };

  const handlePreview = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch('/api/admin/import-csv-preview', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to preview CSV');

      const data = await response.json();
      setPreviewData(data);
      setCurrentStep('preview');
    } catch (error) {
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Failed to preview CSV",
        variant: "destructive"
      });
    }
    setIsProcessing(false);
  };

  const handleValidate = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await fetch('/api/admin/import-csv-validate', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setImportResult(result);
      setCurrentStep('options');
    } catch (error) {
      toast({
        title: "Validation failed",
        description: error instanceof Error ? error.message : "Failed to validate CSV",
        variant: "destructive"
      });
    }
    setIsProcessing(false);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);
      formData.append('updateDuplicates', String(importOptions.updateDuplicates));
      formData.append('skipDuplicates', String(importOptions.skipDuplicates));
      formData.append('batchSize', String(importOptions.batchSize));

      const response = await fetch('/api/admin/import-csv', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setImportResult(result);
      setCurrentStep('complete');
      
      toast({
        title: "Import completed",
        description: result.message,
        variant: result.errors.length > 0 ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import CSV",
        variant: "destructive"
      });
    }
    setIsProcessing(false);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadErrorReport = () => {
    if (!importResult?.errors.length) return;
    
    const csv = [
      'Row,Field,Value,Error',
      ...importResult.errors.map(error => 
        `${error.row},"${error.field}","${error.value}","${error.message}"`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV Business Import</CardTitle>
          <CardDescription>
            Import business data from CSV files with validation and error handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 'upload' && (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-muted-foreground transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                role="button"
                aria-label="Upload CSV file area"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Upload Business CSV</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Select CSV File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Required fields:</strong> title, placeid<br />
                  <strong>Optional fields:</strong> address, city, phone, email, website, description, categoryname, etc.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {currentStep === 'preview' && previewData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview Data</h3>
                <Badge variant="outline">{previewData.totalRows} rows total</Badge>
              </div>

              {previewData.validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found {previewData.validationErrors.length} validation errors in the first 10 rows.
                    Please review and fix these issues before importing.
                  </AlertDescription>
                </Alert>
              )}

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-3 border-b">
                  <p className="font-medium">Sample Data (first 5 rows)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {previewData.headers.slice(0, 6).map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left font-medium">
                            {header}
                          </th>
                        ))}
                        {previewData.headers.length > 6 && (
                          <th className="px-3 py-2 text-left font-medium">
                            +{previewData.headers.length - 6} more...
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.sampleData.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t">
                          {previewData.headers.slice(0, 6).map((header, colIndex) => (
                            <td key={colIndex} className="px-3 py-2 max-w-32 truncate">
                              {row[header] || '-'}
                            </td>
                          ))}
                          {previewData.headers.length > 6 && (
                            <td className="px-3 py-2 text-muted-foreground">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleValidate} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Validate Data
                </Button>
                <Button variant="outline" onClick={resetImport}>
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'options' && importResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Import Options</h3>
                <Badge variant={importResult.errors.length > 0 ? "destructive" : "default"}>
                  {importResult.success} valid rows, {importResult.errors.length} errors
                </Badge>
              </div>

              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {importResult.errors.length} validation errors found. 
                    Only {importResult.success} rows will be imported.
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2"
                      onClick={downloadErrorReport}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download Error Report
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="update-duplicates" className="text-sm font-medium">
                    Handle Duplicates
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="update-duplicates"
                      checked={importOptions.updateDuplicates}
                      onCheckedChange={(checked) =>
                        setImportOptions((prev: any) => ({ 
                          ...prev, 
                          updateDuplicates: checked,
                          skipDuplicates: !checked 
                        }))
                      }
                      aria-describedby="duplicates-helper"
                    />
                    <Label htmlFor="update-duplicates" className="text-sm text-muted-foreground cursor-pointer">
                      {importOptions.updateDuplicates ? 'Update existing records' : 'Skip duplicate records'}
                    </Label>
                  </div>
                  <p id="duplicates-helper" className="text-xs text-muted-foreground">
                    Choose how to handle businesses that already exist in the database
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="batch-size" className="text-sm font-medium">
                    Batch Size
                  </Label>
                  <Input
                    id="batch-size"
                    type="number"
                    min="10"
                    max="200"
                    value={importOptions.batchSize}
                    onChange={(e) =>
                      setImportOptions((prev: any) => ({ 
                        ...prev, 
                        batchSize: parseInt(e.target.value) || 50 
                      }))
                    }
                    className="focus-visible:ring-primary"
                    aria-describedby="batch-size-helper"
                  />
                  <p id="batch-size-helper" className="text-xs text-muted-foreground">
                    Number of records to process at once (10-200)
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleImport} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Import {importResult.success} Records
                </Button>
                <Button variant="outline" onClick={resetImport}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'complete' && importResult && (
            <div className="space-y-4">
              <div className="text-center" role="status" aria-live="polite">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Import Complete</h3>
                <p className="text-muted-foreground">{importResult.message}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Import statistics">
                <div className="text-center p-4 bg-muted/20 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary" aria-label={`${importResult.created} records created`}>
                    {importResult.created}
                  </div>
                  <div className="text-sm text-muted-foreground">Created</div>
                </div>
                <div className="text-center p-4 bg-muted/20 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary" aria-label={`${importResult.updated} records updated`}>
                    {importResult.updated}
                  </div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                </div>
                <div className="text-center p-4 bg-muted/20 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-foreground" aria-label={`${importResult.duplicatesSkipped} records skipped`}>
                    {importResult.duplicatesSkipped}
                  </div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center p-4 bg-muted/20 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-destructive" aria-label={`${importResult.errors.length} errors encountered`}>
                    {importResult.errors.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="error-details" className="text-sm font-medium">Error Details</Label>
                  <div 
                    id="error-details"
                    className="max-h-40 overflow-y-auto border border-border rounded-lg bg-muted/20"
                    role="log"
                    aria-label="Import validation errors"
                  >
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div 
                        key={index} 
                        className="p-3 border-b border-border last:border-b-0 text-sm"
                        role="listitem"
                      >
                        <span className="font-medium text-foreground">Row {error.row}:</span>
                        <span className="text-muted-foreground ml-1">{error.field}</span>
                        <span className="text-destructive ml-1">- {error.message}</span>
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <div className="p-3 text-sm text-muted-foreground text-center bg-muted/50">
                        +{importResult.errors.length - 10} more errors...
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={downloadErrorReport}
                    className="w-full sm:w-auto"
                    aria-describedby="error-download-helper"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Error Report
                  </Button>
                  <p id="error-download-helper" className="text-xs text-muted-foreground">
                    Downloads a CSV file with all validation errors for review
                  </p>
                </div>
              )}

              <Button onClick={resetImport} className="w-full">
                Import Another File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}