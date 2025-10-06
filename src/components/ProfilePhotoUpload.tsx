import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  userName: string;
  onPhotoUpdate?: (url: string) => void;
}

export const ProfilePhotoUpload = ({ currentPhotoUrl, userName, onPhotoUpdate }: ProfilePhotoUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5242880) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setUploading(true);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Please log in to upload a profile photo');
        return;
      }

      const userId = session.user.id;

      // Delete old avatar if exists
      if (photoUrl) {
        try {
          const oldPath = photoUrl.split('/').slice(-2).join('/');
          await supabase.storage.from('avatars').remove([oldPath]);
        } catch (error) {
          console.log('Could not delete old avatar:', error);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      setPhotoUrl(publicUrl);
      onPhotoUpdate?.(publicUrl);
      toast.success('Profile photo updated successfully');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-primary/10">
          {photoUrl && <AvatarImage src={photoUrl} alt={userName} />}
          <AvatarFallback className="text-4xl bg-primary/10">{userName?.[0]}</AvatarFallback>
        </Avatar>
        
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full h-10 w-10 border-2 border-background"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Click the camera icon to upload a profile photo. Max size: 5MB
      </p>
    </div>
  );
};
