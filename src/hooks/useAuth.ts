import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Definisikan tipe untuk data profil
interface Profile {
  role: 'manager' | 'admin' | 'karyawan';
  full_name?: string;
  avatar_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // State untuk menyimpan profil
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data profil pengguna
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (data) setProfile(data as Profile);

    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null); // Reset profil jika gagal
    }
  }, []);


  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null); // Hapus profil saat logout
        }
        
        setLoading(false);
      }
    );

    // Cek sesi yang sudah ada saat pertama kali memuat
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        const currentUser = session.user;
        setUser(currentUser);
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    profile, // Kembalikan profil pengguna
    role: profile?.role, // Kembalikan peran untuk kemudahan akses
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
