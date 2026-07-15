import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Importación añadida
import { supabase } from '../lib/supabaseClient';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate(); // <-- Hook añadido
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado para los colores del cubo de Rubik interactivo
  const [cubeColors, setCubeColors] = useState([
    '#B71234', '#FFD500', '#0046AD', 
    '#009B48', '#ffffff', '#FF5800', 
    '#FF5800', '#0046AD', '#B71234'
  ]);

  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playCreamyClick = () => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.08);
    
    const osc2 = ctx.createOscillator(), gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(150, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(); osc2.start();
    osc.stop(ctx.currentTime + 0.15); osc2.stop(ctx.currentTime + 0.15);
  };

  // Lógica para mezclar el cubo
  const shuffleCube = () => {
    playCreamyClick();
    const palette = ['#B71234', '#FFD500', '#0046AD', '#009B48', '#FF5800', '#ffffff'];
    const monoColors = ['#0046AD', '#B71234', '#009B48', '#FF5800', '#FFD500'];
    
    if (Math.random() < 0.25) {
      const mono = monoColors[Math.floor(Math.random() * monoColors.length)];
      setCubeColors(Array(9).fill(mono));
    } else {
      setCubeColors(Array.from({ length: 9 }, () => palette[Math.floor(Math.random() * palette.length)]));
    }
  };

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    playCreamyClick();
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
    } else {
      // ESTO ES LO QUE FALTABA: Redirigir al dashboard
      navigate('/'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans" style={{ backgroundColor: '#1e222a' }}>
      
      {/* Fondo de Vectores Estilo Cubo de Rubik */}
      <div className="vector-bg">
        <svg className="vector-shape animate-twinkle" style={{ top: '15%', left: '10%', animationDelay: '0s', opacity: 0.15 }} width="120" height="120" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="15" fill="#B71234" />
        </svg>
        <svg className="vector-shape" style={{ top: '60%', left: '15%', animationDelay: '3s', opacity: 0.15 }} width="150" height="150" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="#0046AD" />
        </svg>
        <svg className="vector-shape animate-twinkle" style={{ top: '20%', right: '10%', animationDelay: '5s', opacity: 0.15 }} width="140" height="140" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="#FFD500" />
        </svg>
        <svg className="vector-shape" style={{ bottom: '15%', right: '5%', animationDelay: '2s', opacity: 0.15 }} width="130" height="130" viewBox="0 0 100 100">
          <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="#009B48" />
        </svg>
        <svg className="vector-shape animate-twinkle" style={{ top: '45%', left: '50%', animationDelay: '7s', opacity: 0.1 }} width="90" height="90" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="10" fill="#FF5800" transform="rotate(45 50 50)" />
        </svg>
      </div>

      {/* Tarjeta de Cristal (Liquid Glass) */}
      <div 
        className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-3xl flex flex-col items-center"
        style={{ 
          background: 'rgba(255, 255, 255, 0.08)', 
          backdropFilter: 'blur(20px) saturate(180%)', 
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* CUBO DE RUBIK INTERACTIVO */}
        <button 
          onClick={shuffleCube} 
          className="mb-6 p-3 rounded-2xl cursor-pointer transition-transform hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
          title="¡Haz clic para mezclar!"
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="7" height="7" rx="2" fill={cubeColors[0]} style={{ transition: 'fill 0.4s ease' }} />
            <rect x="9" y="1" width="7" height="7" rx="2" fill={cubeColors[1]} style={{ transition: 'fill 0.4s ease' }} />
            <rect x="17" y="1" width="7" height="7" rx="2" fill={cubeColors[2]} style={{ transition: 'fill 0.4s ease' }} />
            <rect x="1" y="9" width="7" height="7" rx="2" fill={cubeColors[3]} style={{ transition: 'fill 0.4s ease' }} />
            <rect x="9" y="9" width="7" height="7" rx="2" fill={cubeColors[4]} style={{ transition: 'fill 0.4s ease' }} />
            <rect x="17" y="9" width="7" height="7" rx="2" fill={cubeColors[5]} style={{ transition: 'fill 0.4s ease' }} />
            <rect x="1" y="17" width="7" height="7" rx="2" fill={cubeColors[6]} style={{ transition: 'fill 0.4s ease' }} />
            <rect x="9" y="17" width="7" height="7" rx="2" fill={cubeColors[7]} style={{ transition: 'fill 0.4s ease' }} />
            <rect x="17" y="17" width="7" height="7" rx="2" fill={cubeColors[8]} style={{ transition: 'fill 0.4s ease' }} />
          </svg>
        </button>

        {/* Puedes cambiar "TitulaCube" por el nombre que elijas */}
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2 text-center">
          TitulaCube
        </h2>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Ingresa a tu plataforma de gestión
        </p>

        {error && (
          <div className="w-full mb-4 flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="email" 
              placeholder="Correo Electrónico" 
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              <>
                <LogIn size={20} /> Iniciar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}