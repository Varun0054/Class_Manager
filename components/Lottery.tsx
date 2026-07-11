import React, { useState, useEffect, useRef } from 'react';
import { useActiveClass } from '../store/useStore';
import { playSound } from '../lib/audio';
import { 
  Sparkles, 
  Play, 
  Dices, 
  HelpCircle,
  SkipForward,
  Trophy,
  XCircle,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Mode = 'single' | 'cards';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #7c3aed, #2563eb)', // Purple–Blue
  'linear-gradient(135deg, #ec4899, #f97316)', // Pink–Orange
  'linear-gradient(135deg, #06b6d4, #0d9488)', // Cyan–Teal
  'linear-gradient(135deg, #a3e635, #059669)', // Lime–Emerald
  'linear-gradient(135deg, #f59e0b, #ea580c)'  // Yellow–Coral
];

export default function Lottery() {
  const { students, drawStudents, settings, skipStudent, updatePoints, resetRound } = useActiveClass();
  
  // Draw controls
  const [drawCount, setDrawCount] = useState<number>(1);
  const [customCount, setCustomCount] = useState<string>('');
  const [activeMode, setActiveMode] = useState<Mode>('single');
  const [activityName, setActivityName] = useState<string>('Game Show Draw');

  // Animation States
  const [isDrawing, setIsDrawing] = useState(false);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [isShufflingCards, setIsShufflingCards] = useState(false);

  // Deck of mystery cards to render on stage
  const [cardsDeck, setCardsDeck] = useState<any[]>([]);

  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Remaining student pool
  const pool = students.filter((s) => !s.isSelected && !s.isSkipped);

  // Sequential flipping logic
  const triggerAutoReveal = (deck: any[]) => {
    // Sequentially flip all cards with staggered delay
    deck.forEach((card, index) => {
      setTimeout(() => {
        setCardsDeck(prev => prev.map(c => c.id === card.id ? { ...c, isFlipped: true } : c));
        playSound.winner(settings.soundEnabled);
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.7 }
        });
      }, index * 400 + 300); // 400ms delay between cards
    });
  };

  // Setup Deck helper
  const prepareDeck = (selectedStudents: any[]) => {
    const deck = selectedStudents.map((student, idx) => ({
      id: student.id,
      student,
      isFlipped: false,
      gradient: CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
    }));
    setCardsDeck(deck);
    return deck;
  };

  // 1. Classic Game Show Shuffling Animation
  const startClassicDraw = () => {
    if (students.length === 0) return;
    playSound.click(settings.soundEnabled);
    setIsDrawing(true);
    setCardsDeck([]);

    if (pool.length === 0) {
      resetRound();
    }

    const count = customCount ? parseInt(customCount) || 1 : drawCount;
    const activePool = pool.length === 0 ? students : pool;

    let ticks = 0;
    const maxTicks = settings.drawSpeed === 'fast' ? 12 : settings.drawSpeed === 'slow' ? 35 : 22;
    const intervalTime = settings.drawSpeed === 'fast' ? 70 : settings.drawSpeed === 'slow' ? 160 : 100;

    const runShuffle = () => {
      ticks++;
      setShuffleIndex(Math.floor(Math.random() * activePool.length));
      playSound.shuffle(settings.soundEnabled, settings.drawSpeed);

      if (ticks < maxTicks) {
        shuffleTimerRef.current = setTimeout(runShuffle, intervalTime);
      } else {
        const selected = drawStudents(count, activityName, 'single');
        const deck = prepareDeck(selected);
        setIsDrawing(false);
        triggerAutoReveal(deck);
      }
    };
    runShuffle();
  };

  // 4. Dealer Card Shuffle Animation
  const handleShuffleCards = () => {
    if (students.length === 0) return;
    if (pool.length === 0) {
      resetRound();
    }

    const count = customCount ? parseInt(customCount) || 1 : drawCount;
    setIsShufflingCards(true);
    setCardsDeck([]);
    playSound.click(settings.soundEnabled);

    const selected = drawStudents(count, activityName, 'cards');
    const deck = prepareDeck(selected);

    let shuffleTicks = 0;
    const interval = setInterval(() => {
      shuffleTicks++;
      playSound.shuffle(settings.soundEnabled, 'fast');
      setCardsDeck(prev => [...prev].sort(() => Math.random() - 0.5));
      
      if (shuffleTicks >= 8) {
        clearInterval(interval);
        setIsShufflingCards(false);
      }
    }, 250);
  };

  const flipCard = (cardId: string) => {
    if (isShufflingCards) return;
    setCardsDeck(prev => prev.map(card => {
      if (card.id === cardId && !card.isFlipped) {
        playSound.winner(settings.soundEnabled);
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.7 }
        });
        return { ...card, isFlipped: true };
      }
      return card;
    }));
  };

  const flipAllCards = () => {
    if (isShufflingCards) return;
    playSound.winner(settings.soundEnabled);
    playSound.applause(settings.soundEnabled);
    cardsDeck.forEach((card, index) => {
      setTimeout(() => {
        setCardsDeck(prev => prev.map(c => c.id === card.id ? { ...c, isFlipped: true } : c));
        confetti({
          particleCount: 20,
          spread: 30,
          origin: { y: 0.7 }
        });
      }, index * 250);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Settings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Draw parameters */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-md space-y-6">
          <div className="flex items-center gap-2 text-violet-600">
            <Dices className="w-6 h-6 animate-spin-slow" />
            <h2 className="text-2xl font-black">Draw Selection Panel</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Activity Name</label>
              <input 
                type="text" 
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Quantity to Draw</label>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      playSound.click(settings.soundEnabled);
                      setDrawCount(num);
                      setCustomCount('');
                    }}
                    className={`py-3 rounded-2xl font-extrabold text-sm transition-all ${
                      drawCount === num && !customCount
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                
                <input
                  type="number"
                  placeholder="Custom"
                  value={customCount}
                  onChange={(e) => {
                    setCustomCount(e.target.value);
                    setDrawCount(0);
                  }}
                  className={`py-3 px-2 rounded-2xl font-extrabold text-center text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${
                    customCount 
                      ? 'border-violet-500 bg-violet-50/50 text-violet-700' 
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          {activeMode === 'single' && (
            <button
              onClick={startClassicDraw}
              disabled={isDrawing || students.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 text-white font-extrabold rounded-[22px] py-4 shadow-lg hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-5 h-5 fill-white stroke-none" />
              <span>START SHOWROOM DRAW</span>
            </button>
          )}

          {activeMode === 'cards' && (
            <button
              onClick={handleShuffleCards}
              disabled={isShufflingCards || students.length === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-extrabold rounded-[22px] py-4 shadow-lg hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <HelpCircle className="w-5 h-5" />
              <span>SHUFFLE CARDS DECK</span>
            </button>
          )}

        </div>

        {/* Mode Selector Panel */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Draw Animation Mode</span>
            
            <div className="space-y-2">
              {[
                { id: 'single', label: 'Classic Game Show', icon: Dices, desc: 'Energetic full card cinematic reveal' },
                { id: 'cards', label: 'Dealer Card Shuffle', icon: HelpCircle, desc: 'Flipped deck dealer selection' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      playSound.click(settings.soundEnabled);
                      setActiveMode(m.id as Mode);
                      setCardsDeck([]);
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left border transition-all ${
                      activeMode === m.id
                        ? 'border-violet-500/30 bg-gradient-to-r from-violet-50 to-indigo-50 text-slate-800'
                        : 'border-slate-100 hover:bg-slate-50/50 text-slate-600'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${activeMode === m.id ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm">{m.label}</div>
                      <div className="text-xs text-slate-400 font-semibold">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Main Animation Stage */}
      <div className="relative bg-slate-950 rounded-[36px] min-h-[520px] overflow-hidden flex flex-col items-center justify-center p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15),transparent)]" />
        
        {/* A: Standard Game Show Shuffling Loader */}
        {isDrawing && (
          <div className="text-center space-y-6 z-10">
            <motion.div 
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 0.95, 1] }}
              transition={{ repeat: Infinity, duration: 0.35 }}
              className="w-48 h-64 mx-auto rounded-[24px] bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 p-[3px] shadow-[0_0_50px_rgba(124,58,237,0.4)] flex items-center justify-center text-white"
            >
              <div className="w-full h-full rounded-[21px] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
                <Sparkles className="w-10 h-10 text-pink-500 animate-bounce mb-4" />
                <div className="font-black text-xl text-center truncate w-full">
                  {pool[shuffleIndex]?.name}
                </div>
                <div className="text-xs text-slate-400 font-bold uppercase mt-2">
                  {pool[shuffleIndex]?.rollNumber}
                </div>
              </div>
            </motion.div>
            <div className="text-white text-2xl font-black uppercase tracking-widest animate-pulse">
              🎰 SHUFFLING REGISTER... 🎰
            </div>
          </div>
        )}

        {/* Unified Reveal Stage showing EXACTLY N mystery cards in responsive grids */}
        {!isDrawing && cardsDeck.length > 0 && (
          <div className="flex flex-col items-center gap-8 z-10 w-full max-w-6xl py-6">
            
            {/* Control bar */}
            <div className="flex justify-between items-center w-full px-4 text-white">
              <span className="text-xs font-black uppercase tracking-wider bg-violet-950/50 px-4 py-2 rounded-full border border-violet-900/50">
                🎉 Drawn {cardsDeck.length} Student {cardsDeck.length > 1 ? 'Cards' : 'Card'} 🎉
              </span>
              
              <div className="flex gap-2">
                <button 
                  onClick={flipAllCards}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Flip All</span>
                </button>
                
                <button 
                  onClick={() => setCardsDeck([])}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Clear Stage
                </button>
              </div>
            </div>

            {/* Grid layout containing EXACTLY N dynamic cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full justify-center px-4">
              {cardsDeck.map((card, idx) => {
                const isFlipped = card.isFlipped;
                return (
                  <div 
                    key={card.id}
                    onClick={() => flipCard(card.id)}
                    className="relative w-48 h-72 cursor-pointer [perspective:1000px] select-none"
                  >
                    <motion.div 
                      layout
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 13 }}
                      className="w-full h-full relative [transform-style:preserve-3d] rounded-[24px] shadow-xl"
                    >
                      {/* CARD FRONT (Face down mystery card) */}
                      <div className="absolute inset-0 w-full h-full rounded-[24px] bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 flex flex-col items-center justify-center p-4 [backface-visibility:hidden]">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center animate-pulse">
                          <HelpCircle className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className="mt-4 text-xs font-black text-indigo-300 uppercase tracking-widest">Card {idx + 1}</span>
                      </div>

                      {/* CARD BACK (Revealed Character Card containing complete info & score actions) */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-[24px] p-[2.5px] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                        style={{ background: card.gradient }}
                      >
                        <div className="w-full h-full rounded-[22px] bg-slate-950/90 backdrop-blur-md p-4 text-white flex flex-col justify-between">
                          
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-white/50">
                            <span>REVEALED</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded">CLASSROOM RULER</span>
                          </div>

                          <div className="flex flex-col items-center text-center space-y-2 mt-2">
                            <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center font-bold text-white text-lg">
                              {card.student.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-black tracking-tight leading-tight truncate w-36">
                                {card.student.name}
                              </h4>
                              <span className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase block mt-0.5">
                                {card.student.rollNumber}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 py-1.5 border-t border-b border-white/10 text-center text-[10px] font-semibold text-white/70">
                            <div>
                              <span className="block text-[7px] font-black text-white/40 uppercase">Dept</span>
                              <span className="truncate block max-w-[70px] mx-auto">{card.student.department}</span>
                            </div>
                            <div>
                              <span className="block text-[7px] font-black text-white/40 uppercase">Section</span>
                              <span>Class {card.student.section}</span>
                            </div>
                          </div>

                          {/* MVP point awarding block */}
                          <div className="space-y-1">
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { v: 5, label: '+5', color: 'bg-amber-500' },
                                { v: 3, label: '+3', color: 'bg-violet-500' },
                                { v: 1, label: '+1', color: 'bg-cyan-500' },
                              ].map((btn) => (
                                <button
                                  key={btn.v}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playSound.click(settings.soundEnabled);
                                    updatePoints(card.student.id, btn.v);
                                    playSound.sparkle(settings.soundEnabled);
                                    confetti({ particleCount: 15, spread: 30 });
                                  }}
                                  className={`${btn.color} hover:opacity-90 text-white font-extrabold text-[8px] py-1 rounded shadow-md active:scale-95 transition-transform`}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>

                    </motion.div>
                  </div>
                );
              })}
            </div>
            
          </div>
        )}

        {/* Empty state when no draws yet */}
        {!isDrawing && cardsDeck.length === 0 && (
          <div className="text-center space-y-4 max-w-sm z-10 animate-in fade-in">
            <div className="text-6xl animate-bounce">🎟</div>
            <h3 className="text-2xl font-black text-white">Cinematic Reveal Stage</h3>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">
              Select quantity and click draw above. Mystery cards will slide onto the stage!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
