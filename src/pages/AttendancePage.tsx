import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceCard } from '@/components/AttendanceCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AttendanceRecord } from '@/hooks/useAttendance';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'hadir':
      return 'bg-green-500 text-white';
    case 'sakit':
      return 'bg-yellow-500 text-white';
    case 'ijin':
      return 'bg-blue-500 text-white';
    case 'tanpa_keterangan':
      return 'bg-red-500 text-white';
    default:
      return 'outline';
  }
};

export function AttendancePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      setLoadingHistory(true);
      const today = new Date();
      const startDate = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
      const endDate = format(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd');
      
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });

        if (error) throw error;
        setHistory(data as AttendanceRecord[]);
      } catch (error) {
        console.error("Error fetching attendance history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return format(new Date(timeString), 'HH:mm');
  };

  return (
    <div className="space-y-6">
      <AttendanceCard />

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi Bulan Ini</CardTitle>
          <CardDescription>
            Ringkasan kehadiran Anda untuk bulan {format(new Date(), 'MMMM yyyy', { locale: id })}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jam Masuk</TableHead>
                <TableHead>Jam Pulang</TableHead>
                <TableHead className="text-right">Lembur (Jam)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingHistory ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Memuat riwayat...
                  </TableCell>
                </TableRow>
              ) : history.length > 0 ? (
                history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.date), 'EEEE, dd MMMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeVariant(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTime(record.clock_in)}</TableCell>
                    <TableCell>{formatTime(record.clock_out)}</TableCell>
                    <TableCell className="text-right">{record.overtime_hours > 0 ? record.overtime_hours.toFixed(2) : '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Belum ada riwayat absensi untuk bulan ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
