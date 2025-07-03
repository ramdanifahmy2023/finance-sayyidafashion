import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock authentication - replace with Supabase auth when connected
      if (email === 'demo@sayyida.com' && password === 'demo123') {
        setIsAuthenticated(true);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to Sayyida Fashion dashboard.",
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-display font-bold mb-4">Sales Management</h2>
            <p className="text-muted-foreground">Connect Supabase to manage sales data</p>
          </div>
        );
      case 'expenses':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-display font-bold mb-4">Expense Tracking</h2>
            <p className="text-muted-foreground">Connect Supabase to track expenses</p>
          </div>
        );
      case 'losses':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-display font-bold mb-4">Loss Management</h2>
            <p className="text-muted-foreground">Connect Supabase to manage losses</p>
          </div>
        );
      case 'assets':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-display font-bold mb-4">Asset Portfolio</h2>
            <p className="text-muted-foreground">Connect Supabase to manage assets</p>
          </div>
        );
      case 'reports':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-display font-bold mb-4">Financial Reports</h2>
            <p className="text-muted-foreground">Connect Supabase to generate reports</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-display font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Connect Supabase to manage settings</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        isLoading={isLoading}
        error={error}
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
