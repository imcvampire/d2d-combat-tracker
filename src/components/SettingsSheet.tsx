import { useState } from 'react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/hooks/use-theme';
import { Switch } from '@/components/ui/switch';
import type { CombatState } from '@shared/types';
interface SettingsSheetProps {
  combatState: CombatState | undefined;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
export function SettingsSheet({ combatState, isOpen, onOpenChange }: SettingsSheetProps) {
  const { isDark, toggleTheme } = useTheme();
  const [importJson, setImportJson] = useState('');
  const handleExport = () => {
    if (!combatState) {
      toast.error("No encounter data to export.");
      return;
    }
    try {
      const jsonString = JSON.stringify(combatState, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${combatState.name.replace(/\s+/g, '_')}_${combatState.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Encounter exported successfully!");
    } catch (error) {
      toast.error("Failed to export encounter.");
      console.error(error);
    }
  };
  const handleImport = () => {
    // This is a placeholder for a more robust import feature in a later phase.
    // For now, it demonstrates the UI.
    try {
      const parsed = JSON.parse(importJson);
      // Here you would typically call a mutation to update/create an encounter
      console.log("Imported data:", parsed);
      toast.success("Encounter data loaded into text area. (Import functionality to be fully wired in a future phase)");
    } catch (error) {
      toast.error("Invalid JSON format.");
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="bg-retroDark border-l-gray-700">
        <SheetHeader>
          <SheetTitle className="font-pixel text-2xl text-cyan">Settings & About</SheetTitle>
          <SheetDescription>Manage your encounter and app settings.</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-8">
          <div className="space-y-4">
            <h3 className="font-pixel text-lg text-magenta">Appearance</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode-switch">Dark Mode</Label>
              <Switch id="dark-mode-switch" checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-pixel text-lg text-magenta">Encounter Data</h3>
            <Button onClick={handleExport} disabled={!combatState} className="w-full">Export to JSON</Button>
            <div className="space-y-2">
              <Label htmlFor="import-json">Import from JSON</Label>
              <Textarea
                id="import-json"
                placeholder='Paste your encounter JSON here...'
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleImport} variant="outline" className="w-full">Load Data</Button>
            </div>
          </div>
        </div>
        <SheetFooter className="text-center text-muted-foreground/50 text-sm">
          <p>Built with ❤️ at Cloudflare</p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}