import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  TrendingDown, 
  PiggyBank,
  FileText,
  Settings,
  LogOut,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function Layout({ children, activeTab, onTabChange, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <div>
                <h1 className="font-display font-semibold text-lg text-foreground">
                  Sayyida Fashion
                </h1>
                <p className="text-xs text-muted-foreground">Pelacakan Keuangan</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="Profile" />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
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
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-muted/30 p-1">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sales"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Penjualan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="expenses"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Pengeluaran</span>
              </TabsTrigger>
              <TabsTrigger 
                value="losses"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <TrendingDown className="h-4 w-4" />
                <span className="hidden sm:inline">Kerugian</span>
              </TabsTrigger>
              <TabsTrigger 
                value="assets"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <PiggyBank className="h-4 w-4" />
                <span className="hidden sm:inline">Aset</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reports"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Laporan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Pengaturan</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}