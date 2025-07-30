import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserPreferences } from "@/context/UserPreferencesContext";

export const UserNameInput: React.FC = () => {
  const { userName, setUserName } = useUserPreferences();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="userName">Your Name</Label>
      <Input
        id="userName"
        placeholder="Enter your name"
        value={userName}
        onChange={handleChange}
      />
    </div>
  );
};