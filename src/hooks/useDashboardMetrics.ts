import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  platformGMV: number;
  avgBookingValue: number;
  conversionRate: number;
  verificationPending: number;
  avgResponseTime: string;
  gmvTrend: number[];
  loading: boolean;
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    platformGMV: 0,
    avgBookingValue: 0,
    conversionRate: 0,
    verificationPending: 0,
    avgResponseTime: '00:00',
    gmvTrend: [],
    loading: true,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch Platform GMV
      const { data: gmvData } = await supabase.rpc('calculate_platform_gmv', { days_back: 30 });
      
      // Fetch Average Booking Value
      const { data: avgBookingData } = await supabase.rpc('calculate_avg_booking_value', { days_back: 30 });
      
      // Fetch Conversion Rate
      const { data: conversionData } = await supabase.rpc('calculate_conversion_rate', { days_back: 30 });
      
      // Fetch Verification Pending Count
      const { count: pendingCount } = await supabase
        .from('host_kyc_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      // Fetch Average Response Time
      const { data: responseTimeData } = await supabase.rpc('calculate_avg_response_time');
      
      // Format response time
      let formattedResponseTime = '00:00';
      if (responseTimeData && typeof responseTimeData === 'string') {
        const match = responseTimeData.match(/(\d+):(\d+):(\d+)/);
        if (match) {
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          formattedResponseTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }

      // Fetch GMV trend for last 7 days
      const { data: trendData } = await supabase
        .from('bookings')
        .select('total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      // Group by day and calculate daily GMV
      const dailyGMV: { [key: string]: number } = {};
      trendData?.forEach((booking) => {
        const day = new Date(booking.created_at).toDateString();
        dailyGMV[day] = (dailyGMV[day] || 0) + parseFloat(booking.total_amount.toString());
      });
      const gmvTrend = Object.values(dailyGMV);

      setMetrics({
        platformGMV: gmvData || 0,
        avgBookingValue: avgBookingData || 0,
        conversionRate: conversionData || 0,
        verificationPending: pendingCount || 0,
        avgResponseTime: formattedResponseTime,
        gmvTrend: gmvTrend.length > 0 ? gmvTrend : [0, 0, 0, 0, 0, 0, 0],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      setMetrics(prev => ({ ...prev, loading: false }));
    }
  };

  return { metrics, refetch: fetchMetrics };
}
