import React, { useState } from "react";
import { DictionaryManager } from "@/components/dictionary-manager";
import { LanguageToggle } from "@/components/language-toggle";
import { Footer } from "@/components/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function DictionaryPage() {
  const [displayLanguage, setDisplayLanguage] = useState<"english" | "malayalam">("english");
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ChevronLeft size={16} />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">
              {displayLanguage === "english" ? "Manglish Dictionary" : "മംഗ്ലിഷ് നിഘണ്ടു"}
            </h1>
          </div>
          <LanguageToggle 
            displayLanguage={displayLanguage}
            onLanguageChange={setDisplayLanguage}
          />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {displayLanguage === "english" ? "Dictionary Management" : "നിഘണ്ടു മാനേജ്മെന്റ്"}
            </h2>
            <p className="text-muted-foreground">
              {displayLanguage === "english" 
                ? "Browse, search, and add new words to the Manglish-English dictionary. This helps improve translation quality."
                : "മംഗ്ലിഷ്-ഇംഗ്ലീഷ് നിഘണ്ടുവിൽ വാക്കുകൾ ബ്രൗസ് ചെയ്യുക, തിരയുക, പുതിയവ ചേർക്കുക. ഇത് വിവർത്തന ഗുണനിലവാരം മെച്ചപ്പെടുത്താൻ സഹായിക്കും."}
            </p>
          </div>
          
          <DictionaryManager displayLanguage={displayLanguage} />
        </div>
      </main>
      
      <Footer displayLanguage={displayLanguage} />
    </div>
  );
}