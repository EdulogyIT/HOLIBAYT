import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user');
    
    if (error) {
      console.error('Error creating admin user:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Admin user created:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Failed to create admin user' };
  }
};

// Auto-create admin user on app initialization
createAdminUser().then(result => {
  if (result.success) {
    console.log('✅ Admin user setup complete');
  } else {
    console.log('ℹ️ Admin user may already exist or creation failed:', result.error);
  }
});