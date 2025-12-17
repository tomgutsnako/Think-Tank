import React from 'react';
import { motion } from 'framer-motion';
const MotionDiv: any = motion.div;
import { Student } from '../types';

interface NameScrollerProps {
  students: Student[];
  finalIndex: number;
  spins?: number; // how many full cycles
  itemHeight?: number; // px
  visibleCount?: number; // number of items visible (used to center)
  onComplete?: () => void;
}

export function NameScroller({ students, finalIndex, spins = 6, itemHeight = 56, visibleCount = 3, onComplete }: NameScrollerProps) {
  if (!students || students.length === 0) return null;

  const totalItems = students.length * spins + finalIndex + 1; // +1 to ensure landing
  const items: Student[] = [];
  for (let i = 0; i < totalItems; i++) {
    const idx = i % students.length;
    items.push(students[idx]);
  }

  // we want the chosen student's item to end up centered in the visible window
  const containerHeight = itemHeight * visibleCount;
  const finalPosition = spins * students.length + finalIndex;
  const offsetToCenter = (containerHeight / 2) - (itemHeight / 2);
  const targetY = finalPosition * itemHeight - offsetToCenter;

  return (
    <div style={{ height: containerHeight, overflow: 'hidden', width: '100%' }} className="w-full relative">
      {/* center marker */}
      <div style={{ pointerEvents: 'none' }} className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/30 z-10" />

      <MotionDiv
        initial={{ y: 0 }}
        animate={{ y: -targetY }}
        transition={{ duration: 3 + Math.min(2.5, spins * 0.2), ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => onComplete?.()}
        className="flex flex-col items-stretch"
      >
        {items.map((s, i) => (
          <div
            key={`${s.id}-${i}`}
            style={{ height: itemHeight }}
            className="flex items-center px-4 border-b border-white/10 text-white"
          >
            <div className="flex-1 truncate">{s.name}</div>
            <div className="text-xs opacity-70 font-mono ml-3">{s.studentId}</div>
          </div>
        ))}
      </MotionDiv>
    </div>
  );
}

export default NameScroller;
