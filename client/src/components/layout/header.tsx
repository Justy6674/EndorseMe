import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { user } = useAuth();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const getDisplayName = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return user?.email || "User";
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            Welcome back, {user?.firstName || "there"}
          </h1>
          <p className="text-slate-400 text-sm">
            Track your journey to Nurse Practitioner endorsement
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-50">
            <div className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </div>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-50">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-sky-600 text-white">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-slate-50">
                {getDisplayName(user?.firstName, user?.lastName)}
              </div>
              <div className="text-xs text-slate-400">
                Nurse Practitioner Candidate
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
