import { motion, AnimatePresence } from 'framer-motion';
import { User, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Entity } from '@shared/types';
import { useEffect, useRef } from 'react';
interface InitiativeListProps {
  entities: Entity[];
  activeIndex: number;
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
}
const statusIcons: Record<string, React.ReactNode> = {
  poisoned: '🤢',
  stunned: '😵',
  bleed: '🩸',
};
const listVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
export function InitiativeList({ entities, activeIndex, selectedEntityId, onSelectEntity }: InitiativeListProps) {
  const selectedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.focus();
    }
  }, [selectedEntityId]);
  const handleKeyDown = (event: React.KeyboardEvent, entityId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onSelectEntity(entityId);
    }
  };
  return (
    <motion.div
      role="listbox"
      aria-label="Initiative Order"
      className="space-y-3 focus:outline-none"
      variants={listVariants}
      initial="hidden"
      animate="visible"
      tabIndex={-1}
    >
      <AnimatePresence>
        {entities.map((entity, index) => {
          const isActive = index === activeIndex;
          const isSelected = entity.id === selectedEntityId;
          const hpPercentage = (entity.currentHP / entity.maxHP) * 100;
          return (
            <motion.div
              key={entity.id}
              ref={isSelected ? selectedRef : null}
              layout
              variants={itemVariants}
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => onSelectEntity(entity.id)}
              onKeyDown={(e) => handleKeyDown(e, entity.id)}
              role="option"
              aria-selected={isSelected}
              tabIndex={0}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-retroDark",
                "bg-gray-900/50 border-gray-700 hover:border-cyan",
                isSelected && "border-cyan shadow-glowCyan",
                isActive && "border-magenta shadow-glowMagenta scale-105",
                entity.isDead && "opacity-50 grayscale"
              )}
            >
              {isActive && (
                <motion.div layoutId="active-turn-indicator" className="absolute top-0 left-0 h-full w-1.5 bg-magenta" />
              )}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-600">
                  {entity.type === 'player' ? <User className="w-6 h-6 text-cyan" /> : <Skull className="w-6 h-6 text-magenta" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-bold text-white">{entity.name}</h3>
                    <div className="flex items-center gap-2">
                      {entity.statuses.map(status => (
                        <TooltipProvider key={status}>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-lg">{statusIcons[status]}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="capitalize">{status}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">{entity.type}</div>
                  <div className="mt-2">
                    <Progress value={hpPercentage} className={cn("h-3 bg-gray-700", {
                      '[&>div]:bg-gradient-to-r from-cyan to-green-400': hpPercentage > 50,
                      '[&>div]:bg-yellow-500': hpPercentage <= 50 && hpPercentage > 20,
                      '[&>div]:bg-gradient-to-r from-magenta to-red-500': hpPercentage <= 20,
                    })} />
                    <div className="text-xs text-right mt-1 font-mono">{entity.currentHP} / {entity.maxHP}</div>
                  </div>
                </div>
                <div className="text-center w-16">
                  <div className="text-3xl font-pixel text-cyan tabular-nums">{entity.initiative}</div>
                  <div className="text-xs text-muted-foreground">INIT</div>
                </div>
              </div>
              {entity.isDead && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="font-pixel text-2xl text-red-500 -rotate-12">DEAD</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}