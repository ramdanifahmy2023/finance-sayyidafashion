import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';

interface ProfileAvatarProps {
  profilePhoto: string | null;
  onClick: () => void;
}

export function ProfileAvatar({ profilePhoto, onClick }: ProfileAvatarProps) {
  return (
    <Button 
      variant="ghost" 
      className="relative h-8 w-8 rounded-full p-0 hover:bg-muted/50"
      onClick={onClick}
    >
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
  );
}