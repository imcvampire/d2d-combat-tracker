import { toast } from 'sonner';
import { Plus, RefreshCw, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCombatStore } from '@/stores/useCombatStore';
import { useState } from 'react';
interface CombatControlsProps {
  combatId: string;
  onAddEntity: () => void;
  onNextTurn: () => void;
}
export function CombatControls({ combatId, onAddEntity, onNextTurn }: CombatControlsProps) {
  const resetCombat = useCombatStore(state => state.resetCombat);
  const [isResetting, setIsResetting] = useState(false);
  const handleReset = () => {
    setIsResetting(true);
    try {
      resetCombat(combatId);
      toast.success('Encounter has been reset.');
    } catch (error) {
      toast.error('Failed to reset encounter.');
    } finally {
      setIsResetting(false);
    }
  };
  return (
    <div className="fixed bottom-0 inset-x-0 md:sticky md:top-4 md:inset-x-auto md:bottom-auto md:z-10 md:float-right">
      <div className="bg-gray-900/80 backdrop-blur-sm p-2 md:p-0 md:bg-transparent md:backdrop-blur-none border-t-2 border-gray-700 md:border-none rounded-t-lg md:rounded-none">
        <div className="max-w-7xl mx-auto px-2 md:px-0">
          <div className="flex justify-center items-center gap-2">
            <Button onClick={onAddEntity} variant="outline" className="border-cyan text-cyan hover:bg-cyan hover:text-black">
              <Plus className="h-4 w-4 mr-2" /> Add Entity
            </Button>
            <Button
              onClick={onNextTurn}
              className="flex-1 md:flex-none font-bold bg-accent-gradient text-black hover:shadow-glowCyan hover:scale-105 transition-transform"
            >
              Next Turn <ChevronsRight className="h-4 w-4 ml-2" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-magenta text-magenta hover:bg-magenta hover:text-black">
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Encounter?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restore all combatants to full HP, clear their statuses, and reset the turn order to the beginning.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} disabled={isResetting} className="bg-magenta hover:bg-magenta/90">
                    {isResetting ? 'Resetting...' : 'Reset'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}