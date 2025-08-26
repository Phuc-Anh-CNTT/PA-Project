import React from 'react';
import { FileItem, UploadedFile } from './FileItem';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface FileListProps {
  files: UploadedFile[];
  onDeleteFile: (id: string) => void;
}

export function FileList({ files, onDeleteFile }: FileListProps) {
  return (
    <div className="w-80 bg-card border-l flex flex-col h-full">
      <div className="p-4 border-b">
        <h2>Uploaded Files</h2>
        <p className="text-sm text-muted-foreground">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No files uploaded yet</p>
              <p className="text-sm">Drag and drop files to get started</p>
            </div>
          ) : (
            files.map((file, index) => (
              <div key={file.id}>
                <FileItem 
                  file={file} 
                  onDelete={onDeleteFile}
                />
                {index < files.length - 1 && <Separator className="my-3" />}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}