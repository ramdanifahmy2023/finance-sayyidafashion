
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Settings as SettingsIcon, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  LogOut,
  CheckCircle,
  XCircle,
  Save,
  TestTube
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CompanyProfile {
  companyName: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
}

export function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Form states
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: 'Sayyida Fashion',
    businessType: 'Fashion/Clothing',
    phone: '',
    email: user?.email || '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('companyProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(prev => ({ ...prev, ...parsedProfile }));
      } catch (error) {
        console.error('Error loading saved profile:', error);
      }
    }
    
    // Check connection status
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data, error } = await supabase.from('sales').select('id').limit(1);
      setConnectionStatus(error ? 'disconnected' : 'connected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('companyProfile', JSON.stringify(profile));
      
      toast({
        title: "Berhasil",
        description: "Profil perusahaan berhasil disimpan"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan profil perusahaan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.from('sales').select('count').limit(1);
      
      if (error) throw error;
      
      setConnectionStatus('connected');
      toast({
        title: "Koneksi Berhasil",
        description: "Database terhubung dengan baik"
      });
    } catch (error) {
      setConnectionStatus('disconnected');
      toast({
        title: "Koneksi Gagal",
        description: "Tidak dapat terhubung ke database",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user?.id);
      
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id);
      
      const { data: lossesData } = await supabase
        .from('losses')
        .select('*')
        .eq('user_id', user?.id);

      // Create CSV content
      const csvContent = [
        'Type,Date,Description,Amount,Category',
        ...(salesData || []).map(item => 
          `Penjualan,${item.transaction_date},${item.customer_name} - ${item.product_type},${item.selling_price},Sales`
        ),
        ...(expensesData || []).map(item => 
          `Pengeluaran,${item.transaction_date},${item.description},${item.amount},${item.category}`
        ),
        ...(lossesData || []).map(item => 
          `Kerugian,${item.transaction_date},${item.description},${item.amount},${item.loss_type}`
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sayyida_fashion_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "Data berhasil diekspor"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengekspor data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        supabase.from('sales').delete().eq('user_id', user?.id),
        supabase.from('expenses').delete().eq('user_id', user?.id),
        supabase.from('losses').delete().eq('user_id', user?.id),
        supabase.from('assets').delete().eq('user_id', user?.id)
      ]);

      toast({
        title: "Berhasil",
        description: "Semua data berhasil direset"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mereset data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Berhasil keluar",
        description: "Anda telah keluar dari sistem"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal keluar dari sistem",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola pengaturan aplikasi dan profil perusahaan</p>
      </div>

      {/* Company Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil Perusahaan
          </CardTitle>
          <CardDescription>
            Informasi dasar perusahaan Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nama Perusahaan</Label>
              <Input
                id="companyName"
                value={profile.companyName}
                onChange={(e) => setProfile(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Nama perusahaan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Jenis Bisnis</Label>
              <Input
                id="businessType"
                value={profile.businessType}
                onChange={(e) => setProfile(prev => ({ ...prev, businessType: e.target.value }))}
                placeholder="Jenis bisnis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Nomor telepon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email perusahaan"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Alamat lengkap perusahaan"
            />
          </div>
          <Button onClick={handleProfileSave} disabled={loading} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </CardContent>
      </Card>

      {/* App Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Preferensi Aplikasi
          </CardTitle>
          <CardDescription>
            Pengaturan tampilan dan format aplikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Format Mata Uang</Label>
              <Input value="IDR (Rupiah)" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Format Tanggal</Label>
              <Input value="DD/MM/YYYY" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Bahasa</Label>
              <Input value="Indonesian" disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manajemen Data
          </CardTitle>
          <CardDescription>
            Kelola data dan backup aplikasi Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleExportData} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Ekspor Data ke CSV
            </Button>
            <Button variant="outline" disabled>
              <Upload className="h-4 w-4 mr-2" />
              Import Data (Segera Hadir)
            </Button>
          </div>
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Semua Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Reset Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus SEMUA data transaksi Anda secara permanen. 
                    Data yang dihapus tidak dapat dikembalikan. Apakah Anda yakin?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
                    Ya, Hapus Semua Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Database Connection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Koneksi Database
          </CardTitle>
          <CardDescription>
            Status koneksi dan konfigurasi database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : connectionStatus === 'disconnected' ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
              )}
              <div>
                <p className="font-medium">Supabase Database</p>
                <p className="text-sm text-muted-foreground">
                  Status: {connectionStatus === 'connected' ? 'Terhubung' : 
                           connectionStatus === 'disconnected' ? 'Terputus' : 'Memeriksa...'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTestConnection}
              disabled={testingConnection}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testingConnection ? 'Testing...' : 'Test Koneksi'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Keluar dari Aplikasi
          </CardTitle>
          <CardDescription>
            Keluar dari sesi dan kembali ke halaman login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin keluar dari aplikasi? Anda perlu login kembali untuk mengakses data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Ya, Keluar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
