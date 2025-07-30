import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProgressCard from "@/components/dashboard/progress-card";
import NextSteps from "@/components/dashboard/next-steps";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  GraduationCap, 
  FileText, 
  Shield, 
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData, isLoading: isDashboardLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading || isDashboardLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="stat-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded mb-4"></div>
                <div className="h-8 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded mb-3"></div>
                <div className="h-2 bg-slate-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Unable to load dashboard</h3>
        <p className="text-slate-400">Please try refreshing the page.</p>
      </div>
    );
  }

  const { progressOverview, recentActivity } = dashboardData || {};

  // Mock next steps data - in real app this would come from the API
  const nextSteps = [
    {
      id: "1",
      title: "Upload Academic Transcripts",
      description: "Master's degree transcripts required for endorsement",
      status: "overdue" as const,
      dueDate: "5 days overdue",
    },
    {
      id: "2",
      title: "Complete CPD Reflection",
      description: "Submit reflective statement for recent CPD activities",
      status: "in_progress" as const,
      dueDate: "Due in 3 days",
    },
    {
      id: "3",
      title: "Supervisor Verification",
      description: "Get supervisor sign-off for recent practice hours",
      status: "completed" as const,
    },
    {
      id: "4",
      title: "Update Practice Portfolio",
      description: "Add case studies from the last quarter",
      status: "pending" as const,
      dueDate: "Due in 2 weeks",
    },
  ];

  const getReadinessStatus = (percentage: number) => {
    if (percentage >= 90) return { color: "bg-emerald-600", text: "Almost Ready", icon: CheckCircle };
    if (percentage >= 70) return { color: "bg-sky-600", text: "Good Progress", icon: TrendingUp };
    if (percentage >= 50) return { color: "bg-amber-600", text: "Making Progress", icon: Target };
    return { color: "bg-slate-600", text: "Getting Started", icon: AlertTriangle };
  };

  const readinessStatus = getReadinessStatus(progressOverview?.readinessPercentage || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressCard
          title="Practice Hours"
          current={progressOverview?.totalPracticeHours || 0}
          target={5000}
          unit="hours"
          color="text-sky-500"
          icon={Clock}
          description="advanced practice"
        />
        
        <ProgressCard
          title="CPD Points"
          current={progressOverview?.cpdHours || 0}
          target={20}
          unit="hours"
          color="text-emerald-500"
          icon={GraduationCap}
          description="this period"
        />
        
        <ProgressCard
          title="Documents"
          current={progressOverview?.documentsUploaded || 0}
          target={progressOverview?.documentsRequired || 15}
          unit="files"
          color="text-amber-500"
          icon={FileText}
          description="uploaded"
        />
        
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Readiness</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">
              {progressOverview?.readinessPercentage || 0}%
            </div>
            <div className="text-xs text-slate-400 mb-3">submission ready</div>
            <Badge className={`${readinessStatus.color} text-white border-0`}>
              <readinessStatus.icon className="h-3 w-3 mr-1" />
              {readinessStatus.text}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-50 flex items-center">
            <TrendingUp className="h-6 w-6 text-sky-500 mr-2" />
            Your Endorsement Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400 mb-2">
                {Math.min(Math.round(((progressOverview?.totalPracticeHours || 0) / 5000) * 100), 100)}%
              </div>
              <div className="text-slate-300 font-medium">Practice Hours</div>
              <div className="text-sm text-slate-400">
                {(progressOverview?.totalPracticeHours || 0).toLocaleString()} / 5,000 hours
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                {Math.min(Math.round(((progressOverview?.cpdHours || 0) / 20) * 100), 100)}%
              </div>
              <div className="text-slate-300 font-medium">CPD Requirements</div>
              <div className="text-sm text-slate-400">
                {progressOverview?.cpdHours || 0} / 20 hours this period
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {Math.min(Math.round(((progressOverview?.documentsUploaded || 0) / (progressOverview?.documentsRequired || 15)) * 100), 100)}%
              </div>
              <div className="text-slate-300 font-medium">Documentation</div>
              <div className="text-sm text-slate-400">
                {progressOverview?.documentsUploaded || 0} / {progressOverview?.documentsRequired || 15} documents
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps and Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <NextSteps steps={nextSteps} />
        <RecentActivity activities={recentActivity || []} />
      </div>
    </div>
  );
}
