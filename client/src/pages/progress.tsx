import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Clock, 
  GraduationCap, 
  FileText, 
  Shield, 
  Target,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Download,
  ExternalLink,
  Award,
  BookOpen,
  User
} from "lucide-react";

const milestoneTypes = [
  { 
    key: "registration_current", 
    label: "Current RN Registration", 
    description: "Valid Division 1 Registered Nurse registration",
    weight: 10 
  },
  { 
    key: "masters_enrolled", 
    label: "Master's Enrollment", 
    description: "Enrolled in NMBA-approved NP Master's program",
    weight: 10 
  },
  { 
    key: "masters_completed", 
    label: "Master's Completion", 
    description: "Successfully completed NP Master's program",
    weight: 15 
  },
  { 
    key: "practice_hours_started", 
    label: "Practice Hours Started", 
    description: "Commenced logging advanced practice hours",
    weight: 5 
  },
  { 
    key: "practice_hours_50_percent", 
    label: "Practice Hours 50%", 
    description: "Achieved 2,500 hours of advanced practice",
    weight: 10 
  },
  { 
    key: "practice_hours_completed", 
    label: "Practice Hours Complete", 
    description: "Achieved 5,000 hours of advanced practice",
    weight: 20 
  },
  { 
    key: "cpd_requirements_met", 
    label: "CPD Requirements", 
    description: "Met annual CPD requirements",
    weight: 10 
  },
  { 
    key: "documents_uploaded", 
    label: "Documents Uploaded", 
    description: "All required documents uploaded",
    weight: 10 
  },
  { 
    key: "supervisor_verification", 
    label: "Supervisor Verification", 
    description: "Practice hours verified by supervisors",
    weight: 5 
  },
  { 
    key: "ready_for_submission", 
    label: "Ready for Submission", 
    description: "All requirements met for AHPRA submission",
    weight: 5 
  },
];

export default function ProgressPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorised",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: progressData, isLoading: isProgressLoading, error } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorised",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading || isProgressLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="stat-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded mb-4"></div>
                <div className="h-8 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded"></div>
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
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Unable to load progress data</h3>
        <p className="text-slate-400">Please try refreshing the page.</p>
      </div>
    );
  }

  const { milestones = [], overview = {} } = progressData || {};
  const { 
    totalPracticeHours = 0, 
    cpdHours = 0, 
    documentsUploaded = 0, 
    documentsRequired = 15, 
    readinessPercentage = 0 
  } = overview;

  // Calculate milestone progress
  const completedMilestones = milestones.filter((m: any) => m.status === "completed");
  const totalWeight = milestoneTypes.reduce((sum, m) => sum + m.weight, 0);
  const completedWeight = completedMilestones.reduce((sum: number, milestone: any) => {
    const type = milestoneTypes.find(t => t.key === milestone.milestoneType);
    return sum + (type?.weight || 0);
  }, 0);
  const milestoneProgress = (completedWeight / totalWeight) * 100;

  // AHPRA requirements progress
  const practiceHoursProgress = Math.min((totalPracticeHours / 5000) * 100, 100);
  const cpdProgress = Math.min((cpdHours / 20) * 100, 100);
  const documentsProgress = Math.min((documentsUploaded / documentsRequired) * 100, 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-600 text-white">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="border-slate-600 text-slate-400">Not Started</Badge>;
    }
  };

  const getReadinessStatus = () => {
    if (readinessPercentage >= 90) return { color: "text-emerald-500", bg: "bg-emerald-600", text: "Almost Ready" };
    if (readinessPercentage >= 70) return { color: "text-sky-500", bg: "bg-sky-600", text: "Good Progress" };
    if (readinessPercentage >= 50) return { color: "text-amber-500", bg: "bg-amber-600", text: "Making Progress" };
    return { color: "text-slate-500", bg: "bg-slate-600", text: "Getting Started" };
  };

  const readinessStatus = getReadinessStatus();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Progress Overview</h1>
          <p className="text-slate-400">
            Track your journey towards Nurse Practitioner endorsement
          </p>
        </div>
        <div className="flex space-x-2">
          <Button className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button 
            className="btn-primary"
            onClick={() => window.open("https://www.ahpra.gov.au/registration/registers-of-practitioners/nurse-practitioner-endorsement.aspx", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            AHPRA Guidelines
          </Button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Overall Readiness</CardTitle>
            <Shield className={`h-4 w-4 ${readinessStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{readinessPercentage}%</div>
            <div className="text-xs text-slate-400 mb-3">submission ready</div>
            <Badge className={`${readinessStatus.bg} text-white`}>
              {readinessStatus.text}
            </Badge>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Practice Hours</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{totalPracticeHours.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mb-3">of 5,000 required</div>
            <ProgressBar value={practiceHoursProgress} className="h-2" />
            <div className="text-xs text-slate-400 mt-1">{Math.round(practiceHoursProgress)}% complete</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">CPD Hours</CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{cpdHours}</div>
            <div className="text-xs text-slate-400 mb-3">current period</div>
            <ProgressBar value={cpdProgress} className="h-2" />
            <div className="text-xs text-slate-400 mt-1">{Math.round(cpdProgress)}% of minimum</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Documents</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{documentsUploaded}</div>
            <div className="text-xs text-slate-400 mb-3">of {documentsRequired} required</div>
            <ProgressBar value={documentsProgress} className="h-2" />
            <div className="text-xs text-slate-400 mt-1">{Math.round(documentsProgress)}% complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Visualization */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* AHPRA Requirements */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-50 flex items-center">
              <Target className="h-6 w-6 text-sky-500 mr-2" />
              AHPRA Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Practice Hours */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-sky-500" />
                  <span className="font-medium text-slate-50">Advanced Practice Hours</span>
                </div>
                <Badge className={practiceHoursProgress >= 100 ? "bg-emerald-600" : "bg-amber-600"}>
                  {Math.round(practiceHoursProgress)}%
                </Badge>
              </div>
              <ProgressBar value={practiceHoursProgress} className="h-3" />
              <div className="text-sm text-slate-400">
                {totalPracticeHours.toLocaleString()} / 5,000 hours • {Math.max(0, 5000 - totalPracticeHours).toLocaleString()} remaining
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* CPD Requirements */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-slate-50">CPD Requirements</span>
                </div>
                <Badge className={cpdProgress >= 100 ? "bg-emerald-600" : "bg-amber-600"}>
                  {Math.round(cpdProgress)}%
                </Badge>
              </div>
              <ProgressBar value={cpdProgress} className="h-3" />
              <div className="text-sm text-slate-400">
                {cpdHours} / 20 hours this period • Minimum annual requirement
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Documentation */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-slate-50">Documentation</span>
                </div>
                <Badge className={documentsProgress >= 100 ? "bg-emerald-600" : "bg-amber-600"}>
                  {Math.round(documentsProgress)}%
                </Badge>
              </div>
              <ProgressBar value={documentsProgress} className="h-3" />
              <div className="text-sm text-slate-400">
                {documentsUploaded} / {documentsRequired} required documents
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Academic Qualification */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-slate-50">Master's Qualification</span>
                </div>
                <Badge className="bg-sky-600">
                  In Progress
                </Badge>
              </div>
              <div className="text-sm text-slate-400">
                NMBA-approved Master of Nurse Practitioner program
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Timeline */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-50 flex items-center">
              <BarChart3 className="h-6 w-6 text-emerald-500 mr-2" />
              Journey Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestoneTypes.map((milestoneType) => {
                const milestone = milestones.find((m: any) => m.milestoneType === milestoneType.key);
                const status = milestone?.status || "not_started";
                
                return (
                  <div key={milestoneType.key} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-slate-50">{milestoneType.label}</h4>
                        {getStatusBadge(status)}
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{milestoneType.description}</p>
                      {milestone?.completedAt && (
                        <div className="flex items-center text-xs text-slate-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Completed {new Date(milestone.completedAt).toLocaleDateString()}
                        </div>
                      )}
                      {milestone?.dueDate && status !== "completed" && (
                        <div className="flex items-center text-xs text-slate-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps and Recommendations */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-50 flex items-center">
            <TrendingUp className="h-6 w-6 text-sky-500 mr-2" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-50 flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                Priority Actions
              </h4>
              <div className="space-y-3">
                {practiceHoursProgress < 100 && (
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <p className="font-medium text-slate-50 mb-1">Complete Practice Hours</p>
                    <p className="text-sm text-slate-400">
                      You need {(5000 - totalPracticeHours).toLocaleString()} more hours of advanced clinical practice
                    </p>
                  </div>
                )}
                {documentsProgress < 100 && (
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <p className="font-medium text-slate-50 mb-1">Upload Required Documents</p>
                    <p className="text-sm text-slate-400">
                      {documentsRequired - documentsUploaded} required documents are still missing
                    </p>
                  </div>
                )}
                {cpdProgress < 100 && (
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <p className="font-medium text-slate-50 mb-1">Complete CPD Requirements</p>
                    <p className="text-sm text-slate-400">
                      You need {20 - cpdHours} more CPD hours for this registration period
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-50 flex items-center">
                <BookOpen className="h-4 w-4 text-emerald-500 mr-2" />
                Next Steps
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-slate-700 rounded-lg">
                  <p className="font-medium text-slate-50 mb-1">Schedule Supervisor Meetings</p>
                  <p className="text-sm text-slate-400">
                    Regular check-ins with your supervisor to verify practice hours and competencies
                  </p>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <p className="font-medium text-slate-50 mb-1">Prepare Portfolio Evidence</p>
                  <p className="text-sm text-slate-400">
                    Compile case studies and reflective statements demonstrating advanced practice
                  </p>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <p className="font-medium text-slate-50 mb-1">Review AHPRA Requirements</p>
                  <p className="text-sm text-slate-400">
                    Stay updated with the latest endorsement requirements and guidelines
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Timeline */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-50 flex items-center">
            <Calendar className="h-6 w-6 text-purple-500 mr-2" />
            Estimated Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-sky-400">
                {Math.max(0, Math.ceil((5000 - totalPracticeHours) / 40))}
              </div>
              <div className="text-slate-300 font-medium">Weeks to Complete</div>
              <div className="text-xs text-slate-400">Practice hours at 40hrs/week</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-emerald-400">
                {readinessPercentage >= 80 ? "2-4" : "6-12"}
              </div>
              <div className="text-slate-300 font-medium">Months to Submission</div>
              <div className="text-xs text-slate-400">Based on current progress</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-400">3-6</div>
              <div className="text-slate-300 font-medium">Months Processing</div>
              <div className="text-xs text-slate-400">AHPRA assessment timeframe</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
