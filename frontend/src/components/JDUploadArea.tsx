import React, { useState, useCallback } from 'react';
import { Upload, FileText, Trash2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface JDFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface JDUploadAreaProps {
  jdFile: JDFile | null;
  onJDFileUploaded: (file: File) => void;
  onDeleteJD: () => void;
}

export function JDUploadArea({ jdFile, onJDFileUploaded, onDeleteJD }: JDUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onJDFileUploaded(files[0]); // Only take the first file
    }
  }, [onJDFileUploaded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onJDFileUploaded(files[0]); // Only take the first file
    }
  }, [onJDFileUploaded]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilePreview = (file: JDFile) => {
    if (file.type === 'application/pdf') {
      return (
        <div className="w-12 h-16 bg-blue-100 border border-blue-200 rounded flex flex-col items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-600 mt-1">PDF</span>
        </div>
      );
    }
    
    return (
      <div className="w-12 h-16 bg-accent border border-border rounded flex flex-col items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mt-1">DOC</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <h3 className="mb-2">Job Description Upload</h3>
        {!jdFile ? (
          <Card 
            className={`border-2 border-dashed transition-colors duration-200 p-4 h-full flex items-center justify-center min-h-[150px] ${
              isDragOver ? 'border-primary bg-accent/50' : 'border-muted-foreground/25'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-2">
              <div className="mx-auto w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="space-y-1">
                <p className="text-sm">Drop Job Description here</p>
                <p className="text-xs text-muted-foreground">Single file only</p>
              </div>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('jd-input')?.click()}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Choose JD File
              </Button>
              
              <input
                id="jd-input"
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>
          </Card>
        ) : (
          <Card className="p-3 h-full flex items-center min-h-[150px]">
            <div className="flex flex-col space-y-2 w-full">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-600">JD Uploaded</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeleteJD}
                  className="text-destructive hover:text-destructive ml-auto flex-shrink-0 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  {getFilePreview(jdFile)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm break-words leading-tight" title={jdFile.name}>
                    {jdFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(jdFile.size)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}