import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'hadir' | 'ijin' | 'sakit' | 'tanpa_keterangan';
  clock_in: string | null;
  clock_out: string | null;
  overtime_hours: number;
  notes: string | null;
}

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  today.setHours(today.getHours() + 7); // Menyesuaikan dengan zona waktu WIB (UTC+7)
  return today.toISOString().split('T')[0];
};

export function useAttendance() {
  const { user } = useAuth();
  const [todaysRecord, setTodaysRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendanceData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const todayStr = getTodayDateString();
      const { data, error } = await supabase
        .from('attendance' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayStr);

      if (error) throw error;
      
      setTodaysRecord((data as any)?.[0] || null);
    } catch (error: any) {
      console.error("Error fetching today's attendance:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data absensi hari ini.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clockIn = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const todayStr = getTodayDateString();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance' as any)
        .insert({
          user_id: user.id,
          date: todayStr,
          status: 'hadir',
          clock_in: now,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setTodaysRecord(data as any);
      toast({ title: "Berhasil", description: "Anda berhasil clock in." });
    } catch (error: any) {
      console.error("Error clocking in:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal melakukan clock in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    if (!todaysRecord || !todaysRecord.id) return;
    setLoading(true);

    try {
      const now = new Date();
      const clockInTime = new Date(todaysRecord.clock_in!);
      
      // Hitung jam lembur (jika pulang setelah lebih dari 8 jam kerja)
      const workHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
      const overtime = workHours > 8 ? parseFloat((workHours - 8).toFixed(2)) : 0;

      const { data, error } = await supabase
        .from('attendance' as any)
        .update({
          clock_out: now.toISOString(),
          overtime_hours: overtime,
        } as any)
        .eq('id', todaysRecord.id)
        .select()
        .single();
      
      if (error) throw error;

      setTodaysRecord(data as any);
      toast({ title: "Berhasil", description: "Anda berhasil clock out. Selamat beristirahat!" });
    } catch (error: any) {
      console.error("Error clocking out:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal melakukan clock out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAttendanceData();
    }
  }, [user, fetchAttendanceData]);
  
  // Listener untuk real-time update
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('attendance-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'attendance', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Attendance change received!', payload);
          fetchAttendanceData(); // Muat ulang data saat ada perubahan
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAttendanceData]);

  return { todaysRecord, loading, clockIn, clockOut };
}
