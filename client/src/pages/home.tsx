import React, { useState } from "react";
import { ManglishConverter } from "@/components/manglish-converter";
import { LanguageToggle } from "@/components/language-toggle";
import { Footer } from "@/components/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Home() {
  const [displayLanguage, setDisplayLanguage] = useState<"english" | "malayalam">("english");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 8 6 6" />
                <path d="m4 14 6-6 2 2 6-6" />
                <path d="M18 12h-4" />
                <path d="M15 15h-1" />
                <path d="M18 15h-1" />
                <path d="M15 18h-1" />
                <path d="M18 18h-1" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {displayLanguage === "english" ? "Manglish to English" : "മംഗ്ലീഷ് ടു ഇംഗ്ലീഷ്"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dictionary">
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen size={16} />
                {displayLanguage === "english" ? "Dictionary" : "നിഘണ്ടു"}
              </Button>
            </Link>
            <LanguageToggle
              displayLanguage={displayLanguage}
              onLanguageChange={setDisplayLanguage}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {displayLanguage === "english"
              ? "Manglish to English Converter"
              : "മംഗ്ലീഷ് ടു ഇംഗ്ലീഷ് കൺവെർട്ടർ"}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {displayLanguage === "english"
              ? "Convert Manglish (romanized Malayalam) text to standard English. Enter your text in the box below and click on the translate button."
              : "മംഗ്ലീഷ് (റോമനൈസ്ഡ് മലയാളം) ടെക്സ്റ്റ് സ്റ്റാൻഡേർഡ് ഇംഗ്ലീഷിലേക്ക് മാറ്റുക. താഴെയുള്ള ബോക്സിൽ നിങ്ങളുടെ ടെക്സ്റ്റ് നൽകി വിവർത്തനം ബട്ടണിൽ ക്ലിക്ക് ചെയ്യുക."}
          </p>
        </div>

        <div className="relative">
          <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
            <svg className="w-36 h-36 text-primary" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15,15 Q30,5 45,15 T75,15 Q95,15 95,40 T75,65 Q60,75 45,65 T15,65 Q5,65 5,40 T15,15"
                fill="currentColor"
              />
            </svg>
          </div>
          <ManglishConverter displayLanguage={displayLanguage} />
        </div>

        <div className="mt-16 bg-gray-50 rounded-lg p-6 max-w-3xl mx-auto border">
          <h2 className="text-xl font-semibold mb-4">
            {displayLanguage === "english"
              ? "About Manglish"
              : "മംഗ്ലീഷിനെ കുറിച്ച്"}
          </h2>
          <div className="prose max-w-none text-gray-700">
            {displayLanguage === "english" ? (
              <>
                <p>
                  Manglish is a blend of Malayalam and English, where Malayalam words are written using the Roman alphabet (English letters) instead of the traditional Malayalam script.
                </p>
                <p>
                  It became popular with the rise of digital communication, especially in chat applications and social media, where typing in Malayalam script was difficult.
                </p>
                <p>
                  This tool helps convert Manglish text to standard English, making it easier for non-Malayalam speakers to understand communications or for translation purposes.
                </p>
              </>
            ) : (
              <>
                <p>
                  മംഗ്ലീഷ് എന്നത് മലയാളവും ഇംഗ്ലീഷും കൂടിച്ചേർന്നതാണ്, അവിടെ മലയാളം വാക്കുകൾ പരമ്പരാഗത മലയാളം ലിപിക്ക് പകരം റോമൻ അക്ഷരമാല (ഇംഗ്ലീഷ് അക്ഷരങ്ങൾ) ഉപയോഗിച്ച് എഴുതുന്നു.
                </p>
                <p>
                  ഡിജിറ്റൽ കമ്മ്യൂണിക്കേഷന്റെ വളർച്ചയോടെ, പ്രത്യേകിച്ച് ചാറ്റ് ആപ്ലിക്കേഷനുകളിലും സോഷ്യൽ മീഡിയയിലും, മലയാളം ലിപിയിൽ ടൈപ്പ് ചെയ്യാൻ ബുദ്ധിമുട്ടായിരുന്നപ്പോൾ ഇത് ജനപ്രിയമായി.
                </p>
                <p>
                  ഈ ടൂൾ മംഗ്ലീഷ് ടെക്സ്റ്റ് സ്റ്റാൻഡേർഡ് ഇംഗ്ലീഷിലേക്ക് മാറ്റാൻ സഹായിക്കുന്നു, മലയാളം സംസാരിക്കാത്തവർക്ക് ആശയവിനിമയങ്ങൾ മനസ്സിലാക്കാനോ വിവർത്തന ആവശ്യങ്ങൾക്കോ ഇത് എളുപ്പമാക്കുന്നു.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer displayLanguage={displayLanguage} />
    </div>
  );
}
