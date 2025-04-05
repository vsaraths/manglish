import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CopyButton } from "@/components/ui/copy-button";
import { Translation } from "@shared/schema";

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayLanguage: "english" | "malayalam";
}

export function HistoryDrawer({
  open,
  onOpenChange,
  displayLanguage,
}: HistoryDrawerProps) {
  const { data: translations, isLoading } = useQuery<Translation[]>({
    queryKey: ["/api/translations"],
    enabled: open,
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90%]">
        <DrawerHeader>
          <DrawerTitle>
            {displayLanguage === "english"
              ? "Translation History"
              : "വിവർത്തന ചരിത്രം"}
          </DrawerTitle>
          <DrawerDescription>
            {displayLanguage === "english"
              ? "Your recent translations"
              : "നിങ്ങളുടെ അടുത്തകാല വിവർത്തനങ്ങൾ"}
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="max-h-[60vh] px-4">
          {isLoading ? (
            <div className="py-6 text-center text-gray-500">
              {displayLanguage === "english" ? "Loading..." : "ലോഡ് ചെയ്യുന്നു..."}
            </div>
          ) : translations && translations.length > 0 ? (
            <div className="space-y-6 pb-6">
              {translations.map((translation) => (
                <div key={translation.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-xs text-gray-500">
                      {format(
                        new Date(translation.timestamp),
                        "MMM d, yyyy h:mm a"
                      )}
                    </div>
                    <CopyButton
                      text={translation.englishText}
                      className="h-6 w-6 p-0"
                    />
                  </div>
                  <div className="rounded-md bg-gray-100 p-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {translation.manglishText}
                    </p>
                    <Separator className="my-2" />
                    <p className="text-sm">{translation.englishText}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">
              {displayLanguage === "english"
                ? "No translation history yet"
                : "ഇതുവരെ വിവർത്തന ചരിത്രം ഇല്ല"}
            </div>
          )}
        </ScrollArea>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">
              {displayLanguage === "english" ? "Close" : "അടയ്ക്കുക"}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
