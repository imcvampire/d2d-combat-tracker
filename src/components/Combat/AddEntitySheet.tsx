import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCombatStore } from '@/stores/useCombatStore';
import { useState } from 'react';
interface AddEntitySheetProps {
  combatId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
const entitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['player', 'monster']),
  maxHP: z.number().int().min(1, { message: 'HP must be at least 1' }),
  initiative: z.number().int().min(0, { message: 'Initiative must be non-negative' }).max(99, { message: 'Initiative must be 99 or less' }),
});
type EntityFormData = z.infer<typeof entitySchema>;
export function AddEntitySheet({ combatId, isOpen, onOpenChange }: AddEntitySheetProps) {
  const addEntity = useCombatStore((state) => state.addEntity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      name: '',
      type: 'monster',
      maxHP: 10,
      initiative: 10,
    },
  });
  const onSubmit = (values: EntityFormData) => {
    setIsSubmitting(true);
    try {
      addEntity(combatId, { ...values, currentHP: values.maxHP });
      toast.success(`${values.name} added to the fight!`);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add entity.");
    } finally {
      setIsSubmitting(false);
    }
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
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
              <Button type="submit" disabled={isSubmitting} className="w-full bg-accent-gradient text-black font-bold">
                {isSubmitting ? 'Adding...' : 'Add to Combat'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}