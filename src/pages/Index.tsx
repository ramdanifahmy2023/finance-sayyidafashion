import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/LoginPage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const getDefaultTab = (role: string | undefined) => {
  switch (role) {
    case 'karyawan':
      return 'absensi';
    case 'admin':
      return 'sales';
    case 'manager':
    default:
      return 'dashboard';
  }
};

const Index = () => {
  const { user, loading, signIn, signOut, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (role) {
      setActiveTab(getDefaultTab(role));
    }
  }, [role]);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast({
        title: "Selamat datang kembali!",
        description: "Berhasil masuk ke dashboard.",
      });
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setActiveTab('dashboard');
      toast({
        title: "Berhasil keluar",
        description: "Anda telah berhasil keluar.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    />
  );
};

export default Index;
