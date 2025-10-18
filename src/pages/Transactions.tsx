import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { TransactionListModal } from '@/components/TransactionListModal';
import { useAuth } from '@/hooks/useAuth';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout 
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      <div className="p-6">
        <TransactionListModal
          isOpen={true}
          onClose={() => window.history.back()}
        />
      </div>
    </Layout>
  );
};

export default Transactions;