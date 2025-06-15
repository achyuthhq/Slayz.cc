import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Cloud, File as FileIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface FileUploaderProps {
  files?: any[];
  onUploadComplete?: (url: string) => void;
  type?: 'logo' | 'background' | 'cursor';
}

export function FileUploader({ files = [], onUploadComplete, type = 'logo' }: FileUploaderProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        const formData = new FormData();
        const field = type === 'logo' ? 'logo' : type === 'background' ? 'backgroundImage' : 'cursor';
        formData.append(field, file);

        const res = await fetch('/api/profile', {
          method: 'PATCH',
          body: formData,
          credentials: 'include'
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }
        const data = await res.json();
        return { data, field };
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },
    onSuccess: ({ data, field }) => {
      // Invalidate both user and profile queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      if (user?.username) {
        queryClient.invalidateQueries({ queryKey: [`/api/profile/${user.username}`] });
      }

      toast({
        title: "File uploaded successfully",
        description: `Your ${type} has been updated.`
      });

      if (onUploadComplete && data[field]) {
        onUploadComplete(data[field]);
      }
      setUploadProgress({});
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress({});
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file: File) => {
        const key = file.name;
        setUploadProgress(prev => ({ ...prev, [key]: 0 }));

        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[key] || 0;
            if (current >= 95) {
              clearInterval(interval);
              return prev;
            }
            return { ...prev, [key]: Math.min(current + 10, 95) };
          });
        }, 100);

        uploadMutation.mutate(file);
      });
    },
    [uploadMutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: type === 'cursor' ? 1024 * 1024 : 50 * 1024 * 1024, // 1MB for cursor, 50MB for others
    accept: type === 'cursor' 
      ? {
          'image/x-win-bitmap': ['.cur'],
          'image/vnd.microsoft.icon': ['.ico'],
          'application/x-win-bitmap': ['.ani'],
          'image/png': ['.png'],
          'image/gif': ['.gif'],
          'image/svg+xml': ['.svg']
        }
      : type === 'logo'
      ? {
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/gif': ['.gif'],
          'image/webp': ['.webp'],
          'image/avif': ['.avif'],
          'image/svg+xml': ['.svg'],
          'image/bmp': ['.bmp'],
          'image/tiff': ['.tiff', '.tif'],
          'image/x-icon': ['.ico']
        }
      : {
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/gif': ['.gif'],
          'image/webp': ['.webp'],
          'image/avif': ['.avif'],
          'image/svg+xml': ['.svg'],
          'image/bmp': ['.bmp'],
          'image/tiff': ['.tiff', '.tif'],
          'video/mp4': ['.mp4'],
          'video/webm': ['.webm'],
          'video/ogg': ['.ogg']
        }
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        <Cloud className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Maximum file size: {type === 'cursor' ? '1MB' : '50MB'}
        </p>
      </div>

      {Object.entries(uploadProgress).map(([key, progress]) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{key}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ))}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 rounded-md border"
            >
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(file.size / 1024)}KB)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}