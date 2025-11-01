import { useState, useEffect } from 'react';
import DashboardStatsService, { DashboardStats } from '../services/DashboardStatsService';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardService = DashboardStatsService.getInstance();
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
