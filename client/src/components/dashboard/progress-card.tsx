import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: LucideIcon;
  description?: string;
}

export default function ProgressCard({
  title,
  current,
  target,
  unit,
  color,
  icon: Icon,
  description,
}: ProgressCardProps) {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <Card className="stat-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-50">{current.toLocaleString()}</div>
        <div className="text-xs text-slate-400 mb-3">
          of {target.toLocaleString()} {unit} {description && `• ${description}`}
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{Math.round(progress)}% complete</span>
            <span>{(target - current).toLocaleString()} remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
