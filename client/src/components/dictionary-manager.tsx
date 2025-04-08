import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { transliterateManglishToMalayalam } from "../lib/translator";
import { useToast } from "@/hooks/use-toast";

interface DictionaryEntry {
  id: number;
  manglishWord: string;
  englishWord: string;
  partOfSpeech: string | null;
  examples: string[];
}

interface DictionaryManagerProps {
  displayLanguage: "english" | "malayalam";
}

export function DictionaryManager({ displayLanguage }: DictionaryManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    manglishWord: "",
    englishWord: "",
    partOfSpeech: "",
    examples: [""]
  });
  const [malayalamPreview, setMalayalamPreview] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch dictionary data
  const { data: dictionaryEntries = [], isLoading } = useQuery({
    queryKey: ['/api/dictionary'],
    queryFn: async () => {
      const entries = await apiRequest<DictionaryEntry[]>('/api/dictionary');
      return entries;
    }
  });
  
  // Add new dictionary entry
  const addEntryMutation = useMutation({
    mutationFn: async (entry: typeof newEntry) => {
      return await apiRequest('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dictionary'] });
      setShowAddDialog(false);
      setNewEntry({
        manglishWord: "",
        englishWord: "",
        partOfSpeech: "",
        examples: [""]
      });
      setMalayalamPreview("");
      
      toast({
        title: displayLanguage === "english" ? "Entry Added" : "എൻട്രി ചേർത്തു",
        description: displayLanguage === "english" 
          ? "The dictionary entry has been added successfully."
          : "നിഘണ്ടു എൻട്രി വിജയകരമായി ചേർത്തു.",
      });
    }
  });
  
  // Filter entries based on search term
  const filteredEntries = searchTerm 
    ? dictionaryEntries.filter((entry: DictionaryEntry) => 
        entry.manglishWord.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.englishWord.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : dictionaryEntries;
  
  // Handle adding an example field
  const addExampleField = () => {
    setNewEntry({
      ...newEntry,
      examples: [...newEntry.examples, ""]
    });
  };
  
  // Handle updating an example field
  const updateExample = (index: number, value: string) => {
    const updatedExamples = [...newEntry.examples];
    updatedExamples[index] = value;
    setNewEntry({
      ...newEntry,
      examples: updatedExamples
    });
  };
  
  // Handle removing an example field
  const removeExampleField = (index: number) => {
    const updatedExamples = newEntry.examples.filter((_, i) => i !== index);
    setNewEntry({
      ...newEntry,
      examples: updatedExamples
    });
  };
  
  // Generate Malayalam preview
  const generateMalayalamPreview = async () => {
    if (!newEntry.manglishWord) {
      toast({
        title: displayLanguage === "english" ? "Input Required" : "ഇൻപുട്ട് ആവശ്യമാണ്",
        description: displayLanguage === "english" 
          ? "Please enter a Manglish word to preview."
          : "പ്രിവ്യൂ ചെയ്യാൻ ദയവായി ഒരു മംഗ്ലിഷ് വാക്ക് നൽകുക.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const malayalamText = await transliterateManglishToMalayalam(newEntry.manglishWord);
      setMalayalamPreview(malayalamText);
    } catch (error) {
      toast({
        title: displayLanguage === "english" ? "Transliteration Failed" : "ട്രാൻസ്ലിറ്ററേഷൻ പരാജയപ്പെട്ടു",
        description: displayLanguage === "english" 
          ? "Failed to generate Malayalam preview."
          : "മലയാളം പ്രിവ്യൂ ഉണ്ടാക്കുന്നതിൽ പരാജയപ്പെട്ടു.",
        variant: "destructive"
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newEntry.manglishWord || !newEntry.englishWord) {
      toast({
        title: displayLanguage === "english" ? "Validation Error" : "വാലിഡേഷൻ എറർ",
        description: displayLanguage === "english" 
          ? "Manglish and English words are required."
          : "മംഗ്ലിഷ് ആൻഡ് ഇംഗ്ലീഷ് വാക്കുകൾ ആവശ്യമാണ്.",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty examples
    const filteredExamples = newEntry.examples.filter(ex => ex.trim() !== "");
    
    addEntryMutation.mutate({
      ...newEntry,
      examples: filteredExamples
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <Input
          placeholder={displayLanguage === "english" ? "Search dictionary..." : "നിഘണ്ടുവിൽ തിരയുക..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              {displayLanguage === "english" ? "Add New Entry" : "പുതിയ എൻട്രി ചേർക്കുക"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {displayLanguage === "english" ? "Add New Dictionary Entry" : "പുതിയ നിഘണ്ടു എൻട്രി ചേർക്കുക"}
              </DialogTitle>
              <DialogDescription>
                {displayLanguage === "english" 
                  ? "Fill in the details to add a new word to the dictionary."
                  : "നിഘണ്ടുവിൽ ഒരു പുതിയ വാക്ക് ചേർക്കാൻ വിശദാംശങ്ങൾ പൂരിപ്പിക്കുക."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manglishWord" className="text-right">
                    {displayLanguage === "english" ? "Manglish Word" : "മംഗ്ലിഷ് വാക്ക്"}
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input
                      id="manglishWord"
                      value={newEntry.manglishWord}
                      onChange={(e) => setNewEntry({ ...newEntry, manglishWord: e.target.value })}
                      placeholder="e.g. veedu, ente, njan"
                    />
                    <div className="flex justify-between items-center">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={generateMalayalamPreview}
                      >
                        {displayLanguage === "english" ? "Preview in Malayalam" : "മലയാളത്തിൽ പ്രിവ്യൂ"}
                      </Button>
                      {malayalamPreview && (
                        <div className="text-sm ml-2 font-medium p-2 bg-muted rounded">
                          {malayalamPreview}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="englishWord" className="text-right">
                    {displayLanguage === "english" ? "English Word" : "ഇംഗ്ലീഷ് വാക്ക്"}
                  </Label>
                  <Input
                    id="englishWord"
                    className="col-span-3"
                    value={newEntry.englishWord}
                    onChange={(e) => setNewEntry({ ...newEntry, englishWord: e.target.value })}
                    placeholder="e.g. house, my, I"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="partOfSpeech" className="text-right">
                    {displayLanguage === "english" ? "Part of Speech" : "വാക്കിന്റെ ഭാഗം"}
                  </Label>
                  <Select 
                    value={newEntry.partOfSpeech} 
                    onValueChange={(value) => setNewEntry({ ...newEntry, partOfSpeech: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={displayLanguage === "english" ? "Select part of speech" : "വാക്കിന്റെ ഭാഗം തിരഞ്ഞെടുക്കുക"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noun">{displayLanguage === "english" ? "Noun" : "നാമം"}</SelectItem>
                      <SelectItem value="verb">{displayLanguage === "english" ? "Verb" : "ക്രിയ"}</SelectItem>
                      <SelectItem value="adjective">{displayLanguage === "english" ? "Adjective" : "വിശേഷണം"}</SelectItem>
                      <SelectItem value="adverb">{displayLanguage === "english" ? "Adverb" : "ക്രിയാവിശേഷണം"}</SelectItem>
                      <SelectItem value="pronoun">{displayLanguage === "english" ? "Pronoun" : "സർവനാമം"}</SelectItem>
                      <SelectItem value="preposition">{displayLanguage === "english" ? "Preposition" : "സർവനാമവിഭക്തി"}</SelectItem>
                      <SelectItem value="conjunction">{displayLanguage === "english" ? "Conjunction" : "സംയോജകം"}</SelectItem>
                      <SelectItem value="interjection">{displayLanguage === "english" ? "Interjection" : "ആശ്ചര്യസൂചകം"}</SelectItem>
                      <SelectItem value="phrase">{displayLanguage === "english" ? "Phrase" : "വാക്യാംശം"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="examples" className="text-right pt-2">
                    {displayLanguage === "english" ? "Examples" : "ഉദാഹരണങ്ങൾ"}
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {newEntry.examples.map((example, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={example}
                          onChange={(e) => updateExample(index, e.target.value)}
                          placeholder={displayLanguage === "english" ? "Example usage" : "ഉദാഹരണ ഉപയോഗം"}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeExampleField(index)}
                          disabled={newEntry.examples.length === 1}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addExampleField}
                    >
                      {displayLanguage === "english" ? "Add Example" : "ഉദാഹരണം ചേർക്കുക"}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addEntryMutation.isPending}>
                  {addEntryMutation.isPending
                    ? (displayLanguage === "english" ? "Saving..." : "സംരക്ഷിക്കുന്നു...")
                    : (displayLanguage === "english" ? "Save Entry" : "എൻട്രി സംരക്ഷിക്കുക")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="h-6 bg-muted animate-pulse rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-1/2 mx-auto"></div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm 
            ? (displayLanguage === "english" ? "No entries found matching your search." : "നിങ്ങളുടെ തിരയലുമായി പൊരുത്തപ്പെടുന്ന എൻട്രികളൊന്നും കണ്ടെത്തിയില്ല.")
            : (displayLanguage === "english" ? "No dictionary entries found." : "നിഘണ്ടു എൻട്രികളൊന്നും കണ്ടെത്തിയില്ല.")}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {displayLanguage === "english" ? "Dictionary Entries" : "നിഘണ്ടു എൻട്രികൾ"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {displayLanguage === "english" 
                  ? `Showing ${filteredEntries.length} entries`
                  : `${filteredEntries.length} എൻട്രികൾ കാണിക്കുന്നു`}
              </p>
            </div>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {filteredEntries.map((entry: DictionaryEntry) => (
              <AccordionItem key={entry.id} value={`entry-${entry.id}`}>
                <AccordionTrigger className="hover:no-underline hover:bg-accent p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center">
                    <div className="font-semibold">{entry.manglishWord}</div>
                    <div className="text-sm text-muted-foreground">{entry.englishWord}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="bg-accent/30 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {displayLanguage === "english" ? "Manglish" : "മംഗ്ലിഷ്"}:
                        </p>
                        <p className="font-medium">{entry.manglishWord}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {displayLanguage === "english" ? "English" : "ഇംഗ്ലീഷ്"}:
                        </p>
                        <p className="font-medium">{entry.englishWord}</p>
                      </div>
                    </div>
                    
                    {entry.partOfSpeech && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {displayLanguage === "english" ? "Part of Speech" : "വാക്കിന്റെ ഭാഗം"}:
                        </p>
                        <Badge variant="outline" className="capitalize">
                          {entry.partOfSpeech}
                        </Badge>
                      </div>
                    )}
                    
                    {entry.examples && entry.examples.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {displayLanguage === "english" ? "Examples" : "ഉദാഹരണങ്ങൾ"}:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          {entry.examples.map((example: string, i: number) => (
                            <li key={i} className="text-sm">{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}