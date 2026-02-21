import React from "react";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { format } from "date-fns";
import { Sun, Moon, Cloud } from "lucide-react";

const WelcomeHeader: React.FC = () => {
  const { userName } = useUserPreferences();
  const hour = new Date().getHours();
  
  const getGreeting = () => {
    if (hour < 12) return { text: "Good Morning", icon: <Sun className="h-6 w-6 text-yellow-500" /> };
    if (hour < 18) return { text: "Good Afternoon", icon: <Cloud className="h-6 w-6 text-blue-400" /> };
    return { text: "Good Evening", icon: <Moon className="h-6 w-6 text-indigo-400" /> };
  };

  const greeting = getGreeting();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {greeting.icon}
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting.text}{userName ? `, ${userName}` : ""}!
          </h1>
        </div>
        <p className="text-muted-foreground">
          Today is {format(new Date(), "EEEE, MMMM do, yyyy")}.
        </p>
      </div>
    </div>
  );
};

export default WelcomeHeader;