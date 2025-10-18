import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { LayoutDashboard, ShoppingBag, CreditCard, TrendingDown, PiggyBank, FileText, Settings, LogOut } from 'lucide-react';

// Import semua komponen halaman
import { Dashboard } from './Dashboard';
import { SalesManagement } from './SalesManagement';
import { ExpenseTracking } from './ExpenseTracking';
import { LossesManagement } from './LossesManagement';
import { AssetPortfolio } from './AssetPortfolio';
import { FinancialReports } from './FinancialReports';
import { Settings as SettingsPage } from './Settings';

interface LayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const baseTriggerClass = "flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";
const spanClass = "hidden sm:inline";

export function Layout({ activeTab, onTabChange, onLogout }: LayoutProps) {
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
            <TabsList className="grid w-full bg-muted/30 p-1 grid-cols-7">
              <TabsTrigger value="dashboard" className={baseTriggerClass}>
                <LayoutDashboard className="h-4 w-4" />
                <span className={spanClass}>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="sales" className={baseTriggerClass}>
                <ShoppingBag className="h-4 w-4" />
                <span className={spanClass}>Penjualan</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className={baseTriggerClass}>
                <CreditCard className="h-4 w-4" />
                <span className={spanClass}>Pengeluaran</span>
              </TabsTrigger>
              <TabsTrigger value="losses" className={baseTriggerClass}>
                <TrendingDown className="h-4 w-4" />
                <span className={spanClass}>Kerugian</span>
              </TabsTrigger>
              <TabsTrigger value="assets" className={baseTriggerClass}>
                <PiggyBank className="h-4 w-4" />
                <span className={spanClass}>Aset</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className={baseTriggerClass}>
                <FileText className="h-4 w-4" />
                <span className={spanClass}>Laporan</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className={baseTriggerClass}>
                <Settings className="h-4 w-4" />
                <span className={spanClass}>Pengaturan</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <main>
            <TabsContent value="dashboard"><Dashboard /></TabsContent>
            <TabsContent value="sales"><SalesManagement /></TabsContent>
            <TabsContent value="expenses"><ExpenseTracking /></TabsContent>
            <TabsContent value="losses"><LossesManagement /></TabsContent>
            <TabsContent value="assets"><AssetPortfolio /></TabsContent>
            <TabsContent value="reports"><FinancialReports /></TabsContent>
            <TabsContent value="settings"><SettingsPage /></TabsContent>
          </main>
        </Tabs>
      </div>
    </div>
  );
}
