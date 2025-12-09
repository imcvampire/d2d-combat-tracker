import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { AddEntityRequest, ApiResponse, CombatState } from '@shared/types';
interface AddEntitySheetProps {
  combatId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
const entitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['player', 'monster']),
  maxHP: z.coerce.number().min(1, 'HP must be at least 1'),
  initiative: z.coerce.number(),
});
type EntityFormData = z.infer<typeof entitySchema>;
const addEntity = async ({ combatId, entity }: { combatId: string, entity: AddEntityRequest }) => {
  const res = await fetch(`/api/combat/${combatId}/entity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entity),
  });
  if (!res.ok) throw new Error('Failed to add entity');
  return res.json() as Promise<ApiResponse<CombatState>>;
};
export function AddEntitySheet({ combatId, isOpen, onOpenChange }: AddEntitySheetProps) {
  const queryClient = useQueryClient();
  const form = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      name: '',
      type: 'monster',
      maxHP: 10,
      initiative: 10,
    },
  });
  const mutation = useMutation({
    mutationFn: addEntity,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['combat', combatId], data.data);
        toast.success(`${form.getValues('name')} added to the fight!`);
        form.reset();
        onOpenChange(false);
      } else {
        toast.error(data.error || 'An unknown error occurred');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const onSubmit = (values: EntityFormData) => {
    mutation.mutate({
      combatId,
      entity: { ...values, currentHP: values.maxHP },
    });
  };
  const rollInitiative = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    form.setValue('initiative', roll);
  };
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="bg-retroDark border-l-gray-700">
        <SheetHeader>
          <SheetTitle className="font-pixel text-2xl text-cyan">Add Combatant</SheetTitle>
          <SheetDescription>Add a new player or monster to the encounter.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-pixel">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Goblin Grunt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-pixel">Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="monster">Monster</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxHP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-pixel">Max HP</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="initiative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-pixel">Initiative</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={rollInitiative} className="border-cyan text-cyan hover:bg-cyan hover:text-black">
                      Roll
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-accent-gradient text-black font-bold">
                {mutation.isPending ? 'Adding...' : 'Add to Combat'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}