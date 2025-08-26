import React, { useState, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface FileUploadAreaProps {
  onFilesUploaded: (files: File[]) => void;
}

export function FileUploadArea({ onFilesUploaded }: FileUploadAreaProps) {
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
      onFilesUploaded(files);
    }
  }, [onFilesUploaded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesUploaded(files);
    }
  }, [onFilesUploaded]);

  return (
    <div className="flex-1 p-6">
      <Card 
        className={`h-full border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center min-h-[400px] ${
          isDragOver ? 'border-primary bg-accent/50' : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3>Drag and drop your files here</h3>
            <p className="text-muted-foreground">or click to browse</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="default"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <FileText className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Supports images, PDFs, and documents
          </p>
        </div>
      </Card>
    </div>
  );
}