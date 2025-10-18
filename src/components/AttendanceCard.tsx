import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';

// Fungsi untuk memformat waktu (HH:MM:SS)
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export function AttendanceCard() {
  const { todaysRecord, loading, clockIn, clockOut } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = () => {
    if (loading) {
      return <Badge variant="outline">Memuat...</Badge>;
    }
    if (!todaysRecord) {
      return <Badge variant="secondary">Belum Absen</Badge>;
    }
    if (todaysRecord.clock_in && !todaysRecord.clock_out) {
      return <Badge className="bg-green-500 text-white">Sedang Bekerja</Badge>;
    }
    if (todaysRecord.clock_in && todaysRecord.clock_out) {
      return <Badge variant="default">Selesai Bekerja</Badge>;
    }
    // Untuk status lain seperti 'ijin' atau 'sakit' bisa ditambahkan di sini
    return <Badge variant="outline">{todaysRecord.status}</Badge>;
  };

  const renderButtons = () => {
    if (loading) {
      return <Button disabled className="w-full"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</Button>;
    }
    if (!todaysRecord?.clock_in) {
      return (
        <Button onClick={clockIn} size="lg" className="w-full bg-green-600 hover:bg-green-700">
          <LogIn className="mr-2 h-5 w-5" /> Clock In
        </Button>
      );
    }
    if (todaysRecord.clock_in && !todaysRecord.clock_out) {
      return (
        <Button onClick={clockOut} size="lg" variant="destructive" className="w-full">
          <LogOut className="mr-2 h-5 w-5" /> Clock Out
        </Button>
      );
    }
    return (
      <Button disabled size="lg" className="w-full">
        Absensi hari ini sudah selesai
      </Button>
    );
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-display">Absensi Hari Ini</CardTitle>
        <CardDescription>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-muted rounded-lg border">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-lg">Waktu Saat Ini</span>
          </div>
          <p className="text-5xl font-bold font-mono tracking-tighter text-foreground">
            {formatTime(currentTime)}
          </p>
        </div>

        <div className="flex justify-between items-center bg-background p-4 rounded-lg border">
          <span className="font-medium text-foreground">Status Anda:</span>
          {getStatusBadge()}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-2">
                <p className="text-sm text-muted-foreground">Jam Masuk</p>
                <p className="text-lg font-semibold text-foreground">
                    {todaysRecord?.clock_in ? formatTime(new Date(todaysRecord.clock_in)) : '--:--:--'}
                </p>
            </div>
            <div className="p-2">
                <p className="text-sm text-muted-foreground">Jam Pulang</p>
                <p className="text-lg font-semibold text-foreground">
                    {todaysRecord?.clock_out ? formatTime(new Date(todaysRecord.clock_out)) : '--:--:--'}
                </p>
            </div>
        </div>

        <div>
          {renderButtons()}
        </div>
      </CardContent>
    </Card>
  );
}
