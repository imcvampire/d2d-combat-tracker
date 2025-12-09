import { toast } from 'sonner';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { Entity, Status } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useState } from 'react';
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
interface EntityDetailProps {
  entity: Entity;
  combatId: string;
}
export function EntityDetail({ entity, combatId }: EntityDetailProps) {
  const updateEntity = useCombatStore(state => state.updateEntity);
  const deleteEntity = useCombatStore(state => state.deleteEntity);
  const [damage, setDamage] = useState(1);
  const handleHpChange = (amount: number) => {
    const newHP = entity.currentHP + amount;
    updateEntity(combatId, entity.id, { currentHP: newHP });
  };
  const handleStatusToggle = (status: Status) => {
    const newStatuses = entity.statuses.includes(status)
      ? entity.statuses.filter(s => s !== status)
      : [...entity.statuses, status];
    updateEntity(combatId, entity.id, { statuses: newStatuses });
  };
  const handleInitiativeChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const newInitiative = parseInt(e.target.value, 10);
    if (!isNaN(newInitiative) && newInitiative !== entity.initiative) {
      updateEntity(combatId, entity.id, { initiative: newInitiative });
    }
  };
  const handleDelete = () => {
    deleteEntity(combatId, entity.id);
    toast.warning(`Deleted ${entity.name}.`);
  };
  const hpPercentage = (entity.currentHP / entity.maxHP) * 100;
  return (
    <Card className="bg-gray-900/50 border-2 border-gray-700 sticky top-24">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-2xl font-pixel text-cyan">{entity.name}</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="bg-magenta/80 hover:bg-magenta text-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {entity.name} from the encounter. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="font-pixel text-sm text-muted-foreground">HP</label>
          <div className="space-y-2">
            <Progress value={hpPercentage} className={cn("h-4 [&>div]:transition-all [&>div]:duration-500", hpPercentage > 50 ? "[&>div]:bg-cyan" : hpPercentage > 20 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-magenta")} />
            <div className="text-center font-mono text-lg">{entity.currentHP} / {entity.maxHP}</div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="border-magenta text-magenta hover:bg-magenta hover:text-black" onClick={() => handleHpChange(-damage)}><Minus /></Button>
              <Input type="number" value={damage} onChange={(e) => setDamage(Math.max(1, parseInt(e.target.value) || 1))} className="text-center font-bold" />
              <Button size="icon" variant="outline" className="border-cyan text-cyan hover:bg-cyan hover:text-black" onClick={() => handleHpChange(damage)}><Plus /></Button>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="initiative" className="font-pixel text-sm text-muted-foreground">Initiative</label>
          <Input id="initiative" type="number" defaultValue={entity.initiative} onBlur={handleInitiativeChange} className="font-bold text-lg" />
        </div>
        <div>
          <label className="font-pixel text-sm text-muted-foreground">Statuses</label>
          <ToggleGroup type="multiple" value={entity.statuses} className="flex-wrap justify-start">
            {(['poisoned', 'stunned', 'bleed'] as Status[]).map(status => (
              <ToggleGroupItem key={status} value={status} onClick={() => handleStatusToggle(status)} className="capitalize data-[state=on]:bg-cyan data-[state=on]:text-black">
                {status}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
}