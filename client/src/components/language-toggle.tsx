import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageToggleProps {
  displayLanguage: "english" | "malayalam";
  onLanguageChange: (lang: "english" | "malayalam") => void;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

export function LanguageToggle({
  displayLanguage,
  onLanguageChange,
  theme = "light",
  onThemeChange,
}: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Languages className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onLanguageChange("english")}>
            English
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onLanguageChange("malayalam")}>
            മലയാളം
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {onThemeChange && (
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            onThemeChange(theme === "light" ? "dark" : "light")
          }
        >
          {theme === "light" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      )}
    </div>
  );
}
