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
            ? "© 2023 Manglish to English Converter. Open source project."
            : "© 2023 മംഗ്ലീഷ് ടു ഇംഗ്ലീഷ് കൺവെർട്ടർ. ഓപ്പൺ സോഴ്സ് പ്രോജക്റ്റ്."}
        </p>
        <div className="flex items-center">
          <a
            href="https://github.com/yourusername/manglish-to-english"
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
