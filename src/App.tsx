import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PenaltyGame from './components/PenaltyGame';

type Vector2 = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type MapId = 'EXTERIOR' | 'INTERIOR';
type Direction = 'up' | 'down' | 'left' | 'right';

const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 450;
const WALL_SIZE = 20;
const PLAYER_SPEED = 4;
const PLAYER_SIZE = 32;

interface InteractiveObject {
  id: string;
  type: 'dialog' | 'document' | 'door' | 'pc';
  label: string;
  rect: Rect;
  color: string;
  targetMap?: MapId;
  pages?: string[];
  docContent?: React.ReactNode;
}

const EXTERIOR_OBJECTS: InteractiveObject[] = [
  {
    id: 'felpudo',
    type: 'dialog',
    label: 'FELPUDO',
    rect: { x: ROOM_WIDTH / 2 - 40, y: ROOM_HEIGHT / 2 + 50, width: 80, height: 30 },
    color: '#8B4513',
    pages: [
      "¡Bienvenido al Portfolio OS de Álvaro Fernández!",
      "Rol: Full Stack Developer Junior.",
      "Misión: Crear soluciones digitales escalables y elegantes.",
      "Ubicación: Villaluenga de la Sagra (Toledo)."
    ]
  },
  {
    id: 'perro',
    type: 'dialog',
    label: 'PERRO',
    rect: { x: 150, y: ROOM_HEIGHT - 100, width: 48, height: 40 },
    color: '#FFFFFF',
    pages: ['¡Guau! ¡Guau!', '¡Hola Álvaro! ¿Damos una vuelta por el patio?']
  },
  {
    id: 'puerta_entrada',
    type: 'door',
    targetMap: 'INTERIOR',
    label: 'PUERTA',
    rect: { x: ROOM_WIDTH / 2 - 40, y: ROOM_HEIGHT / 2 - 10, width: 80, height: 60 },
    color: '#5C3A21'
  }
];

const INTERIOR_OBJECTS: InteractiveObject[] = [
  {
    id: 'puerta_salida',
    type: 'door',
    targetMap: 'EXTERIOR',
    label: 'SALIDA',
    rect: { x: ROOM_WIDTH / 2 - 40, y: ROOM_HEIGHT - 30, width: 80, height: 30 },
    color: '#3d2616'
  },
  {
    id: 'escritorio',
    type: 'document',
    label: 'ESCRITORIO',
    rect: { x: 120, y: 80, width: 120, height: 70 },
    color: '#A67C52',
    docContent: (
      <div className="space-y-4 font-sans text-[#1a1a1a]">
        <h2 className="text-3xl font-bold border-b-2 border-slate-300 pb-2">SOBRE MÍ</h2>
        <p><strong>Perfil:</strong> Tecnológico junior enfocado en desarrollo e IA para optimización de tareas.</p>
        <p><strong>Objetivo:</strong> Evolucionar hacia perfiles especializados en desarrollo Full Stack e IA.</p>
        <p><strong>Actitud:</strong> Proactiva, aprendizaje continuo y adaptación tecnológica.</p>
      </div>
    )
  },
  {
    id: 'pc_os',
    type: 'pc',
    label: 'PC',
    rect: { x: 185, y: 70, width: 38, height: 40 },
    color: '#000'
  },
  {
    id: 'perchero',
    type: 'document',
    label: 'PERCHERO',
    rect: { x: 700, y: 80, width: 40, height: 40 },
    color: '#8B4513',
    docContent: (
      <div className="space-y-4 font-sans text-[#1a1a1a]">
        <h2 className="text-3xl font-bold border-b-2 border-slate-300 pb-2">EXPERIENCIA LABORAL</h2>
        <div>
          <h3 className="font-bold text-lg">1. Walkiria Apps (Desarrollador Web)</h3>
          <ul className="list-disc pl-5 text-sm"><li>WordPress, PHP, plugins y maquetación CSS.</li></ul>
        </div>
        <div>
          <h3 className="font-bold text-lg">2. Amazon MAD7 (Mozo de almacén)</h3>
          <ul className="list-disc pl-5 text-sm"><li>Herramientas digitales, productividad y optimización operativa.</li></ul>
        </div>
      </div>
    )
  },
  {
    id: 'estanteria',
    type: 'document',
    label: 'ESTANTERÍA',
    rect: { x: 100, y: 250, width: 60, height: 100 },
    color: '#5c3a21',
    docContent: (
      <div className="space-y-4 font-sans text-[#1a1a1a]">
        <h2 className="text-3xl font-bold border-b-2 border-slate-300 pb-2">FORMACIÓN ACADÉMICA</h2>
        <div>
          <h3 className="font-bold">[CURSO] Formación Superior en IA aplicada a la empresa</h3>
          <p className="italic text-gray-700 text-sm">[CENTRO] FEDETO + Universidad de Nebrija (27 ECTS)</p>
          <ul className="list-disc pl-5 mt-1 text-sm">
            <li>Modelos de lenguaje (LLMs), automatización y asistentes virtuales.</li>
            <li>Herramientas low-code/no-code.</li>
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="font-bold">[GRADO] Técnico Superior en Desarrollo de Aplicaciones Web</h3>
          <p className="italic text-gray-700 text-sm">[CENTRO] IES Julio Verne (2023-2025)</p>
          <ul className="list-disc pl-5 mt-1 text-sm">
            <li>HTML, CSS, JavaScript, PHP.</li>
            <li>Gestión de bases de datos y lógica de programación.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'television',
    type: 'document',
    label: 'TELEVISIÓN',
    rect: { x: 380, y: 50, width: 80, height: 60 },
    color: '#303030',
    docContent: (
      <div className="flex flex-col items-center h-full text-black justify-center">
        <div className="relative w-full rounded-lg overflow-hidden border-4 border-[#0A66C2] shadow-2xl bg-white flex flex-col font-sans">
          <div className="w-full h-24 bg-gradient-to-tr from-[#004182] to-[#0A66C2] relative flex items-center justify-center overflow-hidden">
             <div className="absolute opacity-20 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '15px 15px' }}></div>
          </div>
          <div className="px-6 pb-6 relative flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white -mt-12 shadow-md flex items-center justify-center overflow-hidden z-10">
               <span className="text-4xl font-bold text-[#0A66C2] tracking-tighter">ÁF</span>
            </div>
            <h3 className="text-2xl font-bold mt-2 text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>Álvaro Fernández</h3>
            <p className="text-sm font-medium text-gray-800 mt-1">Full Stack Developer Junior & AI Specialist</p>
            <p className="text-xs text-gray-500 mt-1">Villaluenga de la Sagra (España)</p>
            
            <a 
              href="https://www.linkedin.com/in/áfc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 bg-[#0A66C2] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#004182] transition-colors shadow-md w-full max-w-[200px]"
            >
              Ver perfil en LinkedIn
            </a>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2">
           <div className="h-px w-12 bg-black/20" />
           <p className="text-center text-sm font-sans italic opacity-60">
              "Bajo el mismo cielo, escribiendo el futuro<br/>una línea de código a la vez."
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'nevera',
    type: 'dialog',
    label: 'NEVERA',
    rect: { x: 600, y: 80, width: 50, height: 80 },
    color: '#E8E8E8',
    pages: ['[NEVERA] Red Bull, Monster y una manzana triste.'],
    docContent: (
      <div className="space-y-4 font-sans text-[#1a1a1a]">
        <h2 className="text-3xl font-bold border-b-2 border-slate-300 pb-2">APTITUDES FRESH ❄️</h2>
        <div className="grid grid-cols-2 gap-2 text-sm font-bold bg-blue-50 p-4 rounded-lg border-2 border-blue-200 shadow-inner">
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>HTML</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>CSS</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>JS</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>PHP</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>SQL</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>NodeJS</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Symfony</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>WordPress</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600"></div>IA/LLMs</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600"></div>Low-Code</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div>CMS</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div>English</div>
        </div>
        <div className="mt-4 bg-yellow-100 p-2 rounded border border-yellow-300 font-bold text-center text-sm shadow">
           🚗 Carnet de conducir (B)
        </div>
        <p className="text-center text-xs text-gray-500 italic mt-4 opacity-70">"Mejor cerrar antes de que se escape el frío."</p>
      </div>
    )
  }
];

const DESKTOP_APPS = [
  { id: 'pc', name: 'Mi PC', type: 'pc', x: 20, y: 20 },
  { id: 'trash', name: 'Papelera', type: 'trash', x: 20, y: 100 },
  { id: 'penalties', name: 'Penaltis', type: 'net', x: 20, y: 180 },
  { id: 'cv', name: 'Mi CV', type: 'cv', x: 100, y: 20 },
  { id: 'logulia', name: 'Logulia', type: 'net', x: 100, y: 100 },
  { id: 'readme_log', name: 'Leeme', type: 'text', x: 180, y: 100 },
  { id: 'zaprado', name: 'Zaprado', type: 'net', x: 100, y: 180 },
  { id: 'readme_zap', name: 'Leeme', type: 'text', x: 180, y: 180 },
  { id: 'gestor', name: 'Gestor.Inc', type: 'net', x: 100, y: 260 },
  { id: 'readme_gest', name: 'Leeme', type: 'text', x: 180, y: 260 }
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // States
  const [currentMap, setCurrentMap] = useState<MapId>('EXTERIOR');
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  // Interaction states
  const [interactionTarget, setInteractionTarget] = useState<InteractiveObject | null>(null);
  const [activeDialog, setActiveDialog] = useState<{ obj: InteractiveObject, page: number } | null>(null);
  const [activeDocument, setActiveDocument] = useState<InteractiveObject | null>(null);
  const [isViewingPC, setIsViewingPC] = useState(false);
  const [openedApp, setOpenedApp] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dismissedRotate, setDismissedRotate] = useState(false);
  const [interactedIds, setInteractedIds] = useState<string[]>([]);

  const lastMapChange = useRef(0);
  const mousePos = useRef<Vector2>({ x: 0, y: 0 });
  const osStateRef = useRef({ startMenuOpen: false });

  // References for render loop (avoids stale closures)
  const playerPos = useRef<Vector2>({ x: ROOM_WIDTH / 2, y: ROOM_HEIGHT - 60 });
  const playerDir = useRef<Direction>('up');
  const stateRef = useRef({ currentMap, activeDialog, activeDocument, isViewingPC, openedApp, interactedIds, interactionTarget });

  useEffect(() => {
    stateRef.current = { currentMap, activeDialog, activeDocument, isViewingPC, openedApp, interactedIds, interactionTarget };
  }, [currentMap, activeDialog, activeDocument, isViewingPC, openedApp, interactedIds, interactionTarget]);

  const lastActionTime = useRef(0);
  const handleActionKey = (key: string) => {
    // Cooldown to prevent double-triggering (especially on mobile buttons)
    const now = Date.now();
    if (now - lastActionTime.current < 150) return;
    lastActionTime.current = now;

    const { currentMap: map, activeDialog: dialog, activeDocument: doc, isViewingPC: pc, openedApp: app, interactionTarget: target } = stateRef.current;
    
    // Handle escape key globally
    if (key === 'escape') {
       if (app) {
          setOpenedApp(null);
          setIsMaximized(false);
       }
       else if (doc) setActiveDocument(null);
       else if (pc) setIsViewingPC(false);
       return;
    }

    // Trigger interaction logic strictly on 'KeyE' press
    if (key === 'keye') {
      // If PC open, exit
      if (pc) {
        setIsViewingPC(false);
        return;
      }

      // If Document open, close it
      if (doc) {
        setActiveDocument(null);
        return;
      }

      // If Dialog open, turn page or close
      if (dialog) {
        const nextPage = dialog.page + 1;
        if (dialog.obj.pages && nextPage < dialog.obj.pages.length) {
           setActiveDialog({ obj: dialog.obj, page: nextPage });
        } else {
           // Close Dialog
           setActiveDialog(null);
           // If this dialog object also has docContent (like the fridge), open it immediately
           if (dialog.obj.docContent) {
              setActiveDocument(dialog.obj);
           }
        }
        return;
      }

      // Check if there is an interaction target nearby
      if (target) {
        if (target.type === 'door' && Date.now() - lastMapChange.current < 800) {
           return; // Cooldown to prevent looping doors on mobile
        }

        if (!stateRef.current.interactedIds.includes(target.id)) {
           setInteractedIds(prev => [...prev, target.id]);
        }
        if (target.type === 'door' && target.targetMap) {
          const nextMap = target.targetMap;
          lastMapChange.current = Date.now();
          setCurrentMap(nextMap);
          // reset position when map changes based on which room
          if (nextMap === 'INTERIOR') {
             playerPos.current = { x: ROOM_WIDTH / 2 - 16, y: ROOM_HEIGHT - 80 };
             playerDir.current = 'up';
          } else {
             playerPos.current = { x: ROOM_WIDTH / 2 - 16, y: ROOM_HEIGHT / 2 + 10 };
             playerDir.current = 'down';
          }
        } else if (target.type === 'document') {
          setActiveDocument(target);
        } else if (target.type === 'dialog' && target.pages) {
          setActiveDialog({ obj: target, page: 0 });
        } else if (target.type === 'pc') {
          setIsViewingPC(true);
        }
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code.toLowerCase();
      keysRef.current[key] = true;
      handleActionKey(key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const checkCollision = (nextX: number, nextY: number, objects: InteractiveObject[]): boolean => {
      // Wall boundaries (except exterior has full boundaries)
      if (nextX < WALL_SIZE || nextX + PLAYER_SIZE > ROOM_WIDTH - WALL_SIZE) return true;
      if (nextY < WALL_SIZE || nextY + PLAYER_SIZE > ROOM_HEIGHT - WALL_SIZE) return true;

      const playerRect: Rect = { x: nextX, y: nextY, width: PLAYER_SIZE, height: PLAYER_SIZE };
      
      // House body collision in Exterior
      if (stateRef.current.currentMap === 'EXTERIOR') {
         const houseRect = { x: ROOM_WIDTH/2 - 120, y: ROOM_HEIGHT/2 - 120, width: 240, height: 150 };
         if (playerRect.x < houseRect.x + houseRect.width && playerRect.x + playerRect.width > houseRect.x &&
             playerRect.y < houseRect.y + houseRect.height && playerRect.y + playerRect.height > houseRect.y) {
                // only block if not touching the door directly in front
                const doorCollider = { x: ROOM_WIDTH / 2 - 40, y: ROOM_HEIGHT / 2 - 10, width: 80, height: 60 };
                if (!(playerRect.x < doorCollider.x + doorCollider.width && playerRect.x + playerRect.width > doorCollider.x &&
                      playerRect.y < doorCollider.y + doorCollider.height && playerRect.y + playerRect.height > doorCollider.y)) {
                   return true;
                }
         }
      }

      for (const obj of objects) {
         // allow walking over doormat or exit floor triggers
        if (obj.id === 'felpudo' || obj.id === 'puerta_entrada' || obj.id === 'puerta_salida') continue;

        if (
          playerRect.x < obj.rect.x + obj.rect.width &&
          playerRect.x + playerRect.width > obj.rect.x &&
          playerRect.y < obj.rect.y + obj.rect.height &&
          playerRect.y + playerRect.height > obj.rect.y
        ) {
          return true;
        }
      }
      return false;
    };

    const update = () => {
      const { activeDialog: dialog, activeDocument: doc, currentMap: map, isViewingPC: pc } = stateRef.current;
      const objects = map === 'EXTERIOR' ? EXTERIOR_OBJECTS : INTERIOR_OBJECTS;

      if (dialog || doc || pc) return; // Block movement if UI is open

      let nextX = playerPos.current.x;
      let nextY = playerPos.current.y;
      let isMoving = false;

      if (keysRef.current['keyw'] || keysRef.current['arrowup']) { nextY -= PLAYER_SPEED; playerDir.current = 'up'; isMoving = true; }
      else if (keysRef.current['keys'] || keysRef.current['arrowdown']) { nextY += PLAYER_SPEED; playerDir.current = 'down'; isMoving = true; }
      else if (keysRef.current['keya'] || keysRef.current['arrowleft']) { nextX -= PLAYER_SPEED; playerDir.current = 'left'; isMoving = true; }
      else if (keysRef.current['keyd'] || keysRef.current['arrowright']) { nextX += PLAYER_SPEED; playerDir.current = 'right'; isMoving = true; }

      if (isMoving) {
        if (!checkCollision(nextX, playerPos.current.y, objects)) playerPos.current.x = nextX;
        if (!checkCollision(playerPos.current.x, nextY, objects)) playerPos.current.y = nextY;
      }

      let foundTarget = null;
      let minDistance = Infinity;

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        
        let targetX = obj.rect.x + obj.rect.width / 2;
        let targetY = obj.rect.y + obj.rect.height / 2;
        let range = 60;

        // Custom interaction points to accurately split the desk zones
        if (obj.id === 'pc_os') {
           // PC is on the right, shift target to in front of the PC
           targetY += 40; 
           range = 65;    
        } else if (obj.id === 'escritorio') {
           // Papers are on the left, shift target to in front of the papers
           targetX -= 35; 
           targetY += 40; 
           range = 65;
        }

        const dist = Math.sqrt(
          Math.pow((playerPos.current.x + PLAYER_SIZE / 2) - targetX, 2) +
          Math.pow((playerPos.current.y + PLAYER_SIZE / 2) - targetY, 2)
        );
        
        // Select the *closest* valid interaction target
        if (dist < range && dist < minDistance) {
          foundTarget = obj;
          minDistance = dist;
        }
      }
      setInteractionTarget(foundTarget);
    };

    const drawExterior = (ctx: CanvasRenderingContext2D) => {
      // Grass Floor
      ctx.fillStyle = '#8CD8A7'; // Authentic light teal grass
      ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
      
      // Grass texture (tufts)
      ctx.fillStyle = '#65B880';
      for(let j=20; j<ROOM_HEIGHT; j+=40) {
         for(let i=20; i<ROOM_WIDTH; i+=40) {
             const offsetX = (j % 80 === 0) ? 20 : 0;
             // V-shaped grass tuft
             ctx.fillRect(i + offsetX, j, 4, 4);
             ctx.fillRect(i + offsetX + 8, j, 4, 4);
             ctx.fillRect(i + offsetX + 4, j + 4, 4, 4);
         }
      }

      // Draw exterior boundary trees (Pine style)
      const drawTree = (tx: number, ty: number) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(tx + 24, ty + 60, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Trunk
        ctx.fillStyle = '#4A3219';
        ctx.fillRect(tx + 20, ty + 50, 8, 12);
        // Leaves (3 tiers)
        ctx.fillStyle = '#2A673E'; // Bottom dark
        ctx.beginPath(); ctx.moveTo(tx + 24, ty + 20); ctx.lineTo(tx + 44, ty + 56); ctx.lineTo(tx + 4, ty + 56); ctx.fill();
        ctx.fillStyle = '#4BA555'; // Mid green
        ctx.beginPath(); ctx.moveTo(tx + 24, ty + 10); ctx.lineTo(tx + 40, ty + 40); ctx.lineTo(tx + 8, ty + 40); ctx.fill();
        ctx.fillStyle = '#89D960'; // Top bright
        ctx.beginPath(); ctx.moveTo(tx + 24, ty); ctx.lineTo(tx + 36, ty + 24); ctx.lineTo(tx + 12, ty + 24); ctx.fill();
      };

      // Trees scattered on borders
      for(let i=-20; i<ROOM_WIDTH; i+=60) {
         drawTree(i, -30);
         drawTree(i, ROOM_HEIGHT - 60);
      }
      for(let j=30; j<ROOM_HEIGHT-60; j+=60) {
         drawTree(-20, j);
         drawTree(ROOM_WIDTH - 30, j);
      }

      // Draw house
      const houseX = ROOM_WIDTH/2 - 120;
      const houseY = ROOM_HEIGHT/2 - 120;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(houseX - 5, houseY + 60, 250, 95);

      // Base wall
      ctx.fillStyle = '#E8EDF2'; // Crisp white-blue
      ctx.fillRect(houseX, houseY + 60, 240, 90);
      
      // Horizontal siding lines
      ctx.fillStyle = '#B4C3CB';
      for(let i=0; i<5; i++) {
         ctx.fillRect(houseX, houseY + 60 + (i * 18), 240, 2);
      }

      // House trims
      ctx.fillStyle = '#8B9EA8';
      ctx.fillRect(houseX, houseY + 60, 240, 6); // Top trim
      ctx.fillRect(houseX, houseY + 144, 240, 6); // Bottom trim
      ctx.fillRect(houseX, houseY + 60, 6, 90);   // Left trim
      ctx.fillRect(houseX + 234, houseY + 60, 6, 90); // Right trim

      // Roof (Pixel art style)
      ctx.fillStyle = '#DB584B'; // Bright Red Roof
      ctx.beginPath();
      ctx.moveTo(houseX - 10, houseY + 60);
      ctx.lineTo(houseX + 250, houseY + 60);
      ctx.lineTo(houseX + 210, houseY);
      ctx.lineTo(houseX + 30, houseY);
      ctx.fill();

      // Roof horizontal dividing line
      ctx.fillStyle = '#B03B31';
      ctx.fillRect(houseX + 20, houseY + 30, 200, 2);

      // Roof vertical tiles
      ctx.strokeStyle = '#B03B31';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 6; i++) {
        let x = houseX + 30 + (i * 28);
        ctx.beginPath();
        // Adjust slant for perspective
        let slant = (i < 4) ? -10 : 10;
        ctx.moveTo(x, houseY);
        ctx.lineTo(x + slant, houseY + 60);
        ctx.stroke();
      }

      // Windows (x2)
      const drawWindow = (wx: number, wy: number) => {
         // Frame
         ctx.fillStyle = '#DFDFCA'; 
         ctx.fillRect(wx, wy, 60, 30);
         // Inner Border
         ctx.fillStyle = '#9FB4C4';
         ctx.fillRect(wx+2, wy+2, 56, 26);
         // Glass
         ctx.fillStyle = '#689DCC';
         ctx.fillRect(wx+4, wy+4, 52, 22);
         // Glint
         ctx.fillStyle = '#A4D1E8';
         ctx.fillRect(wx+4, wy+4, 20, 22);
         // Grid lines
         ctx.fillStyle = '#DFDFCA';
         ctx.fillRect(wx+30, wy+2, 2, 26);
         ctx.fillRect(wx+2, wy+14, 56, 2);
      };

      drawWindow(houseX + 20, houseY + 70); // Left window
      drawWindow(houseX + 160, houseY + 70); // Right window
      drawWindow(houseX + 160, houseY + 110); // Right bottom window

      // Exterior items
      EXTERIOR_OBJECTS.forEach(obj => {
         if(obj.id === 'puerta_entrada') {
             // Door Frame
             ctx.fillStyle = '#A0A5AF';
             ctx.fillRect(obj.rect.x, obj.rect.y, obj.rect.width, obj.rect.height);
             
             // Door inner
             ctx.fillStyle = '#D68953';
             ctx.fillRect(obj.rect.x + 4, obj.rect.y + 4, obj.rect.width - 8, obj.rect.height - 4);
             
             // Door panels
             ctx.fillStyle = '#BF7340';
             ctx.fillRect(obj.rect.x + 8, obj.rect.y + 8, obj.rect.width - 16, 20);
             ctx.fillRect(obj.rect.x + 8, obj.rect.y + 32, obj.rect.width - 16, 24);

             // Door handle
             ctx.fillStyle = '#DFDFCA';
             ctx.beginPath();
             ctx.arc(obj.rect.x + obj.rect.width - 12, obj.rect.y + obj.rect.height/2 + 5, 4, 0, Math.PI*2);
             ctx.fill();

             // Cute window on top half of door
             ctx.fillStyle = '#689DCC'; // Glass
             ctx.fillRect(obj.rect.x + 12, obj.rect.y + 12, obj.rect.width - 24, 12);

         } else if (obj.id === 'felpudo') {
             // Mat shadow
             ctx.fillStyle = 'rgba(0,0,0,0.15)';
             ctx.fillRect(obj.rect.x + 2, obj.rect.y + 2, obj.rect.width, obj.rect.height);
             
             // Mat outline & base
             ctx.fillStyle = '#202020';
             ctx.fillRect(obj.rect.x, obj.rect.y, obj.rect.width, obj.rect.height);
             ctx.fillStyle = '#E8E8E8'; // white mat
             ctx.fillRect(obj.rect.x + 2, obj.rect.y + 2, obj.rect.width - 4, obj.rect.height - 4);
             
             // Red accent line
             ctx.fillStyle = '#C84038';
             ctx.fillRect(obj.rect.x + 2, obj.rect.y + 6, obj.rect.width - 4, 4);

             ctx.fillStyle = '#202020';
             ctx.font = 'bold 9px monospace';
             ctx.textAlign = 'center';
             ctx.fillText('BIENVENIDO', obj.rect.x + obj.rect.width / 2, obj.rect.y + 20);
             ctx.textAlign = 'left';
         } else if (obj.id === 'perro') {
             // Dog shadow
             ctx.fillStyle = 'rgba(0,0,0,0.15)';
             ctx.beginPath();
             ctx.ellipse(obj.rect.x + 24, obj.rect.y + 36, 20, 8, 0, 0, Math.PI*2);
             ctx.fill();

             const dx = obj.rect.x;
             const dy = obj.rect.y;
             
             // Dog Body (White)
             ctx.fillStyle = '#FFFFFF';
             ctx.fillRect(dx + 12, dy + 16, 24, 16); // body
             ctx.fillRect(dx + 12, dy + 32, 4, 6);   // leg
             ctx.fillRect(dx + 32, dy + 32, 4, 6);   // leg
             
             // Neck/Head
             ctx.fillRect(dx + 8, dy + 8, 12, 14);
             // Snout
             ctx.fillRect(dx, dy + 14, 8, 8);
             ctx.fillStyle = '#202020'; // Nose
             ctx.fillRect(dx - 1, dy + 14, 3, 3);
             
             // Ears
             ctx.fillStyle = '#E8E8E8'; // Slightly grey ear
             ctx.fillRect(dx + 14, dy + 8, 10, 10);
             
             // Eyes
             ctx.fillStyle = '#202020';
             ctx.fillRect(dx + 6, dy + 12, 3, 2);
             
             // Tail
             ctx.fillStyle = '#FFFFFF';
             ctx.beginPath();
             ctx.moveTo(dx + 36, dy + 20);
             ctx.lineTo(dx + 44, dy + 10);
             ctx.lineTo(dx + 46, dy + 12);
             ctx.fill();
         }
      });
    }

    const drawInterior = (ctx: CanvasRenderingContext2D) => {
      // Woven Basket Floor (From sprite)
      ctx.fillStyle = '#E3CFA9'; // Base Yellowish Wood
      ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
      
      // Wicker pattern
      ctx.fillStyle = '#CAAE7A'; // Darker stripe
      const tileSize = 32;
      for (let j = 0; j < ROOM_HEIGHT; j += tileSize) {
          for (let i = 0; i < ROOM_WIDTH; i += tileSize) {
              const isHorizontal = ((i/tileSize) + (j/tileSize)) % 2 === 0;
              ctx.strokeStyle = '#B39459';
              ctx.lineWidth = 2;
              if (isHorizontal) {
                 for(let k=4; k<tileSize; k+=8) {
                     ctx.beginPath(); ctx.moveTo(i+2, j+k); ctx.lineTo(i+tileSize-2, j+k); ctx.stroke();
                 }
              } else {
                 for(let k=4; k<tileSize; k+=8) {
                     ctx.beginPath(); ctx.moveTo(i+k, j+2); ctx.lineTo(i+k, j+tileSize-2); ctx.stroke();
                 }
              }
              // Tile borders
              ctx.strokeStyle = '#A17D42';
              ctx.lineWidth = 1;
              ctx.strokeRect(i, j, tileSize, tileSize);
          }
      }

      // Walls
      ctx.fillStyle = '#9C9C9C'; // Solid minimal walls
      ctx.fillRect(0, 0, ROOM_WIDTH, WALL_SIZE * 1.5);
      // Wall bottom edge
      ctx.fillStyle = '#6F6F6F';
      ctx.fillRect(0, WALL_SIZE * 1.5 - 4, ROOM_WIDTH, 4);

      // Objects
      INTERIOR_OBJECTS.forEach((obj) => {
        if(obj.type === 'door') {
           // Exit mat
           ctx.fillStyle = '#4A2A20';
           ctx.fillRect(obj.rect.x, obj.rect.y, obj.rect.width, obj.rect.height);
        } else {
           // Drop shadow
           ctx.fillStyle = 'rgba(0,0,0,0.3)';
           ctx.fillRect(obj.rect.x, obj.rect.y + obj.rect.height - 4, obj.rect.width + 4, 10);
           
           if(obj.label === 'ESCRITORIO') {
               // Desk Top
               ctx.fillStyle = '#D6B183';
               ctx.fillRect(obj.rect.x, obj.rect.y, obj.rect.width, 30);
               ctx.fillStyle = '#B48858'; // top edge depth
               ctx.fillRect(obj.rect.x, obj.rect.y+30, obj.rect.width, 4);
               
               // Legs/Body
               ctx.fillStyle = '#926337';
               ctx.fillRect(obj.rect.x + 4, obj.rect.y + 34, 16, obj.rect.height - 34); // left leg
               ctx.fillRect(obj.rect.x + obj.rect.width - 40, obj.rect.y + 34, 36, obj.rect.height - 34); // right drawers
               
               // Drawer details
               ctx.fillStyle = '#7C522A';
               ctx.fillRect(obj.rect.x + obj.rect.width - 36, obj.rect.y + 38, 28, 8);
               ctx.fillRect(obj.rect.x + obj.rect.width - 36, obj.rect.y + 50, 28, 8);
               ctx.fillRect(obj.rect.x + obj.rect.width - 36, obj.rect.y + 62, 28, 8);

               // Loose papers on desk
               ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
               ctx.fillRect(obj.rect.x + 10, obj.rect.y + 5, 12, 16);
               ctx.fillRect(obj.rect.x + 24, obj.rect.y + 8, 14, 18);
               ctx.strokeStyle = 'rgba(0,0,0,0.1)';
               ctx.strokeRect(obj.rect.x + 10, obj.rect.y + 5, 12, 16);
               
           } else if (obj.label === 'PC') {
               const cx = obj.rect.x;
               const cy = obj.rect.y;

               // CRT Monitor
               ctx.fillStyle = '#E4E4D9'; // Retro beige
               ctx.fillRect(cx + 4, cy, 26, 20); // Monitor casing
               ctx.fillStyle = '#CFCFBA'; // Shadow/Bevel
               ctx.fillRect(cx + 6, cy + 2, 22, 16);
               ctx.fillStyle = '#5A636A'; // Screen off-slate
               ctx.fillRect(cx + 8, cy + 4, 18, 12);
               
               // Little screen details (OS)
               ctx.fillStyle = '#A4B2BC';
               ctx.fillRect(cx + 10, cy + 6, 2, 2); // icon 1
               ctx.fillRect(cx + 10, cy + 10, 2, 2); // icon 2
               ctx.fillStyle = '#FFFFFF';
               ctx.fillRect(cx + 18, cy + 8, 6, 6); // open window
               
               // CRT Screen glow indicator
               ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; // faint Z-OS glow
               ctx.fillRect(cx + 8, cy + 4, 18, 12);

               // CPU Base
               ctx.fillStyle = '#E4E4D9';
               ctx.fillRect(cx, cy + 20, 34, 12);
               ctx.fillStyle = '#CFCFBA'; // base bottom shadow
               ctx.fillRect(cx, cy + 30, 34, 2);
               
               // Floppy slot
               ctx.fillStyle = '#333';
               ctx.fillRect(cx + 20, cy + 24, 10, 2);
               
               // LEDs
               ctx.fillStyle = '#73C855';
               ctx.fillRect(cx + 4, cy + 26, 2, 2);
               ctx.fillRect(cx + 8, cy + 26, 2, 2);

               // Keyboard
               ctx.fillStyle = '#E4E4D9';
               ctx.fillRect(cx - 2, cy + 35, 28, 8);
               // Keys
               ctx.fillStyle = '#AAA';
               ctx.fillRect(cx, cy + 36, 24, 1);
               ctx.fillRect(cx, cy + 38, 24, 1);
               ctx.fillRect(cx, cy + 40, 24, 1);

               // Mouse & Cable
               ctx.fillStyle = '#E4E4D9';
               ctx.fillRect(cx + 30, cy + 35, 6, 8);
               // Cable
               ctx.strokeStyle = '#333';
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.moveTo(cx + 33, cy + 35);
               ctx.quadraticCurveTo(cx + 34, cy + 30, cx + 28, cy + 30);
               ctx.stroke();
               
           } else if (obj.label === 'NEVERA') {
               // Fridge Body
               ctx.fillStyle = '#FAFAFA';
               ctx.fillRect(obj.rect.x, obj.rect.y, obj.rect.width, obj.rect.height);
               // Fridge Shadow/Outline
               ctx.strokeStyle = '#303030';
               ctx.lineWidth = 2;
               ctx.strokeRect(obj.rect.x, obj.rect.y, obj.rect.width, obj.rect.height);
               // Door split
               ctx.beginPath(); ctx.moveTo(obj.rect.x, obj.rect.y + 24); ctx.lineTo(obj.rect.x + obj.rect.width, obj.rect.y + 24); ctx.stroke();
               // Handles
               ctx.fillStyle = '#A0A0A0';
               ctx.fillRect(obj.rect.x + 8, obj.rect.y + 10, 4, 10);
               ctx.fillRect(obj.rect.x + 8, obj.rect.y + 30, 4, 20);

           } else if (obj.label === 'TELEVISIÓN') {
               // Table base
               ctx.fillStyle = '#D6B183';
               ctx.fillRect(obj.rect.x + 6, obj.rect.y + 45, obj.rect.width - 12, 15);
               ctx.fillStyle = '#926337';
               ctx.fillRect(obj.rect.x + 10, obj.rect.y + 60, 6, 12);
               ctx.fillRect(obj.rect.x + obj.rect.width - 16, obj.rect.y + 60, 6, 12);
               
               // CRT TV
               ctx.fillStyle = '#40444A';
               ctx.fillRect(obj.rect.x, obj.rect.y, obj.rect.width, 45);
               // Screen bezel
               ctx.fillStyle = '#2C2E33';
               ctx.fillRect(obj.rect.x + 4, obj.rect.y + 4, obj.rect.width - 8, 32);
               // Screen
               ctx.fillStyle = '#424A4E';
               ctx.fillRect(obj.rect.x + 8, obj.rect.y + 8, obj.rect.width - 16, 24);
               // Glint
               ctx.fillStyle = '#5C656A';
               ctx.fillRect(obj.rect.x + 12, obj.rect.y + 10, 20, 10);
               // VCR slot
               ctx.fillStyle = '#111';
               ctx.fillRect(obj.rect.x + 10, obj.rect.y + 38, 30, 4);
               
           } else if (obj.label === 'ESTANTERÍA') {
               ctx.fillStyle = '#A37242'; // Wood Base
               ctx.fillRect(obj.rect.x, obj.rect.y, obj.rect.width, obj.rect.height);
               ctx.fillStyle = '#78502B'; // Frame/Sides
               ctx.fillRect(obj.rect.x, obj.rect.y, 4, obj.rect.height);
               ctx.fillRect(obj.rect.x + obj.rect.width - 4, obj.rect.y, 4, obj.rect.height);
               ctx.fillRect(obj.rect.x, obj.rect.y, obj.rect.width, 4); // Top
               
               // Shelves and books (Fixed blue/academic style)
               const bookColor = '#5270D6'; 
               for(let s=0; s<4; s++) {
                   const sy = obj.rect.y + 16 + (s * 20);
                   ctx.fillStyle = '#5A3816'; // Shelf wood
                   ctx.fillRect(obj.rect.x, sy + 16, obj.rect.width, 4);
                   
                   // Draw fixed books (no random to avoid flickering)
                   for(let bx = obj.rect.x + 6; bx < obj.rect.x + obj.rect.width - 10; bx += 6) {
                      ctx.fillStyle = (bx % 12 === 0) ? '#3E5BB2' : bookColor;
                      ctx.fillRect(bx, sy + 2, 4, 14);
                   }
               }
           } else if (obj.label === 'PERCHERO') {
               ctx.fillStyle = '#4F311B';
               // Base
               ctx.beginPath();
               ctx.ellipse(obj.rect.x + obj.rect.width/2, obj.rect.y + obj.rect.height - 4, 14, 6, 0, 0, Math.PI*2);
               ctx.fill();
               // Pole
               ctx.fillRect(obj.rect.x + obj.rect.width/2 - 3, obj.rect.y, 6, obj.rect.height - 4);
               // Pegs
               ctx.lineWidth = 4;
               ctx.strokeStyle = '#4F311B';
               ctx.beginPath(); ctx.moveTo(obj.rect.x + obj.rect.width/2, obj.rect.y + 10); ctx.lineTo(obj.rect.x + obj.rect.width/2 - 12, obj.rect.y + 2); ctx.stroke();
               ctx.beginPath(); ctx.moveTo(obj.rect.x + obj.rect.width/2, obj.rect.y + 18); ctx.lineTo(obj.rect.x + obj.rect.width/2 + 12, obj.rect.y + 10); ctx.stroke();
               ctx.beginPath(); ctx.moveTo(obj.rect.x + obj.rect.width/2, obj.rect.y + 28); ctx.lineTo(obj.rect.x + obj.rect.width/2 - 10, obj.rect.y + 20); ctx.stroke();

               // Hanging clothes (blobs)
               ctx.fillStyle = '#3050C8'; // Blue coat
               ctx.beginPath(); ctx.ellipse(obj.rect.x + obj.rect.width/2 - 14, obj.rect.y + 12, 8, 14, 0.2, 0, Math.PI*2); ctx.fill();
               ctx.fillStyle = '#C84038'; // Red jacket
               ctx.beginPath(); ctx.ellipse(obj.rect.x + obj.rect.width/2 + 14, obj.rect.y + 20, 6, 12, -0.1, 0, Math.PI*2); ctx.fill();
           }
        }
      });
    }

    const drawPlayer = (ctx: CanvasRenderingContext2D) => {
      const px = playerPos.current.x;
      const py = playerPos.current.y;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 30, 12, 6, 0, 0, Math.PI*2);
      ctx.fill();

      // Body parameters (New style: Dark hair + Jersey 13)
      const skin = '#F2B591'; // Light skin
      const shirt = '#B8322C'; // Deeper Red shirt
      const pants = '#4F6BAA'; // Blue pants
      const hair = '#34384B'; // Dark blue/black hair
      const shoes = '#4A3B32';

      // Shoes
      ctx.fillStyle = shoes;
      ctx.fillRect(px + 6, py + 26, 8, 4);
      ctx.fillRect(px + 18, py + 26, 8, 4);

      // Pants
      ctx.fillStyle = pants;
      ctx.fillRect(px + 6, py + 18, 20, 8);
      // Leg split
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(px + 15, py + 20, 2, 6);

      // Shirt
      ctx.fillStyle = shirt;
      ctx.fillRect(px + 4, py + 10, 24, 10);
      
      // Skin (Arms / Face)
      ctx.fillStyle = skin;
      
      const dir = playerDir.current;

      if (dir === 'down') {
         // Arms
         ctx.fillRect(px, py + 10, 4, 10);
         ctx.fillRect(px + 28, py + 10, 4, 10);
         // Face base
         ctx.fillRect(px + 6, py + 2, 20, 12);
         // Hair (Voluminous bowl cut style)
         ctx.fillStyle = hair;
         ctx.fillRect(px + 4, py - 6, 24, 12);
         ctx.fillRect(px + 6, py + 4, 2, 4);  // fringe bits
         ctx.fillRect(px + 24, py + 4, 2, 4); // fringe bits
         
         // Eyes
         ctx.fillStyle = '#202020';
         ctx.fillRect(px + 10, py + 8, 3, 3);
         ctx.fillRect(px + 19, py + 8, 3, 3);
      } 
      else if (dir === 'up') {
         // Arms
         ctx.fillRect(px, py + 10, 4, 10);
         ctx.fillRect(px + 28, py + 10, 4, 10);
         // Hair (Back view)
         ctx.fillStyle = hair;
         ctx.fillRect(px + 4, py - 6, 24, 18);
         // Number '13' on back (White)
         ctx.fillStyle = '#FFFFFF';
         ctx.font = 'bold 11px monospace';
         ctx.textAlign = 'center';
         ctx.fillText('13', px + 16, py + 19);
         ctx.textAlign = 'start'; // reset
      }
      else if (dir === 'right') {
         // Face profile
         ctx.fillRect(px + 10, py + 2, 16, 12);
         // Hair profile
         ctx.fillStyle = hair;
         ctx.fillRect(px + 6, py - 6, 20, 10);
         ctx.fillRect(px + 6, py + 2, 8, 8); // side hair
         // Eye
         ctx.fillStyle = '#202020';
         ctx.fillRect(px + 20, py + 8, 3, 3);
      }
      else if (dir === 'left') {
         // Face profile
         ctx.fillRect(px + 6, py + 2, 16, 12);
         // Hair profile
         ctx.fillStyle = hair;
         ctx.fillRect(px + 6, py - 6, 20, 10);
         ctx.fillRect(px + 18, py + 2, 8, 8); // side hair
         // Eye
         ctx.fillStyle = '#202020';
         ctx.fillRect(px + 9, py + 8, 3, 3);
      }
    }

    const drawWin95OS = (ctx: CanvasRenderingContext2D) => {
      // Desktop Background
      ctx.fillStyle = '#008080';
      ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

      const mx = mousePos.current.x;
      const my = mousePos.current.y;
      let hoverCursor = false;

      // --- Draw Icons ---
      const drawIcon = (x: number, y: number, name: string, iconType: string, isHovered: boolean) => {
        // Selection box
        if (isHovered) {
           ctx.fillStyle = 'rgba(0, 0, 128, 0.5)';
           ctx.fillRect(x - 5, y - 5, 55, 65);
        }
        
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x, y, 40, 32);
        // Add basic icon details
        if (iconType === 'pc') {
           ctx.fillStyle = '#FFF';
           ctx.fillRect(x+4, y+4, 32, 20);
           ctx.fillStyle = '#000080';
           ctx.fillRect(x+6, y+6, 28, 16);
           ctx.fillStyle = '#C0C0C0';
           ctx.fillRect(x+16, y+24, 8, 8);
        } else if (iconType === 'cv') {
           ctx.fillStyle = '#FFF'; 
           ctx.fillRect(x+8, y+2, 24, 28);
           ctx.fillStyle = '#0000FF'; 
           ctx.fillRect(x+12, y+8, 16, 2);
           ctx.fillRect(x+12, y+14, 12, 2);
           ctx.fillRect(x+12, y+20, 16, 2);
           // Red 'seal' so it pops out
           ctx.fillStyle = '#FF0000';
           ctx.beginPath();
           ctx.arc(x+20, y+16, 4, 0, Math.PI*2);
           ctx.fill();
        } else if (iconType === 'net') {
           ctx.fillStyle = '#C0C0C0';
           ctx.fillRect(x, y, 40, 32); 
           ctx.fillStyle = '#000080';
           ctx.beginPath();
           ctx.arc(x+20, y+16, 12, 0, Math.PI*2);
           ctx.fill();
           ctx.fillStyle = '#FFF';
           ctx.font = 'bold 16px serif';
           ctx.fillText('e', x+15, y+22);
        } else if (iconType === 'text') {
           ctx.fillStyle = '#FFF'; 
           ctx.fillRect(x+8, y+2, 24, 28);
           // Folded corner
           ctx.fillStyle = '#C0C0C0';
           ctx.beginPath(); ctx.moveTo(x+24, y+2); ctx.lineTo(x+32, y+10); ctx.lineTo(x+24, y+10); ctx.fill();
           // Lines
           ctx.fillStyle = '#C0C0C0';
           ctx.fillRect(x+12, y+10, 8, 2);
           ctx.fillRect(x+12, y+14, 16, 2);
           ctx.fillRect(x+12, y+18, 16, 2);
           ctx.fillRect(x+12, y+22, 12, 2);
        } else if (iconType === 'trash') {
           ctx.fillStyle = '#FFF';
           ctx.fillRect(x+8, y+6, 24, 26);
           ctx.strokeStyle = '#000';
           ctx.strokeRect(x+8, y+6, 24, 26);
           ctx.fillStyle = '#008000';
           ctx.fillRect(x+14, y+12, 12, 14); 
        } else if (iconType === 'project') {
           ctx.fillStyle = '#FFF'; 
           ctx.fillRect(x+6, y+4, 28, 24);
           ctx.fillStyle = '#FFD700'; // Folder
           ctx.fillRect(x+4, y+10, 32, 18);
        }

        ctx.fillStyle = '#FFF';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        // text shadow
        ctx.fillStyle = '#000';
        ctx.fillText(name, x + 21, y + 47);
        ctx.fillStyle = '#FFF';
        ctx.fillText(name, x + 20, y + 46);
        ctx.textAlign = 'start';
      };

      // Draw icon grid
      let windowHover = false;
      
      DESKTOP_APPS.forEach(app => {
         // Generous hitbox for better interaction (approx 65x75 area)
         const isHovered = mx >= app.x - 10 && mx <= app.x + 55 && my >= app.y - 10 && my <= app.y + 70;
         if (isHovered) {
            hoverCursor = true;
            drawIcon(app.x, app.y, app.name, app.type, true);
         } else {
            drawIcon(app.x, app.y, app.name, app.type, false);
         }
      });

      // --- Taskbar ---
      const tbY = ROOM_HEIGHT - 35;
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(0, tbY, ROOM_WIDTH, 35);
      
      // Top border
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, tbY, ROOM_WIDTH, 2);

      // Start Button
      const btnHover = mx >= 0 && mx <= 80 && my >= tbY;
      if (btnHover) hoverCursor = true;
      const btnActive = osStateRef.current.startMenuOpen;

      if (btnActive) {
         ctx.fillStyle = '#808080'; // sunken
         ctx.fillRect(4, tbY + 4, 72, 27);
         ctx.fillStyle = '#000000';
         ctx.fillRect(4, tbY + 4, 72, 1);
         ctx.fillRect(4, tbY + 4, 1, 27);
      } else {
         ctx.fillStyle = '#C0C0C0';
         ctx.fillRect(4, tbY + 4, 72, 27);
         ctx.fillStyle = '#FFFFFF';
         ctx.fillRect(4, tbY + 4, 72, 1);
         ctx.fillRect(4, tbY + 4, 1, 27);
         ctx.fillStyle = '#000000';
         ctx.fillRect(75, tbY + 4, 1, 27);
         ctx.fillRect(4, tbY + 30, 72, 1);
      }
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Inicio', 32, tbY + 23);
      
      // Windows Flag Mock
      ctx.fillStyle = '#FF0000'; ctx.fillRect(10, tbY + 10, 8, 8);
      ctx.fillStyle = '#00FF00'; ctx.fillRect(20, tbY + 10, 8, 8);
      ctx.fillStyle = '#0000FF'; ctx.fillRect(10, tbY + 20, 8, 8);
      ctx.fillStyle = '#FFFF00'; ctx.fillRect(20, tbY + 20, 8, 8);

      // Clock
      const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      ctx.fillStyle = '#808080';
      ctx.fillRect(ROOM_WIDTH - 70, tbY + 6, 64, 23);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ROOM_WIDTH - 69, tbY + 28, 63, 1);
      ctx.fillRect(ROOM_WIDTH - 6, tbY + 6, 1, 23);
      ctx.fillStyle = '#000';
      ctx.font = '12px sans-serif';
      ctx.fillText(timeStr, ROOM_WIDTH - 60, tbY + 22);

      // --- Start Menu ---
      if (osStateRef.current.startMenuOpen) {
          const smX = 0;
          const smY = ROOM_HEIGHT - 35 - 200;
          const smW = 160;
          const smH = 200;
          
          ctx.fillStyle = '#C0C0C0';
          ctx.fillRect(smX, smY, smW, smH);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(smX, smY, smW, 1);
          ctx.fillRect(smX, smY, 1, smH);
          ctx.fillStyle = '#000000';
          ctx.fillRect(smX + smW - 1, smY, 1, smH);
          ctx.fillRect(smX, smY + smH - 1, smW, 1);

          // Side bar
          ctx.fillStyle = '#000080';
          ctx.fillRect(smX + 2, smY + 2, 26, smH - 4);
          ctx.save();
          ctx.translate(smX + 16, smY + smH - 10);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('Z-OS 95', 0, 0);
          ctx.restore();

          // Separator
          ctx.fillStyle = '#808080';
          ctx.fillRect(smX + 32, smY + 160, smW - 36, 1);
          ctx.fillStyle = '#FFF';
          ctx.fillRect(smX + 32, smY + 161, smW - 36, 1);

          const items = [
             { label: 'Programas', y: smY + 10 },
             { label: 'Documentos', y: smY + 40 },
             { label: 'Configuración', y: smY + 70 },
             { label: 'Buscar', y: smY + 100 },
             { label: 'Ayuda', y: smY + 130 },
             { label: 'Apagar sistema', y: smY + 170, isExit: true }
          ];

          items.forEach(item => {
             const itHover = mx >= smX + 30 && mx <= smX + smW - 2 && my >= item.y && my <= item.y + 24;
             if (itHover) {
                hoverCursor = true;
                ctx.fillStyle = '#000080';
                ctx.fillRect(smX + 30, item.y, smW - 32, 24);
                ctx.fillStyle = '#FFF';
             } else {
                ctx.fillStyle = '#000';
             }
             ctx.font = '13px sans-serif';
             ctx.fillText(item.label, smX + 40, item.y + 16);
          });
      }

      if (canvasRef.current) {
         canvasRef.current.style.cursor = hoverCursor ? 'pointer' : 'default';
      }
    };

    const draw = () => {
      ctx.imageSmoothingEnabled = false;
      const { currentMap: map, isViewingPC } = stateRef.current;
      
      if (map === 'EXTERIOR') drawExterior(ctx);
      else drawInterior(ctx);

      drawPlayer(ctx);

      // Draw bouncing exclamation marks for interactive objects
      const activeObjects = map === 'EXTERIOR' ? EXTERIOR_OBJECTS : INTERIOR_OBJECTS;
      const bounce = Math.sin(Date.now() / 200) * 4;
      
      activeObjects.forEach(obj => {
         if (stateRef.current.interactedIds.includes(obj.id)) return;
         
         const cx = obj.rect.x + obj.rect.width / 2;
         const cy = obj.rect.y - 15 + bounce;

         ctx.font = 'bold 22px "Arial Black", sans-serif';
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';

         // Outer glow
         ctx.shadowColor = '#FFD700';
         ctx.shadowBlur = 15;
         
         // Stroke / Outline
         ctx.strokeStyle = '#000000';
         ctx.lineWidth = 4;
         ctx.strokeText('!', cx, cy);
         
         // Fill
         ctx.shadowBlur = 0;
         ctx.fillStyle = '#FFFFFF';
         ctx.fillText('!', cx, cy);
      });

      if (isViewingPC) {
         drawWin95OS(ctx);
      }
    };

    const render = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactionTarget]); // Dependency on interactionTarget so event handler has access to it

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isViewingPC) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ROOM_WIDTH / rect.width;
    const scaleY = ROOM_HEIGHT / rect.height;
    mousePos.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isViewingPC) return;
    const mx = mousePos.current.x;
    const my = mousePos.current.y;
    
    // Check Taskbar Start Button First
    const tbY = ROOM_HEIGHT - 35;
    if (mx >= 0 && mx <= 80 && my >= tbY) {
       osStateRef.current.startMenuOpen = !osStateRef.current.startMenuOpen;
       return;
    }

    if (osStateRef.current.startMenuOpen) {
       // Start menu clicks
       const smX = 0;
       const smY = ROOM_HEIGHT - 35 - 200;
       const smW = 160;
       
       if (mx >= smX && mx <= smX + smW && my >= smY && my <= smY + 200) {
          // Check "Apagar sistema"
          if (my >= smY + 170 && my <= smY + 194) {
             setIsViewingPC(false);
             setOpenedApp(null); // close any floating windows
             setIsMaximized(false);
             osStateRef.current.startMenuOpen = false;
             if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
          }
       } else {
          // Close start menu if clicked outside
          osStateRef.current.startMenuOpen = false;
       }
       return;
    }

    // Check App Icons
    for (const app of DESKTOP_APPS) {
       if (mx >= app.x - 10 && mx <= app.x + 55 && my >= app.y - 10 && my <= app.y + 70) {
          if (['penalties', 'cv', 'logulia', 'zaprado', 'readme_zap', 'readme_log', 'gestor', 'readme_gest'].includes(app.id)) {
             setOpenedApp(app.id);
             setIsMaximized(false); 
          }
       }
    }
  };

  const getWindowData = (app: string) => {
     if (app === 'cv') return { title: 'CV Álvaro Fernández', url: 'https://cvafc.vercel.app/', type: 'browser' };
     if (app === 'logulia') return { title: 'Logulia', url: 'https://logulia-web-para-porfolio.vercel.app/', type: 'browser' };
     if (app === 'zaprado') return { title: 'Zaprado', url: 'https://zaprado-web-para-porfolio.vercel.app/', type: 'browser' };
     if (app === 'gestor') return { title: 'Gestor Incidencias', url: 'https://app-incidencias-theta.vercel.app/', type: 'browser' };
     
     if (app === 'readme_zap') return { title: 'Leeme.txt', text: 'ZAPRADO - Sistema Gestor de Incidencias\n\nSolución avanzada para la administración y seguimiento de reportes post-venta. Permite centralizar la gestión de anomalías en productos, optimizar flujos logísticos de devolución y agilizar la resolución de conflictos en envíos, asegurando una experiencia de usuario de alta calidad y tiempos de respuesta mínimos.', type: 'text' };
     if (app === 'readme_log') return { title: 'Leeme.txt', text: 'LOGULIA - Control y Liquidación de Gastos Operativos\n\nHerramienta especializada en la monitorización y cálculo preciso del kilometraje/coste (km/€). Facilita el reporte de desplazamientos profesionales, optimiza el reembolso de gastos de transporte y garantiza un control financiero transparente y eficiente de la movilidad corporativa.', type: 'text' };
     if (app === 'readme_gest') return { title: 'Leeme.txt', text: 'GESTOR INCIDENCIAS ESPAÑA - Monitorización en Tiempo Real\n\nAplicación de visualización geográfica que permite localizar y hacer seguimiento de dónde saltan las incidencias a lo largo de España mediante un mapa interactivo. Ayuda a identificar zonas críticas y planificar respuestas efectivas de soporte a nivel nacional.', type: 'text' };
     
     if (app === 'penalties') return { title: 'Penaltis.exe', url: '', type: 'game' };
     return { title: 'Navegador Web', url: '', type: 'browser' };
  };

  return (
    <div className="bg-[#1A1A1A] min-h-[100dvh] flex flex-col items-center justify-center font-mono text-white overflow-hidden p-0 lg:p-8 select-none">
      
      {/* Game Viewport Container */}
      <div className="relative border-y-[6px] lg:border-[6px] border-[#303030] bg-[#1e1e1e] shadow-[0_0_60px_rgba(0,0,0,0.8)] lg:rounded-sm w-full max-w-[800px] aspect-video flex-shrink-0">
        
        {/* Windows 95 Emulated Application Window Overlay */}
        {openedApp && ['cv', 'logulia', 'zaprado', 'readme_zap', 'readme_log', 'penalties', 'gestor', 'readme_gest'].includes(openedApp) && (
          <div className={`absolute ${isMaximized ? 'inset-0 mb-[35px]' : 'top-[5%] left-[5%] right-[5%] bottom-[10%]'} bg-[#C0C0C0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#000] flex flex-col z-50 shadow-[4px_4px_0_rgba(0,0,0,0.5)]`}>
             <div className="bg-[#000080] text-white flex justify-between p-1 items-center font-sans">
                <div className="flex items-center gap-2 ml-1">
                   {/* Tiny mockup icon */}
                   <div className="w-3 h-3 bg-white border border-gray-400">
                     <div className="w-full h-[2px] bg-blue-500 mt-1"></div>
                   </div>
                   <span className="font-bold text-sm tracking-wide">
                     {getWindowData(openedApp).type === 'browser' ? `Explorador - ${getWindowData(openedApp).title}` : 
                      getWindowData(openedApp).type === 'text' ? `Bloc de notas - ${getWindowData(openedApp).title}` :
                      getWindowData(openedApp).title}
                   </span>
                </div>
                <div className="flex gap-1 items-center mr-1">
                   {/* Minimize Button */}
                   <button 
                     className="bg-[#C0C0C0] text-black w-5 h-5 font-bold border-t border-l border-white border-b border-r border-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-white active:border-r-white flex items-center justify-center text-xs pb-1"
                   >
                     _
                   </button>
                   {/* Maximize / Restore Button */}
                   <button 
                     className="bg-[#C0C0C0] text-black w-5 h-5 font-bold border-t border-l border-white border-b border-r border-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-white active:border-r-white flex items-center justify-center text-base pb-1 mr-1"
                     onClick={() => setIsMaximized(!isMaximized)}
                   >
                     {isMaximized ? '❐' : '□'}
                   </button>
                   {/* Close Button */}
                   <button 
                     className="bg-[#C0C0C0] text-black w-5 h-5 font-bold border-t border-l border-white border-b border-r border-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-white active:border-r-white flex items-center justify-center text-xs"
                     onClick={() => {
                        setOpenedApp(null);
                        setIsMaximized(false);
                     }}
                   >
                     X
                   </button>
                </div>
             </div>
             <div className="flex bg-[#C0C0C0] border-b border-gray-500 p-1 gap-4 text-black text-xs md:text-sm font-sans mx-1">
                <span><span className="underline">A</span>rchivo</span>
                <span><span className="underline">E</span>dición</span>
                <span><span className="underline">V</span>er</span>
                {getWindowData(openedApp).type === 'browser' && <span><span className="underline">F</span>avoritos</span>}
                <span>A<span className="underline">y</span>uda</span>
             </div>
             <div className="flex-1 border-t-2 border-l-2 border-[#808080] border-b-2 border-r-2 border-white bg-black m-1 relative overflow-auto">
                {getWindowData(openedApp).type === 'browser' ? (
                  <iframe 
                     key={openedApp} // Force iframe reload when window changes
                     src={getWindowData(openedApp).url} 
                     className="w-full h-full absolute inset-0 border-none bg-white"
                     title={getWindowData(openedApp).title}
                  />
                ) : getWindowData(openedApp).type === 'text' ? (
                  <div className="p-2 text-black bg-white w-full h-full font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {getWindowData(openedApp).text}
                  </div>
                ) : (
                  <PenaltyGame />
                )}
             </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={ROOM_WIDTH}
          height={ROOM_HEIGHT}
          className="w-full h-full object-contain block cursor-crosshair"
          id="game-canvas"
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
        />

        {/* Interaction Tooltip (Center Screen) */}
        <AnimatePresence>
          {interactionTarget && !activeDialog && !activeDocument && !isViewingPC && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-1/2 left-1/2 -translate-x-1/2 -translate-y-12 lg:translate-y-10 bg-white text-black px-6 py-2 font-bold text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce z-20 whitespace-nowrap"
              style={{ fontFamily: '"Arial Black", sans-serif' }}
            >
              [E] {interactionTarget.type === 'door' ? 'ABRIR' : 'INTERACTUAR'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Modal Overlay (The "Hoja de Papel") */}
        <AnimatePresence>
          {activeDocument && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 p-8"
            >
              <div 
                className="bg-[#FDF5E6] border-[6px] border-[#8B4513] p-8 max-w-lg w-full h-[350px] overflow-y-auto shadow-2xl relative"
                style={{ 
                  fontFamily: '"Times New Roman", serif', 
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e5e5e5 28px)',
                  backgroundAttachment: 'local'
                }}
              >
                <div className="absolute top-2 right-4 text-xs font-bold font-sans text-gray-500 uppercase tracking-widest border border-gray-400 px-2 py-1 rounded bg-[#FDF5E6]">
                   Presiona [E] o [ESC] para cerrar
                </div>
                {activeDocument.docContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pokémon Style Dialog Box (Bottom) */}
        <AnimatePresence>
          {activeDialog && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-1/2 translate-y-24 lg:bottom-4 left-4 right-4 border-[6px] border-[#303030] bg-[#F8F8F8] p-6 h-32 rounded-lg shadow-xl z-40"
            >
              <div className="text-[#303030] text-lg sm:text-xl leading-relaxed flex flex-col h-full justify-between">
                <p>{activeDialog.obj.pages && activeDialog.obj.pages[activeDialog.page]}</p>
                <div className="flex justify-end items-center gap-2 text-xs font-bold text-gray-400">
                  <span>Página {activeDialog.page + 1}/{activeDialog.obj.pages?.length}</span>
                  <motion.div 
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Mobile Touch Controls - FIXED OVERLAYS (Inside Game Container) */}
        {!isViewingPC && (
          <div className="lg:hidden absolute inset-0 pointer-events-none z-[100] flex justify-between items-end pb-4 px-4 sm:px-8">
            {/* Mobile Left D-Pad - Hidden while interacting/dialogue */}
            {!activeDialog && !activeDocument && (
              <div className="flex flex-col items-center gap-1 pointer-events-auto">
                  <button 
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-lg border-b-2 border-black/30 active:border-b-0 active:translate-y-1 text-white text-xl flex items-center justify-center select-none"
                    onTouchStart={(e) => { e.preventDefault(); keysRef.current['arrowup'] = true; }}
                    onTouchEnd={(e) => { e.preventDefault(); keysRef.current['arrowup'] = false; }}
                    onMouseDown={(e) => { e.preventDefault(); keysRef.current['arrowup'] = true; }}
                    onMouseUp={(e) => { e.preventDefault(); keysRef.current['arrowup'] = false; }}
                  >▲</button>
                  <div className="flex gap-1">
                    <button 
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-lg border-b-2 border-black/30 active:border-b-0 active:translate-y-1 text-white text-xl flex items-center justify-center select-none"
                      onTouchStart={(e) => { e.preventDefault(); keysRef.current['arrowleft'] = true; }}
                      onTouchEnd={(e) => { e.preventDefault(); keysRef.current['arrowleft'] = false; }}
                      onMouseDown={(e) => { e.preventDefault(); keysRef.current['arrowleft'] = true; }}
                      onMouseUp={(e) => { e.preventDefault(); keysRef.current['arrowleft'] = false; }}
                    >◀</button>
                    <button 
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-lg border-b-2 border-black/30 active:border-b-0 active:translate-y-1 text-white text-xl flex items-center justify-center select-none"
                      onTouchStart={(e) => { e.preventDefault(); keysRef.current['arrowdown'] = true; }}
                      onTouchEnd={(e) => { e.preventDefault(); keysRef.current['arrowdown'] = false; }}
                      onMouseDown={(e) => { e.preventDefault(); keysRef.current['arrowdown'] = true; }}
                      onMouseUp={(e) => { e.preventDefault(); keysRef.current['arrowdown'] = false; }}
                    >▼</button>
                    <button 
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-lg border-b-2 border-black/30 active:border-b-0 active:translate-y-1 text-white text-xl flex items-center justify-center select-none"
                      onTouchStart={(e) => { e.preventDefault(); keysRef.current['arrowright'] = true; }}
                      onTouchEnd={(e) => { e.preventDefault(); keysRef.current['arrowright'] = false; }}
                      onMouseDown={(e) => { e.preventDefault(); keysRef.current['arrowright'] = true; }}
                      onMouseUp={(e) => { e.preventDefault(); keysRef.current['arrowright'] = false; }}
                    >▶</button>
                  </div>
              </div>
            )}

            {/* Mobile Right Action Buttons */}
            <div className="flex gap-2 sm:gap-4 items-end pointer-events-auto ml-auto">
                <button 
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600/50 backdrop-blur-sm rounded-full border-b-2 border-red-900/50 active:border-b-0 active:translate-y-1 text-white font-bold text-[10px] sm:text-xs tracking-widest shadow-lg select-none flex items-center justify-center"
                  onPointerDown={(e) => { e.preventDefault(); handleActionKey('escape'); }}
                >
                  ESC
                </button>
                <button 
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/50 backdrop-blur-sm rounded-full border-b-2 border-blue-900/50 active:border-b-0 active:translate-y-1 text-white font-bold text-xl sm:text-2xl shadow-lg mb-2 select-none flex items-center justify-center"
                  onPointerDown={(e) => { e.preventDefault(); handleActionKey('keye'); }}
                >
                  E
                </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 flex items-center gap-8 text-[#555] opacity-50 hover:opacity-100 transition-opacity hidden lg:flex">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-black">INTERACTIVE</span>
          <span className="tracking-[0.4em] text-[10px]">PORTFOLIO ENGINE</span>
        </div>
        <div className="h-12 w-px bg-[#555]" />
        <div className="text-left text-xs space-y-1">
          <p>© 2026 ÁLVARO FERNÁNDEZ</p>
          <p>BUILT WITH CANVAS + REACT</p>
        </div>
      </div>

      {/* Desktop Controls Legend */}
      <div className="hidden lg:flex mt-12 gap-12 text-[#999] text-[10px] tracking-widest bg-black/20 px-8 py-3 rounded-full border border-white/5 relative z-50">
          <div className="flex items-center gap-2">
            <span className="bg-[#444] px-2 py-1 rounded text-white font-bold">WASD / ARROWS</span>
            <span>MOVEMENT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#444] px-2 py-1 rounded text-white font-bold">E / SPACE</span>
            <span>INTERACT / NEXT</span>
          </div>
      </div>

      {/* Mobile Portrait Warning Overlay */}
      {!dismissedRotate && (
        <div className="lg:hidden portrait:flex landscape:hidden fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex-col items-center justify-center p-8 text-center transition-all duration-500">
          <div className="w-24 h-24 mb-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
             <motion.div animate={{ rotate: 90 }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1, ease: 'easeInOut' }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                 <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                 <path d="M12 18h.01" />
               </svg>
             </motion.div>
          </div>
          <h2 className="text-2xl font-black mb-3 text-white tracking-[0.2em]">GIRA TU DISPOSITIVO</h2>
          <p className="text-[#888] text-sm max-w-[280px] leading-relaxed mb-10">
            Para disfrutar de la experiencia completa y usar los controles correctamente, pon tu móvil en modo horizontal.
          </p>

          <button 
            className="text-[#666] text-xs underline decoration-[#444] underline-offset-4 hover:text-white transition-colors"
            onClick={() => setDismissedRotate(true)}
          >
            Continuar en vertical de todos modos
          </button>
        </div>
      )}

    </div>
  );
}
