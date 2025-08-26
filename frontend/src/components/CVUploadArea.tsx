import React, { useState, useCallback } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface CVFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface CVUploadAreaProps {
  cvFiles: CVFile[];
  onCVFilesUploaded: (files: File[]) => void;
  onDeleteCV: (id: string) => void;
}

interface FilePreviewGridProps {
  files: File[];
}

const FilePreviewGrid: React.FC<FilePreviewGridProps> = ({ files }) => {
  return (
    <div className="grid grid-cols-5 gap-4 w-full">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-3 border rounded-lg shadow-sm bg-white"
        >
          {/* Icon hoặc preview */}
          <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded">
            <span className="text-red-500 font-bold">PDF</span>
          </div>

          {/* Tên file */}
          <p className="mt-2 text-xs text-center truncate w-full">
            {file.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">CV Upload</h1>

      {/* Upload input */}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Grid preview */}
      <FilePreviewGrid files={files} />
    </div>
  );
}

export function CVUploadArea({ cvFiles, onCVFilesUploaded, onDeleteCV }: CVUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragFiles, setDragFiles] = useState<File[]>([]);

  // --- Drag events ---
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];

    const traverseFileTree = (item: any): Promise<void> => {
      return new Promise((resolve) => {
        if (item.isFile) {
          item.file((file: File) => {
            files.push(file);
            resolve();
          });
        } else if (item.isDirectory) {
          const dirReader = item.createReader();
          dirReader.readEntries((entries: any[]) => {
            Promise.all(entries.map(traverseFileTree)).then(() => resolve());
          });
        } else resolve();
      });
    };

    const promises = items.map((item) => {
      const entry = (item as any).webkitGetAsEntry();
      if (entry) return traverseFileTree(entry);
      return Promise.resolve();
    });

    Promise.all(promises).then(() => {
      if (files.length > 0) {
        onCVFilesUploaded(files);
        setDragFiles(files);
      }
    });
  }, [onCVFilesUploaded]);

  // --- File picker ---
    const handleFileInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: File[] = Array.from(e.target.files || []);
        if (files.length > 0) {
          onCVFilesUploaded(files);
          setDragFiles(files); // OK vì đã là File[]
        }
      },
      [onCVFilesUploaded]
    );

  // --- File preview ---
  const getFilePreview = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return (
        <div className="w-16 h-20 bg-red-100 border border-red-200 rounded flex flex-col items-center justify-center">
          <FileText className="w-6 h-6 text-red-600" />
          <span className="text-xs text-red-600 mt-1">PDF</span>
        </div>
      );
    }
    return (
      <div className="w-16 h-20 bg-accent border border-border rounded flex flex-col items-center justify-center">
        <FileText className="w-6 h-6 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mt-1">DOC</span>
      </div>
    );
  };

  // --- Files to show (dragged or uploaded) ---
  const filesToShow = dragFiles.length > 0 ? dragFiles : cvFiles.map(f => new File([f.url], f.name, { type: f.type }));

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h3 className="mb-2">CV Upload</h3>
        <Card
          className={`border-2 border-dashed transition-colors duration-200 p-6 min-h-[650px] ${
            isDragOver ? 'border-primary bg-accent/50' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {filesToShow.length > 0 ? (
            <div className="grid grid-cols-5 gap-4">
              {filesToShow.map((file, idx) => {
                const isCVFile = (file as any).id; // check if cvFiles type
                const fileId = isCVFile ? (file as any).id : idx;
                const fileName = (file as any).name || file.name;
                const fileType = (file as any).type || file.type;

                return (
                  <div key={fileId} className="relative w-[125px] h-[160px] border rounded overflow-hidden flex items-center justify-center bg-gray-100">
                    {fileType.startsWith("image/") ? (
                      <img src={isCVFile ? (file as any).url : URL.createObjectURL(file)} alt={fileName} className="object-cover w-full h-full" />
                    ) : fileType.includes("pdf") ? (
                      <object
                        data={
                          (isCVFile ? (file as any).url : URL.createObjectURL(file)) +
                          "#toolbar=0&navpanes=0&scrollbar=0"
                        }
                        type="application/pdf"
                        className="w-full h-full object-cover pointer-events-none"
                        style={{ border: "none" }}
                      >
                        <p className="text-xs text-gray-500">PDF preview not available</p>
                      </object>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-200 text-xs">
                        DOC
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <p>Drop CV files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Multiple files allowed</p>
                </div>

                <Button variant="outline" onClick={() => document.getElementById('cv-input')?.click()}>
                  <FileText className="w-4 h-4 mr-2" />
                  Choose CV Files
                </Button>

                <input
                  id="cv-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}