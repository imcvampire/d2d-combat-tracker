import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, RefreshCw, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ApiResponse, CombatState } from '@shared/types';
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
} from "@/components/ui/alert-dialog"
interface CombatControlsProps {
  combatId: string;
  onAddEntity: () => void;
}
const postToAction = (action: 'next-turn' | 'reset') => async (combatId: string) => {
  const res = await fetch(`/api/combat/${combatId}/${action}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to ${action.replace('-', ' ')}`);
  return res.json() as Promise<ApiResponse<CombatState>>;
};
const useCombatAction = (action: 'next-turn' | 'reset') => {
  const queryClient = useQueryClient();
  const combatId = (queryClient.getQueryData(['combat', '']) as CombatState)?.id || '';
  return useMutation({
    mutationFn: postToAction(action),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['combat', data.data?.id], data.data);
        if (action === 'next-turn') {
            const activeEntity = data.data?.entities[data.data.activeIndex];
            if(activeEntity) toast.info(`${activeEntity.name}'s turn!`);
        }
        if (action === 'reset') toast.success('Encounter has been reset.');
      } else {
        toast.error(data.error || 'An unknown error occurred');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
export function CombatControls({ combatId, onAddEntity }: CombatControlsProps) {
  const nextTurnMutation = useCombatAction('next-turn');
  const resetMutation = useCombatAction('reset');
  return (
    <div className="fixed bottom-0 inset-x-0 md:sticky md:top-4 md:inset-x-auto md:bottom-auto md:z-10 md:float-right">
      <div className="bg-gray-900/80 backdrop-blur-sm p-2 md:p-0 md:bg-transparent md:backdrop-blur-none border-t-2 border-gray-700 md:border-none rounded-t-lg md:rounded-none">
        <div className="max-w-7xl mx-auto px-2 md:px-0">
          <div className="flex justify-center items-center gap-2">
            <Button onClick={onAddEntity} variant="outline" className="border-cyan text-cyan hover:bg-cyan hover:text-black">
              <Plus className="h-4 w-4 mr-2" /> Add Entity
            </Button>
            <Button
              onClick={() => nextTurnMutation.mutate(combatId)}
              disabled={nextTurnMutation.isPending}
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
                  <AlertDialogAction onClick={() => resetMutation.mutate(combatId)} className="bg-magenta hover:bg-magenta/90">Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}