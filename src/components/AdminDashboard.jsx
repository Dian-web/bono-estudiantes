import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LogOut, DollarSign, UserX, RefreshCw, UserPlus, X, Snowflake, Sun, GraduationCap } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [modalError, setModalError] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Estado para los colores del cubo de Rubik interactivo
  const [cubeColors, setCubeColors] = useState([
    '#B71234', '#FFD500', '#0046AD', 
    '#009B48', '#E6E7EE', '#FF5800', 
    '#FF5800', '#0046AD', '#B71234'
  ]);

  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
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

  const shuffleCube = () => {
    playCreamyClick();
    const palette = ['#B71234', '#FFD500', '#0046AD', '#009B48', '#FF5800', '#E6E7EE'];
    const monoColors = ['#0046AD', '#B71234', '#009B48', '#FF5800', '#FFD500'];
    
    if (Math.random() < 0.25) {
      const mono = monoColors[Math.floor(Math.random() * monoColors.length)];
      setCubeColors(Array(9).fill(mono));
    } else {
      setCubeColors(Array.from({ length: 9 }, () => palette[Math.floor(Math.random() * palette.length)]));
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('full_name', { ascending: true });
    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const addPayment = async (studentId) => {
    playCreamyClick();
    const { error } = await supabase.from('payments').insert([
      { student_id: studentId, amount: 400, status: 'paid', payment_date: new Date().toISOString().split('T')[0] }
    ]);
    if (error) alert("Error al registrar pago: " + error.message);
    else fetchStudents();
  };

  const toggleFreeze = async (student) => {
    playCreamyClick();
    const funcName = student.bonus_status === 'frozen' ? 'unfreeze_student' : 'freeze_student';
    const { error } = await supabase.rpc(funcName, { p_student_id: student.id });
    if (error) alert("Error: " + error.message);
    fetchStudents();
  };

  const coverTuition = async (student) => {
    playCreamyClick();
    const maxUsable = Math.min(student.bonus_amount, 1750);
    
    if (maxUsable <= 0) {
      alert("El estudiante no tiene saldo en su bono.");
      return;
    }

    const confirmText = maxUsable === 1750 
      ? `¿Cubrir colegiatura completa ($1,750) usando el bono de ${student.full_name}?`
      : `El bono actual es de $${student.bonus_amount}. ¿Usuarlo para cubrir parcialmente la colegiatura ($${maxUsable} de $1,750)?`;

    if(!confirm(confirmText)) return;

    const { error } = await supabase.rpc('use_bonus_for_tuition', { 
      p_student_id: student.id, 
      p_amount: 1750 
    });
    
    if (error) alert("Error al usar el bono: " + error.message);
    else fetchStudents();
  };

  const generateCertificate = (studentName) => {
    const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `
      <!DOCTYPE html><html><head><title>Reconocimiento</title>
      <style>
        body { font-family: Georgia, serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }
        .cert { background: white; padding: 60px; border: 10px solid #e6e7ee; box-shadow: 0 0 20px rgba(0,0,0,0.1); text-align: center; width: 80%; }
        h1 { color: #4a5568; font-size: 3rem; margin-bottom: 10px; }
        h2 { color: #6b7280; font-weight: normal; font-size: 1.5rem; }
        .name { font-size: 2.5rem; color: #3b82f6; margin: 40px 0; border-bottom: 2px solid #e6e7ee; display: inline-block; padding-bottom: 10px; }
        p { color: #4a5568; line-height: 1.6; font-size: 1.2rem; }
      </style></head><body>
        <div class="cert">
          <h1>Reconocimiento Oficial</h1>
          <h2>Por concluir satisfactoriamente el programa</h2>
          <div class="name">${studentName}</div>
          <p>La administración otorga este reconocimiento por haber finalizado su carrera y completado exitosamente su proceso de titulación.</p>
          <br><br>
          <p><strong>Fecha de emisión:</strong> ${date}</p>
        </div>
      </body></html>`;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-10000px';
    document.body.appendChild(printFrame);
    printFrame.contentDocument.write(html);
    printFrame.contentDocument.close();
    
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      document.body.removeChild(printFrame);
    }, 500);
  };

  const unsubscribe = async (student) => {
    if(!confirm(`¿Dar de baja definitiva a ${student.full_name}? Se generará un reconocimiento y se eliminará su registro por completo.`)) return;
    playCreamyClick();
    generateCertificate(student.full_name);
    
    const { error } = await supabase.rpc('delete_student', { p_student_id: student.id });
    if (error) alert("Error al dar de baja: " + error.message);
    else fetchStudents();
  };

  const handleLogout = async () => {
    playCreamyClick();
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setModalError('');
    playCreamyClick();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPass,
        options: { data: { full_name: newName } }
      });

      if (error) throw error;

      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      setShowModal(false);
      setNewName(''); setNewEmail(''); setNewPass('');
      fetchStudents();
      
    } catch (error) {
      setModalError(error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 neu-bg font-sans text-gray-600 relative overflow-hidden">
      
      {/* FONDO CUBO DE RUBIK (Opacidad 50% y z-0 para que sea visible sobre el fondo) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg style={{ position: 'absolute', top: '5%', left: '10%', opacity: 0.5, transform: 'rotate(15deg)', filter: 'blur(4px)' }} width="250" height="250" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="15" fill="#B71234" />
        </svg>
        <svg style={{ position: 'absolute', bottom: '10%', right: '5%', opacity: 0.5, transform: 'rotate(-10deg)', filter: 'blur(5px)' }} width="300" height="300" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="#0046AD" />
        </svg>
        <svg style={{ position: 'absolute', top: '40%', right: '25%', opacity: 0.5, transform: 'rotate(45deg)', filter: 'blur(3px)' }} width="150" height="150" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="10" fill="#FFD500" />
        </svg>
        <svg style={{ position: 'absolute', bottom: '30%', left: '15%', opacity: 0.5, filter: 'blur(4px)' }} width="180" height="180" viewBox="0 0 100 100">
          <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="#009B48" />
        </svg>
        <svg style={{ position: 'absolute', top: '15%', right: '10%', opacity: 0.5, filter: 'blur(3px)' }} width="120" height="120" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="#FF5800" />
        </svg>
      </div>

      {/* MODAL AGREGAR ESTUDIANTE */}
      {showModal && (
        <div className="neu-overlay" onClick={() => setShowModal(false)}>
          <div className="neu-modal neu-card p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-700">Nuevo Estudiante</h3>
              <button onClick={() => setShowModal(false)} className="neu-btn p-2 rounded-lg text-gray-400 hover:text-red-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Nombre Completo</label>
                <input type="text" className="neu-input" placeholder="Ej: Diego García" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Correo Electrónico</label>
                <input type="email" className="neu-input" placeholder="correo@dominio.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Contraseña Temporal</label>
                <input type="password" className="neu-input" placeholder="Mínimo 6 caracteres" value={newPass} onChange={(e) => setNewPass(e.target.value)} minLength="6" required />
              </div>
              {modalError && <p className="text-red-500 text-sm font-medium">{modalError}</p>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="neu-btn flex-1 py-3 rounded-xl text-gray-500">Cancelar</button>
                <button type="submit" disabled={creating} className="neu-btn neu-btn-blue flex-1 py-3 rounded-xl text-blue-500 font-semibold disabled:opacity-50">
                  {creating ? 'Creando...' : 'Crear Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navbar Superior Neumorphic */}
      <nav className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-6 neu-card relative z-10">
        <div className="flex items-center gap-4">
          {/* CUBO DE RUBIK INTERACTIVO */}
          <button onClick={shuffleCube} className="neu-btn p-2 rounded-xl cursor-pointer" title="¡Haz clic para mezclar!">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-700 tracking-tight">Panel de Administración</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Gestión de Bonos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => { playCreamyClick(); setShowModal(true); }} className="neu-btn neu-btn-green px-5 py-3 rounded-xl text-sm flex items-center gap-2">
            <UserPlus size={18} /> Agregar Estudiante
          </button>
          <button onClick={fetchStudents} className="neu-btn p-3 rounded-xl text-gray-500 hover:text-blue-500" title="Refrescar datos">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleLogout} className="neu-btn neu-btn-red px-5 py-3 rounded-xl text-sm flex items-center gap-2">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenedor Principal */}
      <div className="p-6 md:p-8 neu-card relative z-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-lg font-semibold text-gray-500">Registros de Estudiantes</h2>
          <span className="text-sm text-gray-400">{students.length} Usuarios</span>
        </div>
        
        <div className="neu-table-container p-4 md:p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400 font-medium">Cargando estudiantes...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b border-gray-300/50">
                  <th className="py-4 px-4 font-medium">Estudiante</th>
                  <th className="py-4 px-4 font-medium hidden md:table-cell">Correo</th>
                  <th className="py-4 px-4 font-medium text-center">Bono</th>
                  <th className="py-4 px-4 font-medium text-center hidden sm:table-cell">Meses</th>
                  <th className="py-4 px-4 font-medium text-center">Estado</th>
                  <th className="py-4 px-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map(st => (
                  <tr key={st.id} className="border-b border-gray-300/30 hover:bg-gray-200/30 transition">
                    <td className="py-4 px-4 font-semibold text-gray-700">{st.full_name}</td>
                    <td className="py-4 px-4 text-gray-500 hidden md:table-cell text-sm">{st.email}</td>
                    <td className="py-4 px-4 text-center font-bold text-indigo-500">
                      ${st.bonus_amount}
                      <span className="block text-[10px] font-normal text-gray-400">de $7,200</span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 hidden sm:table-cell">{st.consecutive_months}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`neu-badge ${st.bonus_status === 'active' ? 'text-green-600' : st.bonus_status === 'frozen' ? 'text-blue-600' : 'text-red-600'}`}>
                        {st.bonus_status === 'active' ? 'Activo' : st.bonus_status === 'frozen' ? 'Congelado' : 'Perdido'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button onClick={() => addPayment(st.id)} className="neu-btn neu-btn-green px-4 py-2 rounded-xl text-xs flex items-center gap-1" title="Registrar pago y sumar $200 al bono">
                          <DollarSign size={14} /> Pago
                        </button>
                        
                        <button 
                          onClick={() => toggleFreeze(st)} 
                          className={`neu-btn ${st.bonus_status === 'frozen' ? 'neu-btn-green' : 'neu-btn-blue'} px-4 py-2 rounded-xl text-xs flex items-center gap-1`} 
                          title={st.bonus_status === 'frozen' ? 'Reactivar estudiante' : 'Congelar bono'}
                        >
                          {st.bonus_status === 'frozen' ? <Sun size={14} /> : <Snowflake size={14} />}
                          {st.bonus_status === 'frozen' ? 'Activar' : 'Congelar'}
                        </button>

                        <button 
                          onClick={() => coverTuition(st)} 
                          className="neu-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1 text-yellow-600"
                          title="Usar bono acumulado para pagar colegiatura (Total o parcial)"
                        >
                          <GraduationCap size={14} /> Colegiatura
                        </button>

                        <button onClick={() => unsubscribe(st)} className="neu-btn neu-btn-red px-4 py-2 rounded-xl text-xs flex items-center gap-1" title="Dar de baja y generar reconocimiento">
                          <UserX size={14} /> Baja
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {students.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400 font-medium">No hay estudiantes registrados.</div>
          )}
        </div>
      </div>
    </div>
  );
}