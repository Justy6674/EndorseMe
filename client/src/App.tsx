import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import PracticeHours from "@/pages/practice-hours";
import CpdManagement from "@/pages/cpd-management";
import Documents from "@/pages/documents";
import Progress from "@/pages/progress";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        {isAuthenticated ? (
          <div className="min-h-screen bg-slate-900 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">
                <Dashboard />
              </main>
            </div>
          </div>
        ) : (
          <Redirect to="/auth" />
        )}
      </Route>
      <Route path="/practice-hours">
        {isAuthenticated ? (
          <div className="min-h-screen bg-slate-900 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">
                <PracticeHours />
              </main>
            </div>
          </div>
        ) : (
          <Redirect to="/auth" />
        )}
      </Route>
      <Route path="/cpd">
        {isAuthenticated ? (
          <div className="min-h-screen bg-slate-900 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">
                <CpdManagement />
              </main>
            </div>
          </div>
        ) : (
          <Redirect to="/auth" />
        )}
      </Route>
      <Route path="/documents">
        {isAuthenticated ? (
          <div className="min-h-screen bg-slate-900 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">
                <Documents />
              </main>
            </div>
          </div>
        ) : (
          <Redirect to="/auth" />
        )}
      </Route>
      <Route path="/progress">
        {isAuthenticated ? (
          <div className="min-h-screen bg-slate-900 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">
                <Progress />
              </main>
            </div>
          </div>
        ) : (
          <Redirect to="/auth" />
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
