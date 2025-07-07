import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, X, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ProfilePhotoUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load existing profile photo on component mount
  React.useEffect(() => {
    loadProfilePhoto();
  }, [user]);

  async function loadProfilePhoto() {
    if (!user) return;

    try {
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .list(`${user.id}/`, { limit: 1 });

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(`${user.id}/${data[0].name}`);
        
        setProfilePhoto(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format file tidak didukung",
        description: "Silakan pilih file JPG, PNG, JPEG, atau WEBP",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 2MB",
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

  async function uploadPhoto() {
    if (!user || !fileInputRef.current?.files?.[0]) return;

    setUploading(true);
    const file = fileInputRef.current.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `profile.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      // Remove existing photo first
      await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      setProfilePhoto(urlData.publicUrl);
      setPreviewImage(null);
      setIsDialogOpen(false);

      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diperbarui"
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Gagal mengunggah foto profil",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    if (!user) return;

    setUploading(true);
    try {
      const { data: files } = await supabase.storage
        .from('profile-photos')
        .list(`${user.id}/`);

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${user.id}/${file.name}`);
        await supabase.storage
          .from('profile-photos')
          .remove(filePaths);
      }

      setProfilePhoto(null);
      setIsDialogOpen(false);

      toast({
        title: "Berhasil",
        description: "Foto profil berhasil dihapus"
      });

    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus foto profil",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profilePhoto || ''} alt="Profile" />
            <AvatarFallback className="bg-gradient-primary text-white">
              {profilePhoto ? <User className="h-4 w-4" /> : 'SF'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="h-3 w-3 text-white" />
          </div>
        </Button>
      </DialogTrigger>
      
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
                onClick={uploadPhoto}
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
                onClick={removePhoto}
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
              onClick={() => {
                setPreviewImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Batal
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
