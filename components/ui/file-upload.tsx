'use client';

import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface FileUploadProps {
  accept: Record<string, string[]>;
  onFileSelect: (file: File) => void;
  label: string;
  className?: string;
  value?: File | null;
}

export const FileUpload = ({ accept, onFileSelect, label, className, value }: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (value.type.startsWith('image/')) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        onFileSelect(acceptedFiles[0]);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/30 text-center flex flex-col items-center justify-center min-h-[150px]',
        isDragActive && 'border-primary bg-primary/5',
        className
      )}
    >
      <input {...getInputProps()} />
      
      {value ? (
        <div className="relative w-full h-full flex items-center justify-center">
             {preview ? (
                <img src={preview} alt="Preview" className="max-h-[120px] rounded shadow-md object-contain" />
             ) : (
                <div className="flex items-center gap-2 text-primary font-bold">
                    <Upload className="w-5 h-5" />
                    {value.name}
                </div>
             )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-muted p-3 rounded-full inline-flex">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground/60">Drag & drop or click</p>
        </div>
      )}
    </div>
  );
};
