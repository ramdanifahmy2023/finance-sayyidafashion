import { useState } from 'react';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ProfilePhotoDialog } from '@/components/ProfilePhotoDialog';

export function ProfilePhotoUpload() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { profilePhoto, uploading, uploadPhoto, removePhoto, validateFile } = useProfilePhoto();

  return (
    <>
      <ProfileAvatar 
        profilePhoto={profilePhoto}
        onClick={() => setIsDialogOpen(true)}
      />
      
      <ProfilePhotoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        profilePhoto={profilePhoto}
        uploading={uploading}
        onUpload={uploadPhoto}
        onRemove={removePhoto}
        validateFile={validateFile}
      />
    </>
  );
}