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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertPracticeHoursSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Building2,
  User,
  Target,
  TrendingUp,
  FileText
} from "lucide-react";

const formSchema = insertPracticeHoursSchema.extend({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  hours: z.string().min(1, "Hours is required").transform((val) => parseFloat(val)),
});

type FormData = z.infer<typeof formSchema>;

export default function PracticeHours() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      hours: "",
      workplace: "",
      department: "",
      position: "",
      supervisorName: "",
      supervisorEmail: "",
      supervisorPhone: "",
      description: "",
      isAdvancedPractice: true,
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

  const { data: practiceData, isLoading: isPracticeLoading, error } = useQuery({
    queryKey: ["/api/practice-hours"],
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
      await apiRequest("POST", "/api/practice-hours", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice-hours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
      toast({
        title: "Success",
        description: "Practice hours added successfully",
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
        description: "Failed to add practice hours. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      await apiRequest("PUT", `/api/practice-hours/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice-hours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
      toast({
        title: "Success",
        description: "Practice hours updated successfully",
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
        description: "Failed to update practice hours. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/practice-hours/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice-hours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Practice hours deleted successfully",
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
        description: "Failed to delete practice hours. Please try again.",
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

  const handleEdit = (practiceHour: any) => {
    setEditingId(practiceHour.id);
    form.reset({
      startDate: practiceHour.startDate,
      endDate: practiceHour.endDate,
      hours: practiceHour.hours.toString(),
      workplace: practiceHour.workplace,
      department: practiceHour.department || "",
      position: practiceHour.position,
      supervisorName: practiceHour.supervisorName,
      supervisorEmail: practiceHour.supervisorEmail || "",
      supervisorPhone: practiceHour.supervisorPhone || "",
      description: practiceHour.description || "",
      isAdvancedPractice: practiceHour.isAdvancedPractice,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this practice hours entry?")) {
      deleteMutation.mutate(id);
    }
  };

  const openDialog = () => {
    setEditingId(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading || isPracticeLoading) {
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
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Unable to load practice hours</h3>
        <p className="text-slate-400">Please try refreshing the page.</p>
      </div>
    );
  }

  const { practiceHours = [], totalHours = 0, requiredHours = 5000, progress = 0 } = practiceData || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Practice Hours</h1>
          <p className="text-slate-400">
            Track your advanced clinical practice hours for AHPRA endorsement
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Hours
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-50">
                {editingId ? "Edit Practice Hours" : "Add Practice Hours"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Record your advanced clinical practice hours with supervisor details
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="bg-slate-700 border-slate-600 text-slate-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">End Date</FormLabel>
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
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5" 
                          placeholder="e.g. 40"
                          className="bg-slate-700 border-slate-600 text-slate-50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Enter the total hours for this period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="workplace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Workplace</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Royal Melbourne Hospital"
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
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Department</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Emergency Department"
                            className="bg-slate-700 border-slate-600 text-slate-50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Position/Role</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Nurse Practitioner Candidate"
                          className="bg-slate-700 border-slate-600 text-slate-50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="bg-slate-700" />

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-50">Supervisor Details</h4>
                  
                  <FormField
                    control={form.control}
                    name="supervisorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Supervisor Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Dr. Sarah Johnson"
                            className="bg-slate-700 border-slate-600 text-slate-50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="supervisorEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Supervisor Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="supervisor@hospital.com"
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
                      name="supervisorPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Supervisor Phone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0401 234 567"
                              className="bg-slate-700 border-slate-600 text-slate-50" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the nature of your advanced practice during this period..."
                          className="bg-slate-700 border-slate-600 text-slate-50 min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Detail the advanced clinical skills and decision-making involved
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update" : "Add Hours"}
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
            <CardTitle className="text-sm font-medium text-slate-400">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{totalHours.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mb-3">of {requiredHours.toLocaleString()} required</div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
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
            <CardTitle className="text-sm font-medium text-slate-400">Remaining</CardTitle>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">
              {Math.max(0, requiredHours - totalHours).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mb-3">hours needed</div>
            <div className="text-xs text-slate-400">
              {totalHours >= requiredHours ? "Target achieved!" : `${Math.ceil((requiredHours - totalHours) / 40)} weeks at 40hrs/week`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Hours Table */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-50 flex items-center">
            <FileText className="h-6 w-6 text-sky-500 mr-2" />
            Practice Hours Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {practiceHours.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">No practice hours recorded</h3>
              <p className="text-slate-400 mb-4">Start logging your advanced clinical practice hours to track your progress towards endorsement.</p>
              <Button onClick={openDialog} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Entry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Period</TableHead>
                    <TableHead className="text-slate-300">Hours</TableHead>
                    <TableHead className="text-slate-300">Workplace</TableHead>
                    <TableHead className="text-slate-300">Position</TableHead>
                    <TableHead className="text-slate-300">Supervisor</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {practiceHours.map((practiceHour: any) => (
                    <TableRow key={practiceHour.id} className="border-slate-700">
                      <TableCell className="text-slate-50">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(practiceHour.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-400">
                            to {new Date(practiceHour.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-50 font-medium">
                        {practiceHour.hours} hrs
                      </TableCell>
                      <TableCell className="text-slate-50">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Building2 className="h-3 w-3 mr-1" />
                            {practiceHour.workplace}
                          </div>
                          {practiceHour.department && (
                            <div className="text-xs text-slate-400">{practiceHour.department}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-50">{practiceHour.position}</TableCell>
                      <TableCell className="text-slate-50">
                        <div className="flex items-center text-sm">
                          <User className="h-3 w-3 mr-1" />
                          {practiceHour.supervisorName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            practiceHour.isVerified
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-600 text-white"
                          }
                        >
                          {practiceHour.isVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(practiceHour)}
                            className="text-slate-400 hover:text-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(practiceHour.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
