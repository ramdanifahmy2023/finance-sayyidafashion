import { TransactionListModal } from '@/components/TransactionListModal';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Transactions = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <TransactionListModal
      isOpen={true}
      onClose={() => window.history.back()}
    />
  );
};

export default Transactions;