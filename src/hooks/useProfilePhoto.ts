
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useProfilePhoto() {
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfilePhoto = async () => {
    if (!user) {
      setProfilePhoto(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .list(`${user.id}/`, { limit: 1 });

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(`${user.id}/${data[0].name}`);
        
        setProfilePhoto(urlData.publicUrl);
      } else {
        setProfilePhoto(null);
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
      setProfilePhoto(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfilePhoto();
  }, [user]);

  const refreshProfilePhoto = () => {
    loadProfilePhoto();
  };

  return {
    profilePhoto,
    loading,
    refreshProfilePhoto
  };
}
