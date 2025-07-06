
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { SalesManagement } from '@/components/SalesManagement';
import { ExpenseTracking } from '@/components/ExpenseTracking';
import { LossesManagement } from '@/components/LossesManagement';
import { AssetPortfolio } from '@/components/AssetPortfolio';
import { FinancialReports } from '@/components/FinancialReports';
import { Settings } from '@/components/Settings';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading, signIn, signOut } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }

        toast({
          title: "Selamat datang kembali!",
          description: "Berhasil masuk ke dashboard Sayyida Fashion.",
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
        description: "Anda telah berhasil keluar dari sistem.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <SalesManagement />;
      case 'expenses':
        return <ExpenseTracking />;
      case 'losses':
        return <LossesManagement />;
      case 'assets':
        return <AssetPortfolio />;
      case 'reports':
        return <FinancialReports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
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
    >
      {renderTabContent()}
    </Layout>
  );
};

export default Index;
