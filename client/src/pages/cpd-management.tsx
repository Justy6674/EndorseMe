import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertCpdRecordSchema } from "@shared/schema";
import { z } from "zod";
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";

const formSchema = insertCpdRecordSchema.extend({
  completionDate: z.string().min(1, "Completion date is required"),
  expiryDate: z.string().optional(),
  hoursEarned: z.string().min(1, "Hours is required").transform((val) => parseFloat(val)),
});

type FormData = z.infer<typeof formSchema>;

const cpdCategories = [
  { value: "mandatory", label: "Mandatory", description: "Required training and compliance" },
  { value: "continuing_competence", label: "Continuing Competence", description: "Skills and knowledge development" },
  { value: "education", label: "Education", description: "Formal learning and qualifications" },
  { value: "other", label: "Other", description: "Additional professional development" },
];

const activityTypes = [
  { value: "course", label: "Course" },
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "reading", label: "Reading" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" },
];

export default function CpdManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      provider: "",
      category: "continuing_competence",
      activityType: "course",
      hoursEarned: "",
      completionDate: "",
      expiryDate: "",
      description: "",
      learningOutcomes: "",
      reflection: "",
      certificateUrl: "",
      evidenceUrl: "",
      registrationPeriod: "2024-2025",
      userId: "",
    },
  });

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

  const { data: cpdData, isLoading: isCpdLoading, error } = useQuery({
    queryKey: ["/api/cpd"],
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

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/cpd", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cpd"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
      toast({
        title: "Success",
        description: "CPD record added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to add CPD record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      await apiRequest("PUT", `/api/cpd/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cpd"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
      toast({
        title: "Success",
        description: "CPD record updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to update CPD record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cpd/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cpd"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "CPD record deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete CPD record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (cpdRecord: any) => {
    setEditingId(cpdRecord.id);
    form.reset({
      title: cpdRecord.title,
      provider: cpdRecord.provider || "",
      category: cpdRecord.category,
      activityType: cpdRecord.activityType,
      hoursEarned: cpdRecord.hoursEarned.toString(),
      completionDate: cpdRecord.completionDate,
      expiryDate: cpdRecord.expiryDate || "",
      description: cpdRecord.description || "",
      learningOutcomes: cpdRecord.learningOutcomes || "",
      reflection: cpdRecord.reflection || "",
      certificateUrl: cpdRecord.certificateUrl || "",
      evidenceUrl: cpdRecord.evidenceUrl || "",
      registrationPeriod: cpdRecord.registrationPeriod,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this CPD record?")) {
      deleteMutation.mutate(id);
    }
  };

  const openDialog = () => {
    setEditingId(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading || isCpdLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Unable to load CPD records</h3>
        <p className="text-slate-400">Please try refreshing the page.</p>
      </div>
    );
  }

  const { cpdRecords = [], currentPeriodHours = 0, requiredHours = 20, progress = 0 } = cpdData || {};

  // Group CPD records by category
  const recordsByCategory = cpdRecords.reduce((acc: any, record: any) => {
    if (!acc[record.category]) {
      acc[record.category] = [];
    }
    acc[record.category].push(record);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">CPD Management</h1>
          <p className="text-slate-400">
            Track your Continuing Professional Development for AHPRA registration
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add CPD
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-50">
                {editingId ? "Edit CPD Record" : "Add CPD Record"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Record your continuing professional development activity
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-slate-300">Activity Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Advanced Pharmacology Workshop"
                            className="bg-slate-700 border-slate-600 text-slate-50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Provider</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Australian College of Nursing"
                            className="bg-slate-700 border-slate-600 text-slate-50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hoursEarned"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Hours Earned</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.5" 
                            placeholder="e.g. 8"
                            className="bg-slate-700 border-slate-600 text-slate-50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {cpdCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div>
                                  <div className="font-medium">{category.label}</div>
                                  <div className="text-xs text-slate-400">{category.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="activityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Activity Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {activityTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="completionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Completion Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="bg-slate-700 border-slate-600 text-slate-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" className="bg-slate-700 border-slate-600 text-slate-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the CPD activity and its content..."
                          className="bg-slate-700 border-slate-600 text-slate-50 min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learningOutcomes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Learning Outcomes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What were the key learning outcomes from this activity?"
                          className="bg-slate-700 border-slate-600 text-slate-50 min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Describe what knowledge or skills you gained
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reflection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Reflection</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How will you apply this learning in your practice?"
                          className="bg-slate-700 border-slate-600 text-slate-50 min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Reflect on how this learning impacts your practice
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="certificateUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Certificate URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="url"
                            placeholder="https://..."
                            className="bg-slate-700 border-slate-600 text-slate-50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evidenceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Evidence URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="url"
                            placeholder="https://..."
                            className="bg-slate-700 border-slate-600 text-slate-50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-600 text-slate-300 hover:text-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update" : "Add CPD"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Current Period</CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{currentPeriodHours}</div>
            <div className="text-xs text-slate-400 mb-3">of {requiredHours} hours required</div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{Math.round(progress)}%</div>
            <div className="text-xs text-slate-400 mb-3">complete</div>
            <Badge className={progress >= 100 ? "bg-emerald-600" : progress >= 50 ? "bg-amber-600" : "bg-slate-600"}>
              {progress >= 100 ? "Requirements Met" : progress >= 50 ? "Good Progress" : "In Progress"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Activities</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{cpdRecords.length}</div>
            <div className="text-xs text-slate-400 mb-3">this period</div>
            <div className="text-xs text-slate-400">
              {Math.round(currentPeriodHours / Math.max(cpdRecords.length, 1))} avg hrs/activity
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CPD Records */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-50 flex items-center">
            <FileText className="h-6 w-6 text-emerald-500 mr-2" />
            CPD Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cpdRecords.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">No CPD records found</h3>
              <p className="text-slate-400 mb-4">Start logging your continuing professional development activities to meet AHPRA requirements.</p>
              <Button onClick={openDialog} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First CPD
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-slate-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-600">All</TabsTrigger>
                <TabsTrigger value="mandatory" className="data-[state=active]:bg-slate-600">Mandatory</TabsTrigger>
                <TabsTrigger value="continuing_competence" className="data-[state=active]:bg-slate-600">Competence</TabsTrigger>
                <TabsTrigger value="education" className="data-[state=active]:bg-slate-600">Education</TabsTrigger>
                <TabsTrigger value="other" className="data-[state=active]:bg-slate-600">Other</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Activity</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Hours</TableHead>
                        <TableHead className="text-slate-300">Date</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cpdRecords.map((record: any) => (
                        <TableRow key={record.id} className="border-slate-700">
                          <TableCell className="text-slate-50">
                            <div className="space-y-1">
                              <div className="font-medium">{record.title}</div>
                              {record.provider && (
                                <div className="text-xs text-slate-400">{record.provider}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {activityTypes.find(t => t.value === record.activityType)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-50 font-medium">
                            {record.hoursEarned} hrs
                          </TableCell>
                          <TableCell className="text-slate-50">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(record.completionDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              record.expiryDate && new Date(record.expiryDate) < new Date()
                                ? "bg-red-600 text-white"
                                : "bg-emerald-600 text-white"
                            }>
                              {record.expiryDate && new Date(record.expiryDate) < new Date() ? (
                                <>
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Expired
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Valid
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {record.certificateUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(record.certificateUrl, '_blank')}
                                  className="text-slate-400 hover:text-slate-50"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(record)}
                                className="text-slate-400 hover:text-slate-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record.id)}
                                className="text-slate-400 hover:text-red-400"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {cpdCategories.map((category) => (
                <TabsContent key={category.value} value={category.value} className="mt-6">
                  <div className="space-y-4">
                    {recordsByCategory[category.value]?.length > 0 ? (
                      recordsByCategory[category.value].map((record: any) => (
                        <Card key={record.id} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-slate-50">{record.title}</h4>
                                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    {record.hoursEarned} hrs
                                  </Badge>
                                </div>
                                {record.provider && (
                                  <p className="text-sm text-slate-400">{record.provider}</p>
                                )}
                                {record.description && (
                                  <p className="text-sm text-slate-300">{record.description}</p>
                                )}
                                <div className="flex items-center space-x-4 text-xs text-slate-400">
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(record.completionDate).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center">
                                    <Award className="h-3 w-3 mr-1" />
                                    {activityTypes.find(t => t.value === record.activityType)?.label}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                {record.certificateUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(record.certificateUrl, '_blank')}
                                    className="text-slate-400 hover:text-slate-50"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(record)}
                                  className="text-slate-400 hover:text-slate-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(record.id)}
                                  className="text-slate-400 hover:text-red-400"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                        <p>No {category.label.toLowerCase()} activities recorded yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
