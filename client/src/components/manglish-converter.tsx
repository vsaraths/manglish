import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  RotateCw,
  Eraser,
  Clock,
  ScanText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { translateManglishToEnglish } from "@/lib/translator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HistoryDrawer } from "./history-drawer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ConverterProps {
  displayLanguage: "english" | "malayalam";
}

export function ManglishConverter({ displayLanguage }: ConverterProps) {
  const [manglishText, setManglishText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Update character and word count when input changes
    setCharacterCount(manglishText.length);
    setWordCount(
      manglishText ? manglishText.trim().split(/\s+/).filter(Boolean).length : 0
    );
  }, [manglishText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManglishText(e.target.value);
  };

  const handleTranslate = async () => {
    if (!manglishText.trim()) {
      toast({
        variant: "destructive",
        title: displayLanguage === "english" ? "Error" : "പിശക്",
        description:
          displayLanguage === "english"
            ? "Please enter some text to translate"
            : "വിവർത്തനം ചെയ്യാൻ കുറച്ച് ടെക്സ്റ്റ് നൽകുക",
      });
      return;
    }

    setIsTranslating(true);
    try {
      // Use the translator library to translate
      const result = await translateManglishToEnglish(manglishText);
      setEnglishText(result);

      // Save the translation to history
      await apiRequest("POST", "/api/translate", {
        manglishText: manglishText,
        englishText: result,
      });

      // Invalidate queries to update history
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });

      toast({
        title: displayLanguage === "english" ? "Success" : "വിജയം",
        description:
          displayLanguage === "english"
            ? "Translation completed"
            : "വിവർത്തനം പൂർത്തിയായി",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: displayLanguage === "english" ? "Error" : "പിശക്",
        description:
          displayLanguage === "english"
            ? "Failed to translate text"
            : "ടെക്സ്റ്റ് വിവർത്തനം ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const clearText = () => {
    setManglishText("");
    setEnglishText("");
  };

  const examples = [
    {
      manglish: "Njan veedu pokuva. Eniku vishakkunnu.",
      english: "I am going home. I am hungry.",
    },
    {
      manglish: "Ningal enthu cheyyunnu? Njan nale varum.",
      english: "What are you doing? I will come tomorrow.",
    },
    {
      manglish: "Ente peru Rajan aanu. Njan Keralathil ninnum aanu.",
      english: "My name is Rajan. I am from Kerala.",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">
              {displayLanguage === "english"
                ? "Manglish (Malayalam in Roman script)"
                : "മംഗ്ലീഷ് (റോമൻ ലിപിയിലെ മലയാളം)"}
            </h2>
            <Textarea
              placeholder={
                displayLanguage === "english"
                  ? "Enter Manglish text here..."
                  : "ഇവിടെ മംഗ്ലീഷ് ടെക്സ്റ്റ് നൽകുക..."
              }
              className="min-h-32 resize-y font-medium"
              value={manglishText}
              onChange={handleInputChange}
            />
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <div className="flex gap-4">
                <span>
                  {displayLanguage === "english"
                    ? `Characters: ${characterCount}`
                    : `അക്ഷരങ്ങൾ: ${characterCount}`}
                </span>
                <span>
                  {displayLanguage === "english"
                    ? `Words: ${wordCount}`
                    : `വാക്കുകൾ: ${wordCount}`}
                </span>
              </div>
            </div>
          </div>

          {isTranslating && (
            <div className="my-4">
              <Progress value={80} className="h-1" />
              <p className="text-xs text-center mt-1 text-gray-500">
                {displayLanguage === "english"
                  ? "Translating..."
                  : "വിവർത്തനം ചെയ്യുന്നു..."}
              </p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">
                {displayLanguage === "english"
                  ? "English Translation"
                  : "ഇംഗ്ലീഷ് വിവർത്തനം"}
              </h2>
              <CopyButton text={englishText} />
            </div>
            <div className="min-h-32 p-3 bg-gray-50 rounded-md border">
              {englishText ? (
                <p className="whitespace-pre-wrap">{englishText}</p>
              ) : (
                <p className="text-gray-400 italic">
                  {displayLanguage === "english"
                    ? "Translation will appear here..."
                    : "വിവർത്തനം ഇവിടെ കാണിക്കും..."}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleTranslate}
              disabled={isTranslating || !manglishText.trim()}
              className="gap-2"
            >
              {isTranslating ? (
                <RotateCw className="h-4 w-4 animate-spin" />
              ) : (
                <ScanText className="h-4 w-4" />
              )}
              {displayLanguage === "english" ? "Translate" : "വിവർത്തനം ചെയ്യുക"}
            </Button>
            <Button
              variant="outline"
              onClick={clearText}
              disabled={isTranslating || (!manglishText && !englishText)}
              className="gap-2"
            >
              <Eraser className="h-4 w-4" />
              {displayLanguage === "english" ? "Clear" : "മായ്ക്കുക"}
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setHistoryOpen(true)}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            {displayLanguage === "english" ? "History" : "ചരിത്രം"}
          </Button>
        </CardFooter>
      </Card>

      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        displayLanguage={displayLanguage}
      />

      <Card>
        <Collapsible
          open={isExampleOpen}
          onOpenChange={setIsExampleOpen}
          className="w-full"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="font-medium">
              {displayLanguage === "english" ? "Examples" : "ഉദാഹരണങ്ങൾ"}
            </h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExampleOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle examples</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="p-6 space-y-4">
              {examples.map((example, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">
                      {displayLanguage === "english"
                        ? "Manglish"
                        : "മംഗ്ലീഷ്"}
                    </Badge>
                    <p>{example.manglish}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setManglishText(example.manglish)}
                    >
                      <span className="sr-only">Use this example</span>
                      <ScanText className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 pl-12">
                    <Badge variant="outline" className="mt-1">
                      {displayLanguage === "english" ? "English" : "ഇംഗ്ലീഷ്"}
                    </Badge>
                    <p>{example.english}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
