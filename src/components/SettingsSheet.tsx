import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/hooks/use-theme';
import { Switch } from '@/components/ui/switch';
import type { CombatState } from '@shared/types';
import { useCombatStore } from '@/stores/useCombatStore';
interface SettingsSheetProps {
  combatState: CombatState | undefined;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
const combatStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  entities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['player', 'monster']),
    maxHP: z.number(),
    currentHP: z.number(),
    initiative: z.number(),
    statuses: z.array(z.enum(['poisoned', 'stunned', 'bleed'])),
    isDead: z.boolean(),
  })),
  activeIndex: z.number(),
  round: z.number(),
  createdAt: z.string().optional(),
});
export function SettingsSheet({ combatState, isOpen, onOpenChange }: SettingsSheetProps) {
  const { isDark, toggleTheme } = useTheme();
  const [usePixelFont, setUsePixelFont] = useState(() => localStorage.getItem('font-theme') === 'pixel');
  const [importJson, setImportJson] = useState('');
  const navigate = useNavigate();
  const importCombat = useCombatStore(state => state.importCombat);
  const [isImporting, setIsImporting] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('font-pixel-headings', usePixelFont);
    localStorage.setItem('font-theme', usePixelFont ? 'pixel' : 'system');
  }, [usePixelFont]);
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
    setIsImporting(true);
    try {
      const parsed = JSON.parse(importJson);
      const validation = combatStateSchema.safeParse(parsed);
      if (!validation.success) {
        throw new z.ZodError(validation.error.issues);
      }
      const imported = importCombat(validation.data);
      toast.success('Encounter imported successfully!');
      navigate(`/combat/${imported.id}`);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(`Invalid JSON format: ${error.issues.map(i => i.message).join(', ')}`);
      } else {
        toast.error("Invalid JSON format.");
      }
    } finally {
      setIsImporting(false);
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
              <Label htmlFor="dark-mode-switch" aria-label="Toggle dark mode">Dark Mode</Label>
              <Switch id="dark-mode-switch" checked={isDark} onCheckedChange={toggleTheme} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="font-switch" aria-label="Toggle pixel font for headings">Pixel Font Headings</Label>
              <Switch id="font-switch" checked={usePixelFont} onCheckedChange={setUsePixelFont} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-pixel text-lg text-magenta">Encounter Data</h3>
            <Button onClick={handleExport} disabled={!combatState} className="w-full" aria-label="Export encounter to JSON file">Export to JSON</Button>
            <div className="space-y-2">
              <Label htmlFor="import-json">Import from JSON</Label>
              <Textarea
                id="import-json"
                placeholder='Paste your encounter JSON here...'
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="min-h-[100px]"
                aria-label="Paste encounter JSON here for import"
              />
              <Button onClick={handleImport} variant="outline" className="w-full" disabled={!importJson || isImporting} aria-label="Import encounter from JSON">
                {isImporting ? 'Importing...' : 'Load Data'}
              </Button>
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