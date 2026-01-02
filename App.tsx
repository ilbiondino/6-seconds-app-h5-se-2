
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, BiologyTheme, Question, Score } from './types';
import { fetchQuestions } from './services/geminiService';
import { Timer } from './components/Timer';
import { 
  Dna, 
  Beaker, 
  Leaf, 
  GitBranch, 
  Trophy, 
  Play, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Home
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedTheme, setSelectedTheme] = useState<BiologyTheme | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBuzzer = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime); // Low frequency for buzzer feel
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const startGame = () => setGameState('THEME_SELECTION');

  const selectTheme = async (theme: BiologyTheme) => {
    setSelectedTheme(theme);
    setIsLoading(true);
    const fetched = await fetchQuestions(theme);
    setQuestions(fetched);
    setIsLoading(false);
    setGameState('READY');
  };

  const startRound = () => {
    setGameState('PLAYING');
  };

  const handleTimerEnd = () => {
    playBuzzer();
    setGameState('RESULT');
  };

  const submitResult = (success: boolean) => {
    setScore(prev => ({
      correct: prev.correct + (success ? 1 : 0),
      total: prev.total + 1
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setGameState('READY');
    } else {
      setGameState('SUMMARY');
    }
  };

  const resetGame = () => {
    setGameState('START');
    setSelectedTheme(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore({ correct: 0, total: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-slate-900 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <Dna className="absolute -top-10 -left-10 w-64 h-64 rotate-45 text-blue-500" />
        <Leaf className="absolute top-1/2 -right-20 w-80 h-80 -rotate-12 text-green-500" />
        <Beaker className="absolute -bottom-20 left-1/4 w-72 h-72 text-purple-500" />
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl">
        
        {/* Back to Start Button */}
        {gameState !== 'START' && (
          <button 
            onClick={resetGame}
            className="absolute top-6 left-6 p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-700/50 rounded-full transition-all flex items-center space-x-2 group z-50"
            title="Terug naar start"
          >
            <Home size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        )}

        {gameState === 'START' && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <h1 className="text-5xl md:text-7xl font-game text-yellow-400 drop-shadow-lg leading-tight">
              6 SECONDEN<br/><span className="text-blue-400">BIOLOGIE</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl">
              Kun jij 3 antwoorden geven in 6 seconden? <br/>
              Gebaseerd op <b>Biologie voor jou MAX</b>.
            </p>
            <button 
              onClick={startGame}
              className="group relative flex items-center justify-center space-x-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-4 px-10 rounded-2xl text-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
            >
              <Play className="fill-current" />
              <span>START HET SPEL</span>
            </button>
          </div>
        )}

        {gameState === 'THEME_SELECTION' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-game text-center text-white mb-8 mt-4 md:mt-0">KIES EEN THEMA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ThemeButton 
                theme={BiologyTheme.INLEIDING} 
                icon={<Beaker className="text-purple-400" />} 
                onClick={() => selectTheme(BiologyTheme.INLEIDING)} 
              />
              <ThemeButton 
                theme={BiologyTheme.ERFELIJKHEID} 
                icon={<GitBranch className="text-green-400" />} 
                onClick={() => selectTheme(BiologyTheme.ERFELIJKHEID)} 
              />
              <ThemeButton 
                theme={BiologyTheme.STOFWISSELING} 
                icon={<Leaf className="text-yellow-400" />} 
                onClick={() => selectTheme(BiologyTheme.STOFWISSELING)} 
              />
              <ThemeButton 
                theme={BiologyTheme.DNA} 
                icon={<Dna className="text-blue-400" />} 
                onClick={() => selectTheme(BiologyTheme.DNA)} 
              />
            </div>
          </div>
        )}

        {gameState === 'READY' && (
          <div className="text-center space-y-10 py-10 animate-in fade-in duration-300">
            <div className="space-y-4">
              <p className="text-slate-400 font-semibold tracking-widest uppercase">Vraag {currentQuestionIndex + 1} van {questions.length}</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-2xl text-slate-500 italic">Vraag verschijnt na de klik...</span>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <button 
                onClick={startRound}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black py-6 px-12 rounded-full text-4xl shadow-xl transition-all transform hover:scale-110 active:scale-95 flex items-center space-x-4 border-4 border-blue-400"
              >
                <span>IK BEN ER KLAAR VOOR!</span>
                <ArrowRight size={40} />
              </button>
              <p className="text-slate-500 text-sm">Zodra je drukt begint de 6 seconden timer.</p>
            </div>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="text-center space-y-10 py-10">
            <h3 className="text-4xl font-game text-white drop-shadow-md px-4 leading-normal">
              {questions[currentQuestionIndex].content}
            </h3>
            <Timer duration={6} onEnd={handleTimerEnd} />
            <div className="animate-pulse text-red-400 font-bold text-xl">ROEP DE ANTWOORDEN NU!</div>
          </div>
        )}

        {gameState === 'RESULT' && (
          <div className="text-center space-y-10 py-10 animate-in zoom-in duration-300">
            <h3 className="text-2xl text-slate-400 font-semibold uppercase tracking-widest">Tijd is om!</h3>
            <div className="space-y-4">
              <p className="text-3xl text-white font-medium italic">Heb je 3 correcte antwoorden kunnen geven?</p>
              <div className="flex justify-center space-x-6">
                <button 
                  onClick={() => submitResult(true)}
                  className="bg-green-600 hover:bg-green-500 text-white p-6 rounded-2xl flex flex-col items-center space-y-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/40 w-36"
                >
                  <CheckCircle size={48} />
                  <span className="font-bold">JA!</span>
                </button>
                <button 
                  onClick={() => submitResult(false)}
                  className="bg-red-600 hover:bg-red-500 text-white p-6 rounded-2xl flex flex-col items-center space-y-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/40 w-36"
                >
                  <XCircle size={48} />
                  <span className="font-bold">NEE...</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'SUMMARY' && (
          <div className="text-center space-y-8 py-6 animate-in slide-in-from-bottom-8 duration-700">
            <Trophy className="mx-auto text-yellow-400 w-24 h-24 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <div className="space-y-2">
              <h2 className="text-4xl font-game text-white">GEFELICITEERD!</h2>
              <p className="text-slate-400 text-xl">Je hebt de ronde over <br/> <span className="text-blue-400 font-bold">{selectedTheme}</span> voltooid.</p>
            </div>
            
            <div className="bg-slate-700/50 p-6 rounded-2xl border border-slate-600">
              <div className="text-6xl font-black text-yellow-400 mb-2">
                {score.correct} / {score.total}
              </div>
              <p className="text-slate-300 font-semibold">Correcte antwoorden</p>
            </div>

            <button 
              onClick={resetGame}
              className="flex items-center justify-center space-x-2 mx-auto bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-8 rounded-xl transition-all hover:scale-105"
            >
              <RotateCcw size={20} />
              <span>OPNIEUW SPELEN</span>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 rounded-3xl">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-bold text-xl animate-pulse">Vragen laden via Gemini AI...</p>
          </div>
        )}
      </div>

      {/* Footer / Instructions */}
      <div className="mt-8 text-slate-500 text-sm flex items-center space-x-4 max-w-lg text-center">
        <p>Tip: Speel dit met een klasgenoot als scheidsrechter. De Gemini AI genereert elke keer nieuwe vragen!</p>
      </div>
    </div>
  );
};

interface ThemeButtonProps {
  theme: BiologyTheme;
  icon: React.ReactNode;
  onClick: () => void;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({ theme, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center p-4 bg-slate-700/30 hover:bg-slate-700/80 border border-slate-600 rounded-2xl transition-all transform hover:-translate-y-1 text-left space-x-4 group"
  >
    <div className="bg-slate-800 p-3 rounded-xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-slate-100 font-bold text-sm md:text-base leading-snug">{theme}</span>
  </button>
);

export default App;
