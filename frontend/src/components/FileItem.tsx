import React from 'react';
import { FileText, Image, File, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface FileItemProps {
  file: UploadedFile;
  onDelete: (id: string) => void;
}

export function FileItem({ file, onDelete }: FileItemProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    if (type === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img 
          src={file.url} 
          alt={file.name}
          className="w-12 h-12 object-cover rounded"
        />
      );
    }
    
    return (
      <div className="w-12 h-12 bg-accent rounded flex items-center justify-center">
        {getFileIcon(file.type)}
      </div>
    );
  };

  return (
    <Card className="p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        {getPreview()}
        
        <div className="flex-1 min-w-0">
          <p className="truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(file.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}