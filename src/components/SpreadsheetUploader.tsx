import React, { useState, useRef } from 'react';
import { read, utils } from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileSpreadsheet, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ExpectedColumn {
  key: string;
  label: string;
  required?: boolean;
}

interface SpreadsheetUploaderProps {
  expectedColumns: ExpectedColumn[];
  onDataImported: (data: any[]) => void;
  title?: string;
}

export const SpreadsheetUploader: React.FC<SpreadsheetUploaderProps> = ({ 
  expectedColumns, 
  onDataImported,
  title = "Importar Planilha"
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [fileData, setFileData] = useState<any[]>([]);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  
  // mapping state: key is our expected column key, value is the file's header string
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to JSON array (first row is headers by default)
      const jsonData = utils.sheet_to_json(worksheet, { defval: "" });
      
      if (jsonData.length === 0) {
        toast({ title: "Erro", description: "A planilha está vazia.", variant: "destructive" });
        return;
      }

      // Extract headers from the first object
      const headers = Object.keys(jsonData[0]);
      setFileHeaders(headers);
      setFileData(jsonData);
      
      // Try to auto-map based on similar names
      const initialMapping: Record<string, string> = {};
      expectedColumns.forEach(exp => {
        const exactMatch = headers.find(h => h.toLowerCase().trim() === exp.label.toLowerCase().trim());
        if (exactMatch) {
          initialMapping[exp.key] = exactMatch;
        }
      });
      
      setColumnMapping(initialMapping);
      setIsMappingModalOpen(true);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na leitura",
        description: "Não foi possível ler o arquivo. Certifique-se de ser um .xlsx ou .csv válido.",
        variant: "destructive"
      });
    }
  };

  const handleProcessImport = () => {
    // Validate if required columns are mapped
    const missingRequired = expectedColumns.filter(col => col.required && !columnMapping[col.key]);
    
    if (missingRequired.length > 0) {
      toast({
        title: "Campos obrigatórios faltando",
        description: `Por favor, mapeie: ${missingRequired.map(m => m.label).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Process data using mapping
    const processedData = fileData.map(row => {
      const newRow: any = {};
      expectedColumns.forEach(col => {
        const mappedFileHeader = columnMapping[col.key];
        if (mappedFileHeader && row[mappedFileHeader] !== undefined && row[mappedFileHeader] !== "") {
          newRow[col.key] = row[mappedFileHeader];
        } else {
          newRow[col.key] = null; // or default values
        }
      });
      return newRow;
    });

    onDataImported(processedData);
    setIsMappingModalOpen(false);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    toast({
      title: "Importação Processada",
      description: `${processedData.length} registros foram extraídos com sucesso.`,
    });
  };

  return (
    <>
      <Card className="bg-white/5 border-white/10 w-full mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Faça upload de um arquivo .xlsx ou .csv para adicionar registros em lote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-3 bg-primary/20 rounded-full">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-zinc-300 font-medium mb-1">
                {file ? file.name : "Clique para selecionar um arquivo"}
              </p>
              <p className="text-zinc-500 text-sm">
                Suporta Excel (.xlsx) e CSV (.csv)
              </p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
        </CardContent>
      </Card>

      <Dialog open={isMappingModalOpen} onOpenChange={setIsMappingModalOpen}>
        <DialogContent className="bg-[#121214] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mapear Colunas da Planilha</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Associe as colunas encontradas no seu arquivo com os campos do nosso sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {expectedColumns.map((expectedCol) => (
              <div key={expectedCol.key} className="grid grid-cols-12 items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="col-span-5 flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    {expectedCol.label}
                    {expectedCol.required && <span className="text-red-400 ml-1">*</span>}
                  </Label>
                </div>
                
                <div className="col-span-1 text-zinc-500 flex justify-center">
                  →
                </div>

                <div className="col-span-6">
                  <Select
                    value={columnMapping[expectedCol.key] || "ignore"}
                    onValueChange={(value) => {
                      setColumnMapping(prev => ({
                        ...prev,
                        [expectedCol.key]: value === "ignore" ? "" : value
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full bg-black/40 border-white/10 text-white h-9">
                      <SelectValue placeholder="Ignorar campo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121214] border-white/10">
                      <SelectItem value="ignore" className="text-zinc-500 italic">-- Não importar --</SelectItem>
                      {fileHeaders.map((header) => (
                        <SelectItem key={header} value={header} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
                          Coluna: "{header}"
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="border-t border-white/10 pt-4 mt-2">
            <Button variant="ghost" onClick={() => setIsMappingModalOpen(false)} className="text-zinc-400 hover:text-white hover:bg-white/10">
              Cancelar
            </Button>
            <Button onClick={handleProcessImport} className="bg-primary hover:bg-primary/90 text-white">
              <Check className="w-4 h-4 mr-2" />
              Confirmar Importação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
