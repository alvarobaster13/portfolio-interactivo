import React, { useState, useEffect, useCallback } from 'react';

type Direction = 'LEFT' | 'CENTER' | 'RIGHT';
type GameState = 'IDLE' | 'SHOOTING' | 'RESULT';
type GameMode = 'STRIKER' | 'GOALKEEPER';

export default function PenaltyGame() {
  const [gameMode, setGameMode] = useState<GameMode>('STRIKER');
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;
  const [message, setMessage] = useState('HAZ CLIC PARA CHUTAR');
  
  const [ballPos, setBallPos] = useState({ x: 50, y: 85 }); // percentages
  const [gkPos, setGkPos] = useState({ x: 50, y: 53 });

  // Update instructions when mode changes
  useEffect(() => {
     if (gameMode === 'STRIKER') {
        setMessage('HAZ CLIC EN LA PORTERÍA PARA CHUTAR');
     } else {
        setMessage('USA EL RATÓN PARA MOVER AL PORTERO');
        setGkPos({ x: 50, y: 53 });
     }
  }, [gameMode]);

  const handleShoot = useCallback((x: number, y: number) => {
    if (gameState !== 'IDLE' || attempts >= maxAttempts) return;

    setGameState('SHOOTING');
    
    let shotDir: Direction = 'CENTER';
    if (x < 42) shotDir = 'LEFT';
    if (x > 58) shotDir = 'RIGHT';

    setBallPos({ x, y });
    
    // Goal frame: left 10%, right 90%, top 10%, bottom 55%
    const isInsideGoal = x >= 10 && x <= 90 && y >= 10 && y <= 55;

    // In Striker mode, the CPU goalkeeper dives
    if (gameMode === 'STRIKER') {
        const dives: Direction[] = ['LEFT', 'CENTER', 'RIGHT'];
        const chosenDive = dives[Math.floor(Math.random() * dives.length)];
        
        if (chosenDive === 'LEFT') setGkPos({ x: 25, y: 55 });
        else if (chosenDive === 'RIGHT') setGkPos({ x: 75, y: 55 });
        else setGkPos({ x: 50, y: 53 });

        setTimeout(() => {
           if (!isInsideGoal) {
              setMessage('¡FUERA! ❌');
           } else {
              const isSave = shotDir === chosenDive;
              if (isSave) {
                 setMessage('¡PARADA! 🧤');
              } else {
                 setMessage('¡GOLAZO! ⚽');
                 setScore(s => s + 1);
              }
           }
           finishTurn();
        }, 400);
    } else {
        // In Goalkeeper mode, user controls GK with mouse (handled in onMouseMove)
        // We just wait for the ball to arrive and check collision
        setTimeout(() => {
            // Check collision with GK
            // GK is at gkPos.x (user controlled)
            const ballX = x;
            const gkX = gkPos.x;
            
            // Interaction range for save
            const isSave = Math.abs(ballX - gkX) < 12 && isInsideGoal;

            if (!isInsideGoal) {
               setMessage('¡FUERA! ❌');
            } else if (isSave) {
               setMessage('¡BUENA PARADA! 🧤');
               setScore(s => s + 1);
            } else {
               setMessage('¡GOL EN CONTRA! ⚽');
            }
            finishTurn();
        }, 400);
    }
  }, [gameState, attempts, maxAttempts, gameMode, gkPos.x, score]);

  const finishTurn = () => {
    setAttempts(a => a + 1);
    setGameState('RESULT');
    
    setTimeout(() => {
       if (attempts + 1 < maxAttempts) {
          resetPositions();
          setGameState('IDLE');
          setMessage(gameMode === 'STRIKER' ? 'CHUTA DE NUEVO...' : '¡PREPÁRATE!');
       } else {
          setMessage(`¡PARTIDO TERMINADO! ${gameMode === 'STRIKER' ? 'Goles' : 'Paradas'}: ${score}/${maxAttempts}`);
       }
    }, 2000);
  };

  const resetPositions = () => {
    setBallPos({ x: 50, y: 85 });
    if (gameMode === 'STRIKER') setGkPos({ x: 50, y: 53 });
  };

  const handleRestart = () => {
     setScore(0);
     setAttempts(0);
     resetPositions();
     setGameState('IDLE');
  };

  // CPU Shoots in Goalkeeper mode
  useEffect(() => {
    if (gameMode === 'GOALKEEPER' && gameState === 'IDLE' && attempts < maxAttempts) {
       const timer = setTimeout(() => {
          // Shoot at random position mostly inside goal but sometimes outside
          const shotX = 15 + Math.random() * 70;
          const shotY = 15 + Math.random() * 35;
          handleShoot(shotX, shotY);
       }, 1500);
       return () => clearTimeout(timer);
    }
  }, [gameMode, gameState, attempts, handleShoot]);

  const onMouseMove = (e: React.MouseEvent) => {
     if (gameMode === 'GOALKEEPER') {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        // Constrain GK horizontal movement
        const constrainedX = Math.max(15, Math.min(85, x));
        setGkPos(prev => ({ ...prev, x: constrainedX }));
     }
  };

  const onCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
     if (gameMode === 'STRIKER') {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        if (y < 75) handleShoot(x, y);
     }
  };

  return (
    <div 
      className="w-full h-full bg-[#3E802A] relative overflow-hidden select-none font-sans cursor-crosshair" 
      onClick={onCanvasClick}
      onMouseMove={onMouseMove}
    >
       {/* Stadium Background */}
       <div className="absolute top-0 w-full h-[35%] bg-[#0B203B] flex overflow-hidden">
          <div className="w-full h-full opacity-30 absolute" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '15px 15px' }} />
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
          <div className="absolute w-4 h-4 bg-white rounded-full left-1/2 bottom-[20%] transform -translate-x-1/2"></div>
       </div>

       {/* Mode Switcher */}
       <div className="absolute top-2 left-2 z-40 flex gap-1">
          <button 
            className={`px-2 py-1 text-[10px] sm:text-xs font-bold border-2 transition-colors ${gameMode === 'STRIKER' ? 'bg-yellow-400 border-yellow-600 text-black' : 'bg-gray-800 border-gray-600 text-white opacity-60'}`}
            onClick={(e) => { e.stopPropagation(); setGameMode('STRIKER'); handleRestart(); }}
          >
            DELANTERO
          </button>
          <button 
            className={`px-2 py-1 text-[10px] sm:text-xs font-bold border-2 transition-colors ${gameMode === 'GOALKEEPER' ? 'bg-yellow-400 border-yellow-600 text-black' : 'bg-gray-800 border-gray-600 text-white opacity-60'}`}
            onClick={(e) => { e.stopPropagation(); setGameMode('GOALKEEPER'); handleRestart(); }}
          >
            PORTERO
          </button>
       </div>

       {/* Score UI */}
       <div className="absolute top-2 right-2 bg-[#1C1C1C] text-white px-3 py-1 border-2 border-gray-400 rounded shadow-md text-xs sm:text-sm font-bold z-10 flex flex-col items-end">
          <div>{gameMode === 'STRIKER' ? 'GOLES' : 'PARADAS'}: {score}</div>
          <div>TENTATIVAS: {attempts}/{maxAttempts}</div>
       </div>

       {/* Goal */}
       <div className="absolute top-[10%] left-[10%] w-[80%] h-[45%] border-t-[8px] border-l-[8px] border-r-[8px] border-[#E0E0E0] shadow-2xl z-10 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full opacity-40 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(to right, white 2px, transparent 2px), linear-gradient(to bottom, white 2px, transparent 2px)', backgroundSize: '15px 15px' }} />
       </div>

       {/* Goalkeeper */}
       <div 
         className="absolute w-20 h-24 transition-all duration-100 ease-out z-20 flex flex-col items-center justify-center font-bold text-5xl sm:text-6xl drop-shadow-2xl"
         style={{ left: `${gkPos.x}%`, top: `${gkPos.y}%`, transform: 'translate(-50%, -50%)' }}
       >
         🧤
       </div>

       {/* Player Area (Hide when being goalkeeper) */}
       {gameMode === 'STRIKER' && (
         <div className="absolute bottom-[5%] right-[30%] flex items-end drop-shadow-xl z-20">
            <div className="text-4xl sm:text-5xl scale-x-[-1]">🏃</div>
         </div>
       )}

       {/* Ball */}
       <div 
         className="absolute w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full transition-all duration-400 ease-in-out z-30 flex items-center justify-center drop-shadow-[0_15px_10px_rgba(0,0,0,0.6)] border-2 border-gray-800"
         style={{ 
           left: `${ballPos.x}%`, 
           top: `${ballPos.y}%`, 
           transform: `translate(-50%, -50%) scale(${0.6 + (ballPos.y / 100) * 0.4})` 
         }}
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
