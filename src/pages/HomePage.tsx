import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Dices, Github } from 'lucide-react';
import type { ApiResponse, CombatState } from '@shared/types';
import { ThemeToggle } from '@/components/ThemeToggle';
async function createEncounter(name: string): Promise<ApiResponse<CombatState>> {
  const res = await fetch('/api/combat', {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error('Failed to create encounter');
  }
  return res.json();
}
export function HomePage() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: createEncounter,
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success('Encounter created! Entering the fray...');
        navigate(`/combat/${response.data.id}`);
      } else {
        toast.error(response.error || 'Could not create encounter.');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const handleCreateEncounter = () => {
    mutation.mutate('New Encounter');
  };
  return (
    <div className="min-h-screen w-full bg-retroDark text-foreground grain flex flex-col">
      <ThemeToggle className="fixed top-4 right-4" />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              <section className="text-center space-y-6">
                <div className="flex justify-center mb-4">
                  <Dices className="w-16 h-16 text-cyan animate-pulse" />
                </div>
                <h1 className="text-4xl md:text-6xl font-pixel bg-accent-gradient text-transparent bg-clip-text">
                  Retro Initiative Tracker
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  A visually striking, single-page web app for tracking D20-style, turn-by-turn combat.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleCreateEncounter}
                    disabled={mutation.isPending}
                    size="lg"
                    className="font-bold text-lg bg-accent-gradient text-black hover:shadow-glowCyan hover:scale-105 transition-all duration-200"
                  >
                    {mutation.isPending ? 'Creating...' : 'Create New Encounter'}
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-bold text-lg border-2 border-magenta text-magenta hover:bg-magenta hover:text-black hover:shadow-glowMagenta transition-all duration-200">
                    <Link to="/combat/demo">
                      Try Demo
                    </Link>
                  </Button>
                </div>
              </section>
            </motion.div>
          </div>
        </div>
      </main>
      <footer className="w-full py-4 text-center text-muted-foreground/50 text-sm">
        <p>Built with ❤��� at Cloudflare</p>
      </footer>
      <Toaster richColors theme="dark" />
    </div>
  );
}