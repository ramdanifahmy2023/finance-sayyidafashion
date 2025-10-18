import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { LayoutDashboard, ShoppingBag, CreditCard, TrendingDown, PiggyBank, FileText, Settings, LogOut, Fingerprint } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

// Import semua komponen halaman
import { Dashboard } from './Dashboard';
import { SalesManagement } from './SalesManagement';
import { ExpenseTracking } from './ExpenseTracking';
import { LossesManagement } from './LossesManagement';
import { AssetPortfolio } from './AssetPortfolio';
import { FinancialReports } from './FinancialReports';
import { Settings as SettingsPage } from './Settings';
import { AttendancePage } from '@/pages/AttendancePage';

interface LayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const TabsNavigation = ({ role }: { role: string | undefined }) => {
  const getGridColsClass = () => {
    switch (role) {
      case 'karyawan': return 'grid-cols-2';
      case 'admin': return 'grid-cols-5';
      default: return 'grid-cols-7';
    }
  };

  if (role === 'karyawan') {
    return (
      <TabsList className={`grid w-full bg-muted/30 p-1 ${getGridColsClass()}`}>
        <TabsTrigger value="absensi" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Fingerprint className="h-4 w-4" />
          <span className="hidden sm:inline">Absensi</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Pengaturan</span>
        </TabsTrigger>
      </TabsList>
    );
  }

  if (role === 'admin') {
    return (
      <TabsList className={`grid w-full bg-muted/30 p-1 ${getGridColsClass()}`}>
        <TabsTrigger value="sales"><ShoppingBag className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Penjualan</span></TabsTrigger>
        <TabsTrigger value="expenses"><CreditCard className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Pengeluaran</span></TabsTrigger>
        <TabsTrigger value="losses"><TrendingDown className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Kerugian</span></TabsTrigger>
        <TabsTrigger value="reports"><FileText className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Laporan</span></TabsTrigger>
        <TabsTrigger value="settings"><Settings className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Pengaturan</span></TabsTrigger>
      </TabsList>
    );
  }

  return (
    <TabsList className={`grid w-full bg-muted/30 p-1 ${getGridColsClass()}`}>
      <TabsTrigger value="dashboard"><LayoutDashboard className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
      <TabsTrigger value="sales"><ShoppingBag className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Penjualan</span></TabsTrigger>
      <TabsTrigger value="expenses"><CreditCard className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Pengeluaran</span></TabsTrigger>
      <TabsTrigger value="losses"><TrendingDown className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Kerugian</span></TabsTrigger>
      <TabsTrigger value="assets"><PiggyBank className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Aset</span></TabsTrigger>
      <TabsTrigger value="reports"><FileText className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Laporan</span></TabsTrigger>
      <TabsTrigger value="settings"><Settings className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Pengaturan</span></TabsTrigger>
    </TabsList>
  );
};

export function Layout({ activeTab, onTabChange, onLogout }: LayoutProps) {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-surface">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <div>
                <h1 className="font-display font-semibold text-lg text-foreground">Finance Sayyida Fashion</h1>
                <p className="text-xs text-muted-foreground">Smart Web Finance Tech with A.I. Analysis</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div><ProfilePhotoUpload /></div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => onTabChange('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <div className="mb-6">
            <TabsNavigation role={role} />
          </div>
          
          <main>
            {/* Konten untuk semua peran */}
            <TabsContent value="dashboard"><Dashboard /></TabsContent>
            <TabsContent value="sales"><SalesManagement /></TabsContent>
            <TabsContent value="expenses"><ExpenseTracking /></TabsContent>
            <TabsContent value="losses"><LossesManagement /></TabsContent>
            <TabsContent value="assets"><AssetPortfolio /></TabsContent>
            <TabsContent value="reports"><FinancialReports /></TabsContent>
            <TabsContent value="settings"><SettingsPage /></TabsContent>
            <TabsContent value="absensi"><AttendancePage /></TabsContent>
          </main>
        </Tabs>
      </div>
    </div>
  );
}

// Komponen TabsNavigation dipindahkan ke sini agar tidak menyebabkan render ulang yang tidak perlu
const TabsNavigation = ({ role }: { role: string | undefined }) => {
  const getGridColsClass = () => {
    switch (role) {
      case 'karyawan': return 'grid-cols-2';
      case 'admin': return 'grid-cols-5';
      default: return 'grid-cols-7';
    }
  };

  return (
    <TabsList className={`grid w-full bg-muted/30 p-1 ${getGridColsClass()}`}>
      {role === 'karyawan' ? (
        <>
          <TabsTrigger value="absensi" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Fingerprint className="h-4 w-4" /><span className="hidden sm:inline">Absensi</span></TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Pengaturan</span></TabsTrigger>
        </>
      ) : role === 'admin' ? (
        <>
          <TabsTrigger value="sales" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ShoppingBag className="h-4 w-4" /><span className="hidden sm:inline">Penjualan</span></TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CreditCard className="h-4 w-4" /><span className="hidden sm:inline">Pengeluaran</span></TabsTrigger>
          <TabsTrigger value="losses" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><TrendingDown className="h-4 w-4" /><span className="hidden sm:inline">Kerugian</span></TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Laporan</span></TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Pengaturan</span></TabsTrigger>
        </>
      ) : ( // Manager
        <>
          <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ShoppingBag className="h-4 w-4" /><span className="hidden sm:inline">Penjualan</span></TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CreditCard className="h-4 w-4" /><span className="hidden sm:inline">Pengeluaran</span></TabsTrigger>
          <TabsTrigger value="losses" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><TrendingDown className="h-4 w-4" /><span className="hidden sm:inline">Kerugian</span></TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><PiggyBank className="h-4 w-4" /><span className="hidden sm:inline">Aset</span></TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Laporan</span></TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Pengaturan</span></TabsTrigger>
        </>
      )}
    </TabsList>
  );
};
