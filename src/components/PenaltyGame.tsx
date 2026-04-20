import React, { useState } from 'react';

type Direction = 'LEFT' | 'CENTER' | 'RIGHT';
type GameState = 'IDLE' | 'SHOOTING' | 'RESULT';

export default function PenaltyGame() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;
  const [message, setMessage] = useState('HAZ CLIC EN LA PORTERÍA PARA CHUTAR');
  
  const [ballPos, setBallPos] = useState({ x: 50, y: 85 }); // percentages
  const [gkPos, setGkPos] = useState({ x: 50, y: 53 });

  const handleShoot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'IDLE' || attempts >= maxAttempts) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Only allow shooting towards the top half roughly (goal area)
    if (y > 75) return;

    setGameState('SHOOTING');
    
    let shotDir: Direction = 'CENTER';
    if (x < 42) shotDir = 'LEFT';
    if (x > 58) shotDir = 'RIGHT';

    const dives: Direction[] = ['LEFT', 'CENTER', 'RIGHT'];
    // Weighted random to make it slightly fair
    const chosenDive = dives[Math.floor(Math.random() * dives.length)];

    setBallPos({ x, y });
    
    if (chosenDive === 'LEFT') setGkPos({ x: 25, y: 55 });
    else if (chosenDive === 'RIGHT') setGkPos({ x: 75, y: 55 });
    else setGkPos({ x: 50, y: 53 });

    setTimeout(() => {
       const isSave = shotDir === chosenDive;
       if (isSave) {
          setMessage('¡PARADA! 🧤');
       } else {
          setMessage('¡GOLAZO! ⚽');
          setScore(s => s + 1);
       }
       setAttempts(a => a + 1);
       setGameState('RESULT');
       
       setTimeout(() => {
          if (attempts + 1 < maxAttempts) {
             resetPositions();
             setMessage('CHUTA DE NUEVO...');
             setGameState('IDLE');
          } else {
             setMessage(`¡PARTIDO TERMINADO! Puntos: ${score + (isSave ? 0 : 1)}/${maxAttempts}`);
          }
       }, 2000);
    }, 400); // Ball travel time
  };

  const resetPositions = () => {
    setBallPos({ x: 50, y: 85 });
    setGkPos({ x: 50, y: 53 });
  };

  const handleRestart = () => {
     setScore(0);
     setAttempts(0);
     resetPositions();
     setMessage('HAZ CLIC EN LA PORTERÍA PARA CHUTAR');
     setGameState('IDLE');
  }

  return (
    <div className="w-full h-full bg-[#3E802A] relative overflow-hidden select-none font-sans cursor-crosshair" onClick={handleShoot}>
       {/* Stadium Background */}
       <div className="absolute top-0 w-full h-[35%] bg-[#0B203B] flex overflow-hidden">
          <div className="w-full h-full opacity-30 absolute" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '15px 15px' }} />
          {/* Stadium Lights */}
          <div className="absolute top-2 left-10 w-20 h-10 bg-white opacity-20 rounded-full blur-[20px]" />
          <div className="absolute top-2 right-10 w-20 h-10 bg-white opacity-20 rounded-full blur-[20px]" />
       </div>
       
       {/* Grass Patches */}
       <div className="absolute bottom-0 w-full h-[65%] flex flex-col z-0">
          <div className="flex-1 bg-[#4A9636] border-t-4 border-white opacity-90"></div>
          <div className="flex-1 bg-[#3E802A]"></div>
          <div className="flex-1 bg-[#4A9636]"></div>
          <div className="flex-1 bg-[#3E802A]"></div>
          <div className="flex-1 bg-[#4A9636]"></div>
          {/* Penalty spot */}
          <div className="absolute w-4 h-4 bg-white rounded-full left-1/2 bottom-[20%] transform -translate-x-1/2"></div>
       </div>

       {/* Score UI */}
       <div className="absolute top-2 right-2 bg-[#1C1C1C] text-white px-3 py-1 border-2 border-gray-400 rounded shadow-md text-xs sm:text-sm font-bold z-10 flex flex-col items-end">
          <div>PUNTUACIÓN: {score}</div>
          <div>TENTATIVAS: {attempts}/{maxAttempts}</div>
       </div>

       {/* Goal */}
       <div 
         className="absolute top-[10%] left-[10%] w-[80%] h-[45%] border-t-[8px] border-l-[8px] border-r-[8px] border-[#E0E0E0] shadow-2xl z-10 flex items-center justify-center overflow-hidden"
       >
          <div className="w-full h-full opacity-40 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(to right, white 2px, transparent 2px), linear-gradient(to bottom, white 2px, transparent 2px)', backgroundSize: '15px 15px' }} />
       </div>

       {/* Goalkeeper */}
       <div 
         className="absolute w-20 h-24 transition-all duration-300 ease-out z-20 flex flex-col items-center justify-center font-bold text-5xl sm:text-6xl drop-shadow-2xl"
         style={{ left: `${gkPos.x}%`, top: `${gkPos.y}%`, transform: 'translate(-50%, -50%)' }}
       >
         🧤
       </div>

       {/* Player Area */}
       <div className="absolute bottom-[5%] right-[30%] flex items-end drop-shadow-xl z-20">
          <div className="text-4xl sm:text-5xl scale-x-[-1]">🏃</div>
       </div>

       {/* Ball */}
       <div 
         className="absolute w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full transition-all duration-400 ease-in-out z-30 flex items-center justify-center drop-shadow-[0_15px_10px_rgba(0,0,0,0.6)] border-2 border-gray-800"
         style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, transform: 'translate(-50%, -50%) scale(1)' }}
       >
         <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black rounded-full shadow-inner" />
       </div>

       {/* Message */}
       <div className="absolute bottom-[25%] w-full flex justify-center z-30 pointer-events-none">
         <div className="bg-black/80 text-white px-5 py-2 rounded-lg border border-gray-600 font-bold tracking-wider drop-shadow-xl border-l-[6px] border-l-blue-500 text-sm sm:text-base text-center">
            {message}
         </div>
       </div>

       {attempts >= maxAttempts && gameState === 'RESULT' && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleRestart(); }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black px-8 py-4 font-extrabold rounded-lg shadow-2xl border-4 border-yellow-600 z-40 hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all text-xl sm:text-2xl cursor-pointer"
          >
            VOLVER A JUGAR
          </button>
       )}
    </div>
  );
}
