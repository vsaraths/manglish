import React from "react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  displayLanguage: "english" | "malayalam";
}

export function Footer({ displayLanguage }: FooterProps) {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
        <p className="text-sm text-gray-500">
          {displayLanguage === "english"
            ? "© 2025 Artham - Manglish to English Translator. Open source project."
            : "© 2025 അർത്ഥം - മംഗ്ലീഷ് ടു ഇംഗ്ലീഷ് വിവർത്തകൻ. ഓപ്പൺ സോഴ്സ് പ്രോജക്റ്റ്."}
        </p>
        <div className="flex items-center">
          <a
            href="https://github.com/yourusername/artham"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <Github className="h-4 w-4" />
              {displayLanguage === "english" ? "GitHub" : "ഗിറ്റ്ഹബ്"}
            </Button>
          </a>
        </div>
      </div>
    </footer>
  );
}
