import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
export function LoginPage({
  onLogin,
  isLoading,
  error
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };
  const fillDemo = () => {
    setEmail('demo@sayyida.com');
    setPassword('demo123');
  };
  return <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-glow">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Sayyida Fashion
          </h1>
          <p className="text-muted-foreground">
            Dashboard Pelacakan Keuangan
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="text-center p-3 bg-card rounded-lg border border-border shadow-soft">
            <TrendingUp className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Analisis Penjualan</p>
          </div>
          <div className="text-center p-3 bg-card rounded-lg border border-border shadow-soft">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Wawasan AI</p>
          </div>
          <div className="text-center p-3 bg-card rounded-lg border border-border shadow-soft">
            <ShoppingBag className="h-6 w-6 text-secondary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Lacak Inventori</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-card-elevated border-border shadow-medium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-display">Selamat Datang Kembali</CardTitle>
            <CardDescription>
              Masukkan kredensial Anda untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Masukkan email Anda" value={email} onChange={e => setEmail(e.target.value)} required className="bg-background border-border focus:ring-primary" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Masukkan kata sandi Anda" value={password} onChange={e => setPassword(e.target.value)} required className="bg-background border-border focus:ring-primary pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && <Alert className="border-destructive bg-destructive-light">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>}

              <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
                {isLoading ? 'Masuk...' : 'Masuk'}
              </Button>
            </form>

            {/* Demo Credentials */}
            
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Dibuat dengan ❤️ untuk bisnis fashion modern
        </p>
      </div>
    </div>;
}