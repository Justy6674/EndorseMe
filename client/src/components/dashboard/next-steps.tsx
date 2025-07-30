import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  dueDate?: string;
}

interface NextStepsProps {
  steps: Step[];
}

export default function NextSteps({ steps }: NextStepsProps) {
  const getStatusIcon = (status: Step['status']) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-600" />;
    }
  };

  const getStatusBadge = (status: Step['status']) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-emerald-600 text-white">Completed</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-amber-600 text-white">In Progress</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline" className="border-slate-600 text-slate-400">Pending</Badge>;
    }
  };

  return (
    <Card className="stat-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-50 flex items-center">
          <Clock className="h-5 w-5 text-sky-500 mr-2" />
          Next Steps
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50">
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.slice(0, 4).map((step) => (
          <div key={step.id} className="activity-item hover:bg-slate-700 transition-colors cursor-pointer">
            <div className="flex-shrink-0">
              {getStatusIcon(step.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-slate-50 truncate">{step.title}</div>
                {getStatusBadge(step.status)}
              </div>
              <div className="text-sm text-slate-400 mb-1">{step.description}</div>
              {step.dueDate && (
                <div className="text-xs text-slate-500">Due: {step.dueDate}</div>
              )}
            </div>
          </div>
        ))}
        
        {steps.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
            <p>All caught up! No immediate action items.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
