// Dashboard Statistics Service
export interface DashboardStats {
  totals: {
    tours: number;
    news: number;
    visaServices: number;
  };
  weekly: {
    tours: number;
    news: number;
    visaServices: number;
    total: number;
  };
  lastUpdated: string;
}

export interface DashboardStatsResponse {
  status: 'success' | 'fail';
  message: string;
  data: DashboardStats;
}

class DashboardStatsService {
  private static instance: DashboardStatsService;
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  
  static getInstance(): DashboardStatsService {
    if (!DashboardStatsService.instance) {
      DashboardStatsService.instance = new DashboardStatsService();
    }
    return DashboardStatsService.instance;
  }
  
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: DashboardStatsResponse = await response.json();
      
      if (result.status === 'fail') {
        throw new Error(result.message || 'Failed to fetch dashboard statistics');
      }
      
      return result.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error?.message || 'Failed to fetch dashboard statistics');
    }
  }
}

export default DashboardStatsService;
