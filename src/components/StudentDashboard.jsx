import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { LogOut, MessageCircle, Sparkles, X } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState('');
  const [hasPlayedSuccess, setHasPlayedSuccess] = useState(false);
  const [showClaimButton, setShowClaimButton] = useState(false);
  const [showVictoryText, setShowVictoryText] = useState(false);
  const [showIsland, setShowIsland] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  useEffect(() => {
    getRandomPhrase();
    const timer = setTimeout(() => setShowIsland(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getRandomPhrase = async () => {
    const { data } = await supabase.from('motivational_phrases').select('*');
    if (data && data.length > 0) {
      setPhrase(data[Math.floor(Math.random() * data.length)].phrase);
    }
  };

  const playClickSound = () => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  };

  const playSuccessSound = () => {
    const ctx = getAudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  };

  useEffect(() => {
    if (profile && profile.bonus_amount >= 7200 && !hasPlayedSuccess) {
      playSuccessSound();
      setHasPlayedSuccess(true);
      
      // 1. El destello ocurre inmediatamente (dura 1s)
      // 2. Esperamos 2 segundos (1s del destello + 1s de pausa dramática) para el texto
      setTimeout(() => setShowVictoryText(true), 2000);
      // 3. El botón aparece 1.5s después del texto
      setTimeout(() => setShowClaimButton(true), 3500);
      
    } else if (profile && profile.bonus_amount < 7200) {
      setHasPlayedSuccess(false);
      setShowClaimButton(false);
      setShowVictoryText(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleLogout = async () => {
    playClickSound();
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!profile) return <div className="min-h-screen flex justify-center items-center">Cargando...</div>;

  const progress = Math.min((profile.bonus_amount / 7200) * 100, 100);
  const progress01 = Math.min(profile.bonus_amount / 7200, 1);
  const isComplete = progress01 >= 1;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progress / 100) * circumference;

  const scatter = 1 - progress01;
  const rot = scatter * 180;  

  const shards = [
    { id: 1, x: `-${scatter * 50}vw`, y: `-${scatter * 50}vh`, r: -rot },
    { id: 2, x: `${scatter * 50}vw`,  y: `-${scatter * 50}vh`, r: rot },
    { id: 3, x: `-${scatter * 50}vw`, y: `${scatter * 50}vh`,  r: -rot },
    { id: 4, x: `${scatter * 50}vw`,  y: `${scatter * 50}vh`,  r: rot },
    { id: 5, x: 0,                    y: `-${scatter * 60}vh`, r: rot*0.5 },
    { id: 6, x: `${scatter * 60}vw`,  y: 0,                    r: -rot*0.5 },
    { id: 7, x: 0,                    y: `${scatter * 60}vh`,  r: rot*0.5 },
    { id: 8, x: `-${scatter * 60}vw`, y: 0,                    r: -rot*0.5 }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      
      {/* ISLA DINÁMICA - LIQUID GLASS */}
      {showIsland && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-islandExpand">
          <div 
            className="flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border border-white/30 cursor-pointer max-w-[90vw]"
            onClick={() => setShowIsland(false)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)', 
              backdropFilter: 'blur(20px) saturate(180%)', 
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="bg-gradient-to-r from-blue-400/80 to-purple-500/80 p-2 rounded-full flex-shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <p className="text-sm font-medium text-white truncate italic" style={{ fontFamily: 'Georgia, serif' }}>
              "{phrase}"
            </p>
            <X size={16} className="text-white/70 hover:text-white flex-shrink-0" />
          </div>
        </div>
      )}

      {/* EFECTO ÉPICO AL 100% */}
      {isComplete && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center flex-col">
          {/* 1. Destello inmediato */}
          <div className="absolute inset-0 bg-white animate-flash"></div>
          
          {/* 2. Texto de felicitaciones (Aparece a los 2s, centrado verticalmente) */}
          {showVictoryText && (
            <div className="relative text-center animate-epicZoom">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-blue-300 drop-shadow-lg">
                ¡FELICIDADES!
              </h1>
              <p className="text-lg md:text-2xl text-white font-bold mt-2 drop-shadow-md">
                Has alcanzado tu bono máximo de titulación
              </p>
            </div>
          )}

          {/* 3. Botón de reclamar (Aparece a los 3.5s, posicionado abajo del centro) */}
          {showClaimButton && (
            <a 
              href="https://wa.me/5215546697272?text=COMPLETE%20MI%20PROCESO%20estoy%20listo%20para%20reclamar%20mi%20premio" 
              target="_blank" 
              rel="noreferrer"
              onClick={playClickSound}
              className="absolute bottom-[25%] pointer-events-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full text-xl shadow-lg hover:scale-105 transition-transform animate-fadeInUp flex items-center gap-2"
            >
              <MessageCircle size={24} />
              Reclama tu bono
            </a>
          )}
        </div>
      )}

      {/* FONDO CON VECTORES (3 Capas para Profundidad y Parallax) */}
      
      {/* Capa 1: Fondo Profundo (Opacos, estáticos) */}
      <div className="vector-bg" style={{ transform: 'scale(1.2)' }}>
        <svg className="vector-shape" style={{ top: '20%', left: '30%', animationDelay: '0s', opacity: 0.08 }} width="250" height="250" viewBox="0 0 100 100">
          <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="var(--rubik-green)" />
        </svg>
        <svg className="vector-shape" style={{ top: '60%', left: '70%', animationDelay: '4s', opacity: 0.08 }} width="300" height="300" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="var(--rubik-blue)" />
        </svg>
      </div>

      {/* Capa 2: Medio (Opacidad media, parallax lento) */}
      <div className="vector-bg parallax-layer" style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` }}>
        <svg className="vector-shape" style={{ top: '15%', left: '10%', animationDelay: '2s' }} width="120" height="120" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="15" fill="var(--rubik-red)" />
        </svg>
        <svg className="vector-shape" style={{ top: '70%', left: '20%', animationDelay: '5s' }} width="150" height="150" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="var(--rubik-yellow)" />
        </svg>
        <svg className="vector-shape animate-twinkle" style={{ top: '40%', right: '15%', animationDelay: '1s' }} width="100" height="100" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="10" fill="var(--rubik-orange)" transform="rotate(45 50 50)" />
        </svg>
      </div>

      {/* Capa 3: Frontal (Brillantes, parallax rápido) */}
      <div className="vector-bg parallax-layer" style={{ transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)` }}>
        <svg className="vector-shape animate-twinkle" style={{ top: '25%', right: '25%', animationDelay: '0s', opacity: 0.6 }} width="60" height="60" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="var(--rubik-white)" />
        </svg>
        <svg className="vector-shape animate-twinkle" style={{ bottom: '30%', left: '40%', animationDelay: '3s', opacity: 0.5 }} width="80" height="80" viewBox="0 0 100 100">
          <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="var(--rubik-red)" />
        </svg>
        <svg className="vector-shape animate-twinkle" style={{ top: '10%', left: '60%', animationDelay: '6s', opacity: 0.7 }} width="40" height="40" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="5" fill="var(--rubik-yellow)" transform="rotate(30 50 50)" />
        </svg>
      </div>

      {/* Navbar Superior */}
      <nav className="flex justify-between items-center p-6 relative z-20 w-full">
        <h1 className="text-lg md:text-xl font-bold tracking-tight">Bono de Titulación</h1>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-sm hover:opacity-70 transition cursor-pointer"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </nav>

      {/* CONTENIDO PRINCIPAL CENTRADO */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-20">
        <div className="card flex flex-col items-center justify-center text-center animate-fadeInUp w-full max-w-2xl" style={{ background: 'rgba(30, 34, 42, 0.6)', overflow: 'visible' }}>
          <h2 className="text-base md:text-lg font-semibold opacity-80 mb-6">Mi Bono Acumulado</h2>
          
          <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 200 200" className="absolute inset-0 -rotate-90 z-0">
              <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
              <circle 
                cx="100" cy="100" r="80" 
                stroke={isComplete ? '#FFD700' : 'var(--rubik-blue)'} strokeWidth="4" fill="none" 
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
              />
            </svg>

            <svg className="absolute inset-0 w-full h-full overflow-visible z-20" viewBox="-50 -50 100 100" style={{ pointerEvents: 'none' }}>
              <defs>
                <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#74b9ff" stopOpacity="0.7" />
                </linearGradient>
              </defs>

              <circle cx="0" cy="0" r={4 + (progress01 * 8)} fill="url(#crystalGrad)" opacity={progress01 * 0.7} style={{ transition: 'all 0.5s ease' }} />

              {shards.map((shard) => (
                <g
                  key={shard.id}
                  style={{
                    transform: `translate(${shard.x}, ${shard.y}) rotate(${shard.r}deg)`,
                    transition: 'transform 1s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                >
                  <path d="M0,-10 L4,0 L0,10 L-4,0 Z" fill="url(#crystalGrad)" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
                  <path d="M-1,-6 L1,-3 L0,0 L-2,-3 Z" fill="white" opacity="0.9" />
                </g>
              ))}
            </svg>

            <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${isComplete ? 'animate-crystalPulse' : ''}`}>
              <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md">
                ${profile.bonus_amount}
              </span>
              <span className="text-xs opacity-60 mt-1">de $7,200 MXN</span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium border ${
            profile.bonus_status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
            profile.bonus_status === 'frozen' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {profile.bonus_status === 'active' ? '🟢 Bono Activo' : 
             profile.bonus_status === 'frozen' ? '🧊 Bono Congelado' : '🔴 Bono Perdido'}
          </div>
        </div>
      </div>

      {/* BURBUJA FLOTANTE WHATSAPP */}
      <a 
        href="https://wa.me/5215546697272" 
        target="_blank" 
        rel="noreferrer"
        onClick={playClickSound}
        className="fixed bottom-6 right-6 z-30 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center text-white animate-floatBubble hover:scale-110 transition-transform cursor-pointer"
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
}