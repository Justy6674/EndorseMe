import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus, CheckCircle, FileText, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  description: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (action: string, entityType: string) => {
    if (action === "created" && entityType === "practice_hours") {
      return <Plus className="h-4 w-4 text-sky-500" />;
    }
    if (action === "uploaded" && entityType === "document") {
      return <FileText className="h-4 w-4 text-emerald-500" />;
    }
    if (action === "created" && entityType === "cpd_record") {
      return <CheckCircle className="h-4 w-4 text-purple-500" />;
    }
    return <Activity className="h-4 w-4 text-slate-400" />;
  };

  const getActivityColor = (action: string, entityType: string) => {
    if (action === "created" && entityType === "practice_hours") {
      return "bg-sky-600";
    }
    if (action === "uploaded" && entityType === "document") {
      return "bg-emerald-600";
    }
    if (action === "created" && entityType === "cpd_record") {
      return "bg-purple-600";
    }
    return "bg-slate-600";
  };

  return (
    <Card className="stat-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-50 flex items-center">
          <Activity className="h-5 w-5 text-emerald-500 mr-2" />
          Recent Activity
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50">
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div 
              className={`w-8 h-8 ${getActivityColor(activity.action, activity.entityType)} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              {getActivityIcon(activity.action, activity.entityType)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-50 mb-1">{activity.description}</div>
              <div className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-500" />
            <p>No recent activity to show.</p>
            <p className="text-sm">Start logging your practice hours or CPD!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
