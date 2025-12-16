import { useState, useEffect } from 'react';
import { Student } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { motion } from 'framer-motion';
import { Shuffle, RotateCcw, Sparkles } from 'lucide-react';

interface CardData {
  id: string;
  student: Student;
  isRevealed: boolean;
  emoji: string;
}

interface CardRandomizerProps {
  students: Student[];
  onStudentRevealed: (student: Student) => void;
  isSessionActive: boolean;
}

const CARD_EMOJIS = [
  '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', 
  '🎮', '🎰', '🎳', '🎸', '🎹', '🎺', '🎻', '🎼',
  '🚀', '🌟', '⭐', '✨', '💫', '🌈', '🔥', '💡',
  '🎁', '🎈', '🎉', '🎊', '🏆', '🥇', '🏅', '👑'
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function CardRandomizer({ students, onStudentRevealed, isSessionActive }: CardRandomizerProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [revealCount, setRevealCount] = useState(1);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    initializeCards();
  }, [students]);

  const initializeCards = () => {
    const shuffledStudents = shuffleArray(students);
    const shuffledEmojis = shuffleArray(CARD_EMOJIS);
    
    const newCards: CardData[] = shuffledStudents.map((student, index) => ({
      id: crypto.randomUUID(),
      student,
      isRevealed: false,
      emoji: shuffledEmojis[index % shuffledEmojis.length],
    }));
    
    setCards(newCards);
  };

  const handleCardClick = (cardId: string) => {
    if (!isSessionActive) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isRevealed) return;

    setCards(prev =>
      prev.map(c =>
        c.id === cardId ? { ...c, isRevealed: true } : c
      )
    );

    onStudentRevealed(card.student);
  };

  const handleRevealMultiple = () => {
    if (!isSessionActive) return;

    const unrevealedCards = cards.filter(c => !c.isRevealed);
    const cardsToReveal = unrevealedCards.slice(0, revealCount);

    cardsToReveal.forEach((card, index) => {
      setTimeout(() => {
        setCards(prev =>
          prev.map(c =>
            c.id === card.id ? { ...c, isRevealed: true } : c
          )
        );
        onStudentRevealed(card.student);
      }, index * 300);
    });

    setShowBatchDialog(false);
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    
    // Reset all cards
    const resetCards = cards.map(c => ({ ...c, isRevealed: false }));
    
    // Shuffle students and emojis
    setTimeout(() => {
      const shuffledStudents = shuffleArray(resetCards.map(c => c.student));
      const shuffledEmojis = shuffleArray(CARD_EMOJIS);
      
      const newCards: CardData[] = shuffledStudents.map((student, index) => ({
        id: crypto.randomUUID(),
        student,
        isRevealed: false,
        emoji: shuffledEmojis[index % shuffledEmojis.length],
      }));
      
      setCards(newCards);
      setIsShuffling(false);
    }, 600);
  };

  const handleReset = () => {
    setCards(prev => prev.map(c => ({ ...c, isRevealed: false })));
  };

  const revealedCount = cards.filter(c => c.isRevealed).length;
  const unrevealedCount = cards.length - revealedCount;

  return (
    <div className="space-y-6">
      {/* Batch Reveal Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reveal Multiple Cards</DialogTitle>
            <DialogDescription>
              How many cards would you like to reveal at once?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revealCount">Number of Cards</Label>
              <Input
                id="revealCount"
                type="number"
                min="1"
                max={unrevealedCount}
                value={revealCount}
                onChange={(e) => setRevealCount(Math.max(1, Math.min(unrevealedCount, parseInt(e.target.value) || 1)))}
              />
              <p className="text-sm text-muted-foreground">
                {unrevealedCount} cards remaining
              </p>
            </div>
            <Button onClick={handleRevealMultiple} className="w-full" disabled={unrevealedCount === 0}>
              Reveal {revealCount} Card{revealCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowBatchDialog(true)}
              disabled={!isSessionActive || unrevealedCount === 0}
              variant="secondary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Reveal Multiple
            </Button>
            <Button
              onClick={handleShuffle}
              disabled={!isSessionActive || isShuffling}
              variant="outline"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle Cards
            </Button>
            <Button
              onClick={handleReset}
              disabled={revealedCount === 0}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
            <div className="ml-auto flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Revealed: <span className="font-medium text-foreground">{revealedCount}</span>
              </span>
              <span className="text-muted-foreground">
                Remaining: <span className="font-medium text-foreground">{unrevealedCount}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => handleCardClick(card.id)}
              disabled={!isSessionActive || card.isRevealed}
              className="w-full aspect-square perspective-1000"
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: card.isRevealed ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Card Back */}
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center text-6xl cursor-pointer transition-all ${
                    card.isRevealed
                      ? 'pointer-events-none'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {!card.isRevealed && (
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      {card.emoji}
                    </motion.span>
                  )}
                </div>

                {/* Card Front (Revealed) */}
                <div
                  className="absolute inset-0 rounded-xl bg-white border-2 border-green-500 shadow-lg p-3 flex flex-col items-center justify-center text-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="mb-2 text-3xl">{card.emoji}</div>
                  <p className="text-sm line-clamp-2 break-words">
                    {card.student.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {card.student.studentId}
                  </p>
                </div>
              </motion.div>
            </button>
          </motion.div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No students available</p>
        </div>
      )}
    </div>
  );
}
