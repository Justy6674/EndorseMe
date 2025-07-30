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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertDocumentSchema } from "@shared/schema";
import { z } from "zod";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Folder,
  Target,
  TrendingUp,
  Eye,
  ExternalLink
} from "lucide-react";

const formSchema = insertDocumentSchema.extend({
  expiryDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const documentCategories = [
  { value: "academic_transcripts", label: "Academic Transcripts", required: true },
  { value: "certificates", label: "Certificates", required: true },
  { value: "cv_resume", label: "CV/Resume", required: true },
  { value: "statement_of_service", label: "Statement of Service", required: true },
  { value: "cpd_evidence", label: "CPD Evidence", required: false },
  { value: "supervisor_references", label: "Supervisor References", required: true },
  { value: "identity_documents", label: "Identity Documents", required: true },
  { value: "criminal_history_check", label: "Criminal History Check", required: true },
  { value: "english_proficiency", label: "English Proficiency", required: false },
  { value: "portfolio_evidence", label: "Portfolio Evidence", required: true },
  { value: "other", label: "Other", required: false },
];

export default function Documents() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "other",
      fileName: "",
      originalFileName: "",
      fileSize: 0,
      mimeType: "",
      fileUrl: "",
      description: "",
      isRequired: false,
      isSubmitted: false,
      expiryDate: "",
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

  const { data: documentsData, isLoading: isDocumentsLoading, error } = useQuery({
    queryKey: ["/api/documents"],
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
      await apiRequest("POST", "/api/documents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      setEditingId(null);
      setSelectedFile(null);
      form.reset();
      toast({
        title: "Success",
        description: "Document added successfully",
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
        description: "Failed to add document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      await apiRequest("PUT", `/api/documents/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      setEditingId(null);
      setSelectedFile(null);
      form.reset();
      toast({
        title: "Success",
        description: "Document updated successfully",
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
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
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
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("originalFileName", file.name);
      form.setValue("fileName", `${Date.now()}_${file.name}`);
      form.setValue("fileSize", file.size);
      form.setValue("mimeType", file.type);
      // In a real app, you would upload the file to a storage service and get the URL
      form.setValue("fileUrl", `https://placeholder-storage.com/${Date.now()}_${file.name}`);
    }
  };

  const onSubmit = (data: FormData) => {
    if (!selectedFile && !editingId) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Set isRequired based on category
    const category = documentCategories.find(cat => cat.value === data.category);
    data.isRequired = category?.required || false;

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (document: any) => {
    setEditingId(document.id);
    form.reset({
      category: document.category,
      fileName: document.fileName,
      originalFileName: document.originalFileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      fileUrl: document.fileUrl,
      description: document.description || "",
      isRequired: document.isRequired,
      isSubmitted: document.isSubmitted,
      expiryDate: document.expiryDate || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  const openDialog = () => {
    setEditingId(null);
    setSelectedFile(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading || isDocumentsLoading) {
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
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Unable to load documents</h3>
        <p className="text-slate-400">Please try refreshing the page.</p>
      </div>
    );
  }

  const { documents = [], documentsByCategory = {}, totalDocuments = 0, requiredDocuments = 15 } = documentsData || {};

  const requiredCategories = documentCategories.filter(cat => cat.required);
  const completedRequired = requiredCategories.filter(cat => 
    documentsByCategory[cat.value] && documentsByCategory[cat.value].length > 0
  ).length;
  const requiredProgress = (completedRequired / requiredCategories.length) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Documents</h1>
          <p className="text-slate-400">
            Manage your endorsement documentation and evidence
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-50">
                {editingId ? "Edit Document" : "Upload Document"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Add documentation required for your AHPRA endorsement application
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Document Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {documentCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center space-x-2">
                                <span>{category.label}</span>
                                {category.required && (
                                  <Badge className="bg-red-600 text-white text-xs">Required</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!editingId && (
                  <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-medium">File Upload</label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-300 mb-1">Click to upload or drag and drop</p>
                        <p className="text-slate-400 text-sm">PDF, DOC, DOCX, JPG, JPEG, PNG (max 10MB)</p>
                      </label>
                      {selectedFile && (
                        <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-sky-500" />
                            <span className="text-slate-50 text-sm">{selectedFile.name}</span>
                            <Badge className="bg-emerald-600 text-white text-xs">
                              {formatFileSize(selectedFile.size)}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe this document and its relevance to your application..."
                          className="bg-slate-700 border-slate-600 text-slate-50 min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Provide context about this document for easy reference
                      </FormDescription>
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
                      <FormDescription className="text-slate-400">
                        Set if this document has an expiry date
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
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update" : "Upload"}
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
            <CardTitle className="text-sm font-medium text-slate-400">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{totalDocuments}</div>
            <div className="text-xs text-slate-400 mb-3">uploaded</div>
            <div className="text-xs text-slate-400">
              {formatFileSize(documents.reduce((total: number, doc: any) => total + doc.fileSize, 0))} total size
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Required Categories</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{completedRequired}</div>
            <div className="text-xs text-slate-400 mb-3">of {requiredCategories.length} complete</div>
            <Progress value={requiredProgress} className="h-2" />
            <div className="text-xs text-slate-400 mt-1">{Math.round(requiredProgress)}% complete</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Submission Ready</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">
              {documents.filter((doc: any) => doc.isSubmitted).length}
            </div>
            <div className="text-xs text-slate-400 mb-3">documents submitted</div>
            <Badge className={requiredProgress >= 100 ? "bg-emerald-600" : "bg-amber-600"}>
              {requiredProgress >= 100 ? "Ready" : "In Progress"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Documents by Category */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-50 flex items-center">
            <Folder className="h-6 w-6 text-sky-500 mr-2" />
            Document Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalDocuments === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">No documents uploaded</h3>
              <p className="text-slate-400 mb-4">Start uploading your endorsement documentation to track your progress.</p>
              <Button onClick={openDialog} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="required" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                <TabsTrigger value="required" className="data-[state=active]:bg-slate-600">Required</TabsTrigger>
                <TabsTrigger value="optional" className="data-[state=active]:bg-slate-600">Optional</TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-600">All Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="required" className="mt-6">
                <div className="grid gap-4">
                  {requiredCategories.map((category) => {
                    const categoryDocs = documentsByCategory[category.value] || [];
                    const hasDocuments = categoryDocs.length > 0;
                    
                    return (
                      <Card key={category.value} className={`bg-slate-700 border-slate-600 ${!hasDocuments ? 'border-amber-500/50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-slate-50">{category.label}</h4>
                              <Badge className="bg-red-600 text-white text-xs">Required</Badge>
                              {hasDocuments && (
                                <Badge className="bg-emerald-600 text-white text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Complete
                                </Badge>
                              )}
                            </div>
                            {!hasDocuments && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  form.setValue("category", category.value);
                                  openDialog();
                                }}
                                className="btn-primary text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                          
                          {hasDocuments ? (
                            <div className="space-y-2">
                              {categoryDocs.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-sky-500" />
                                    <div>
                                      <div className="text-sm font-medium text-slate-50">{doc.originalFileName}</div>
                                      <div className="text-xs text-slate-400">
                                        {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(doc.fileUrl, '_blank')}
                                      className="text-slate-400 hover:text-slate-50"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(doc)}
                                      className="text-slate-400 hover:text-slate-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(doc.id)}
                                      className="text-slate-400 hover:text-red-400"
                                      disabled={deleteMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-slate-400">
                              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                              <p className="text-sm">No documents uploaded for this required category</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="optional" className="mt-6">
                <div className="grid gap-4">
                  {documentCategories.filter(cat => !cat.required).map((category) => {
                    const categoryDocs = documentsByCategory[category.value] || [];
                    
                    return (
                      <Card key={category.value} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-slate-50">{category.label}</h4>
                              <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                                Optional
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                form.setValue("category", category.value);
                                openDialog();
                              }}
                              className="btn-primary text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          
                          {categoryDocs.length > 0 ? (
                            <div className="space-y-2">
                              {categoryDocs.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-sky-500" />
                                    <div>
                                      <div className="text-sm font-medium text-slate-50">{doc.originalFileName}</div>
                                      <div className="text-xs text-slate-400">
                                        {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(doc.fileUrl, '_blank')}
                                      className="text-slate-400 hover:text-slate-50"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(doc)}
                                      className="text-slate-400 hover:text-slate-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(doc.id)}
                                      className="text-slate-400 hover:text-red-400"
                                      disabled={deleteMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-slate-400">
                              <FileText className="h-6 w-6 mx-auto mb-2 text-slate-500" />
                              <p className="text-sm">No documents uploaded for this category</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {documents.map((doc: any) => {
                    const category = documentCategories.find(cat => cat.value === doc.category);
                    const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                    
                    return (
                      <Card key={doc.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-sky-500" />
                                <h4 className="font-medium text-slate-50">{doc.originalFileName}</h4>
                                <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                                  {category?.label}
                                </Badge>
                                {category?.required && (
                                  <Badge className="bg-red-600 text-white text-xs">Required</Badge>
                                )}
                                {isExpired && (
                                  <Badge className="bg-red-600 text-white text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Expired
                                  </Badge>
                                )}
                              </div>
                              {doc.description && (
                                <p className="text-sm text-slate-300">{doc.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-slate-400">
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </span>
                                {doc.expiryDate && (
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                className="text-slate-400 hover:text-slate-50"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(doc)}
                                className="text-slate-400 hover:text-slate-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
                                className="text-slate-400 hover:text-red-400"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
