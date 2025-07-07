import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProfilePhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profilePhoto: string | null;
  uploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
  onRemove: () => Promise<boolean>;
  validateFile: (file: File) => string | null;
}

export function ProfilePhotoDialog({
  open,
  onOpenChange,
  profilePhoto,
  uploading,
  onUpload,
  onRemove,
  validateFile
}: ProfilePhotoDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: "File tidak valid",
        description: error,
        variant: "destructive"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    const success = await onUpload(file);
    
    if (success) {
      setPreviewImage(null);
      onOpenChange(false);
    }
  }

  async function handleRemove() {
    const success = await onRemove();
    if (success) {
      onOpenChange(false);
    }
  }

  function handleCancel() {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Foto Profil</DialogTitle>
          <DialogDescription>
            Unggah atau ubah foto profil Anda. Format yang didukung: JPG, PNG, WEBP (maks. 2MB)
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* Current/Preview Photo */}
          <Avatar className="h-24 w-24">
            <AvatarImage src={previewImage || profilePhoto || ''} alt="Profile" />
            <AvatarFallback className="bg-gradient-primary text-white text-xl">
              {previewImage || profilePhoto ? <User className="h-8 w-8" /> : 'SF'}
            </AvatarFallback>
          </Avatar>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Pilih Foto
            </Button>

            {previewImage && (
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={uploading}
                className="bg-gradient-primary hover:opacity-90"
              >
                {uploading ? 'Mengunggah...' : 'Simpan'}
              </Button>
            )}

            {profilePhoto && !previewImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            )}
          </div>

          {previewImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              Batal
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}