import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CSVPreviewTable } from './CSVPreviewTable';
import { parseCSVData, validateCSVData, type CSVRow, type ValidationResult } from '@/utils/csvSalesUtils';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CSVImportDialog({ open, onOpenChange, onSuccess }: CSVImportDialogProps) {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      'transaction_date,customer_name,product_type,purchase_price,selling_price,marketplace_fee,payment_method,description',
      '2024-01-15,Siti Aminah,rajut,45000,75000,5000,full_payment,Rajut warna biru',
      '2024-01-16,Budi Santoso,kaos,25000,45000,0,cod,Kaos cotton premium',
      '2024-01-17,Maria Elena,dress,60000,95000,7000,split_payment_shopee,Dress motif bunga'
    ];
    
    const csvContent = templateData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_penjualan.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "Template CSV berhasil diunduh"
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      const parsedData = parseCSVData(text);
      const validations = validateCSVData(parsedData);
      
      setCsvData(parsedData);
      setValidationResults(validations);
      setStep('preview');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!user) return;

    const validRows = csvData.filter((_, index) => 
      validationResults[index]?.isValid
    );

    if (validRows.length === 0) {
      toast({
        title: "Error",
        description: "No valid rows to import",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      const salesData = validRows.map(row => ({
        transaction_date: row.transaction_date,
        customer_name: row.customer_name,
        product_type: row.product_type,
        purchase_price: parseFloat(row.purchase_price),
        selling_price: parseFloat(row.selling_price),
        marketplace_fee: parseFloat(row.marketplace_fee || '0'),
        payment_method: row.payment_method,
        description: row.description || null,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('sales')
        .insert(salesData);

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `${validRows.length} penjualan berhasil diimport`
      });

      setStep('complete');
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setCsvData([]);
    setValidationResults([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const validCount = validationResults.filter(r => r.isValid).length;
  const invalidCount = validationResults.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Penjualan dari CSV</DialogTitle>
          <DialogDescription>
            Upload file CSV untuk import data penjualan secara massal
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="csv-file" className="cursor-pointer">
                    <span className="text-lg font-medium">Pilih file CSV</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      atau klik untuk browse file
                    </p>
                  </Label>
                  <Input
                    ref={fileInputRef}
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Template CSV
                </Button>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Memproses file...</span>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{validCount} Valid</span>
                  </div>
                  {invalidCount > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{invalidCount} Invalid</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetDialog}>
                    Upload Ulang
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={validCount === 0 || isImporting}
                  >
                    {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isImporting ? 'Importing...' : `Import ${validCount} Data`}
                  </Button>
                </div>
              </div>

              <CSVPreviewTable 
                data={csvData} 
                validations={validationResults} 
              />
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Import Berhasil!</h3>
              <p className="text-muted-foreground mb-4">
                {validCount} data penjualan berhasil diimport
              </p>
              <Button onClick={handleClose}>
                Tutup
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}