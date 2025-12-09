import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Loader2, ServerCrash, Users, Settings, Share2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useCombatStore } from '@/stores/useCombatStore';
import { InitiativeList } from '@/components/Combat/InitiativeList';
import { EntityDetail } from '@/components/Combat/EntityDetail';
import { CombatControls } from '@/components/Combat/CombatControls';
import { AddEntitySheet } from '@/components/Combat/AddEntitySheet';
import { SettingsSheet } from '@/components/SettingsSheet';
import { Button } from '@/components/ui/button';
export function CombatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isAddSheetOpen, setAddSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const combatState = useCombatStore(state => state.getCombat(id!));
  const nextTurn = useCombatStore(state => state.nextTurn);
  useEffect(() => {
    if (id) {
      setIsLoading(false);
    }
    if (!isLoading && !combatState) {
      toast.error("Encounter not found.");
      navigate('/');
    }
  }, [id, combatState, isLoading, navigate]);
  const handleNextTurn = () => {
    const updatedCombat = nextTurn(id!);
    if (updatedCombat) {
      const activeEntity = updatedCombat.entities[updatedCombat.activeIndex];
      if (activeEntity) toast.info(`${activeEntity.name}'s turn!`);
    }
  };
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!combatState || combatState.entities.length === 0) return;
    const livingEntities = combatState.entities.filter(e => !e.isDead);
    if (livingEntities.length === 0) return;
    const currentIndex = livingEntities.findIndex(e => e.id === selectedEntityId);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % livingEntities.length;
      setSelectedEntityId(livingEntities[nextIndex].id);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = currentIndex <= 0 ? livingEntities.length - 1 : currentIndex - 1;
      setSelectedEntityId(livingEntities[prevIndex].id);
    } else if (event.key === ' ' || event.key === 'Enter') {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      event.preventDefault();
      handleNextTurn();
    }
  }, [combatState, selectedEntityId, id]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  const selectedEntity = combatState?.entities.find(e => e.id === selectedEntityId) || null;
  const handleSelectEntity = (entityId: string) => {
    setSelectedEntityId(prevId => (prevId === entityId ? null : entityId));
  };
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Encounter URL copied to clipboard!');
    }, () => {
      toast.error('Failed to copy URL.');
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-retroDark text-cyan flex flex-col items-center justify-center gap-4 grain">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="font-pixel text-lg">Loading Encounter...</p>
      </div>
    );
  }
  if (!combatState) {
    return (
      <div className="min-h-screen w-full bg-retroDark text-magenta flex flex-col items-center justify-center gap-4 grain p-4 text-center">
        <ServerCrash className="h-16 w-16" />
        <h1 className="font-pixel text-2xl">Error</h1>
        <p className="text-muted-foreground">Encounter not found.</p>
        <Button asChild variant="outline" className="border-cyan text-cyan hover:bg-cyan hover:text-retroDark">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }
  return (
    <>
      <div className="min-h-screen w-full bg-retroDark text-foreground grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header role="banner" className="flex items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-pixel text-cyan">{combatState.name}</h1>
                <p className="text-muted-foreground" aria-live="polite">Round: {combatState.round}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleShare} variant="ghost" size="icon" className="text-cyan hover:bg-cyan/10" aria-label="Share Encounter">
                  <Share2 />
                </Button>
                <Button onClick={() => setSettingsSheetOpen(true)} variant="ghost" size="icon" className="text-cyan hover:bg-cyan/10" aria-label="Open Settings">
                  <Settings />
                </Button>
                <Button asChild variant="ghost" size="icon" className="text-cyan hover:bg-cyan/10" aria-label="Go to Home Page">
                  <Link to="/"><Home /></Link>
                </Button>
              </div>
            </header>
            <main role="main" className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <motion.div layout className="md:col-span-2 space-y-4">
                {combatState.entities.length > 0 ? (
                  <InitiativeList
                    entities={combatState.entities}
                    activeIndex={combatState.activeIndex}
                    selectedEntityId={selectedEntityId}
                    onSelectEntity={handleSelectEntity}
                  />
                ) : (
                  <div className="h-full min-h-[300px] border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-8">
                    <Users className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="font-pixel text-xl text-cyan mb-2">The battlefield is empty.</h3>
                    <p className="text-muted-foreground mb-4">Add some players and monsters to begin.</p>
                    <Button onClick={() => setAddSheetOpen(true)} className="bg-accent-gradient text-black font-bold">Add First Entity</Button>
                  </div>
                )}
              </motion.div>
              <aside className="md:col-span-1">
                <AnimatePresence>
                  {selectedEntity && (
                    <motion.div
                      layout
                      key={selectedEntity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EntityDetail entity={selectedEntity} combatId={id!} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </aside>
            </main>
          </div>
        </div>
        <CombatControls combatId={id!} onAddEntity={() => setAddSheetOpen(true)} onNextTurn={handleNextTurn} />
      </div>
      <AddEntitySheet combatId={id!} isOpen={isAddSheetOpen} onOpenChange={setAddSheetOpen} />
      <SettingsSheet combatState={combatState} isOpen={isSettingsSheetOpen} onOpenChange={setSettingsSheetOpen} />
      <Toaster richColors theme="dark" />
    </>
  );
}