import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Clock, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  UserRound,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Practice Hours",
    href: "/practice-hours",
    icon: Clock,
  },
  {
    name: "CPD Management",
    href: "/cpd",
    icon: GraduationCap,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    name: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen">
      {/* Logo */}
      <div className="flex items-center space-x-2 p-6 border-b border-slate-700">
        <UserRound className="text-sky-500 h-8 w-8" />
        <div>
          <span className="text-xl font-bold text-slate-50">EndorseMe</span>
          <div className="text-xs text-slate-400">.com.au</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "sidebar-item",
                  isActive && "active"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-slate-50 hover:bg-slate-700"
          onClick={() => window.location.href = '/api/logout'}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
