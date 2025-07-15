import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
export function DashboardActivity() {
  const {
    activities,
    loading
  } = useRecentActivity();
  const navigate = useNavigate();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return <div className="w-2 h-2 bg-success rounded-full"></div>;
      case 'expense':
        return <div className="w-2 h-2 bg-expense rounded-full"></div>;
      case 'loss':
        return <div className="w-2 h-2 bg-warning rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-muted rounded-full"></div>;
    }
  };
  const getAmountColor = (type: string) => {
    return type === 'sale' ? 'text-success' : 'text-expense';
  };
  const getAmountPrefix = (type: string) => {
    return type === 'sale' ? '+' : '-';
  };
  return <Card className="bg-gradient-card border-border shadow-soft">
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>)}
          </div> : activities.length === 0 ? <div className="text-center py-8 text-muted-foreground">
            <p>Belum ada aktivitas untuk periode ini</p>
          </div> : <div className="space-y-3">
            {activities.map(activity => <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getActivityBadge(activity.type)}
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                  locale: id
                })}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${getAmountColor(activity.type)}`}>
                  {getAmountPrefix(activity.type)}{formatCurrency(activity.amount)}
                </p>
              </div>)}
          </div>}
        
        
      </CardContent>
    </Card>;
}