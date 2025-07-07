import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useProfilePhoto() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
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

  async function uploadPhoto(file: File) {
    if (!user) return false;

    setUploading(true);
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

      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diperbarui"
      });

      return true;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Gagal mengunggah foto profil",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    if (!user) return false;

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

      toast({
        title: "Berhasil",
        description: "Foto profil berhasil dihapus"
      });

      return true;
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus foto profil",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  }

  function validateFile(file: File): string | null {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return "Format file tidak didukung. Silakan pilih file JPG, PNG, JPEG, atau WEBP";
    }

    if (file.size > 2 * 1024 * 1024) {
      return "File terlalu besar. Ukuran file maksimal 2MB";
    }

    return null;
  }

  return {
    profilePhoto,
    uploading,
    uploadPhoto,
    removePhoto,
    validateFile
  };
}