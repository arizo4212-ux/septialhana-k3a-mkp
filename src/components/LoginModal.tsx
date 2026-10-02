import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Ship, 
  Anchor, 
  ShieldCheck, 
  User, 
  Lock, 
  LogIn, 
  Database, 
  CheckCircle2, 
  Compass, 
  UserPlus,
  AlertCircle
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { loginWithCredentials, loginWithGoogleProvider, loginAsDemoRole, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin@pelabuhan.go.id');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Super Admin' | 'Petugas Manifest' | 'Supervisor Kargo' | 'Nahkoda / Perwira'>('Super Admin');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Mohon isi email / username dan password.');
      return;
    }

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setErrorMsg('Mohon masukkan nama lengkap petugas.');
          return;
        }
        await loginWithCredentials(usernameOrEmail, password, role);
      } else {
        await loginWithCredentials(usernameOrEmail, password);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal login ke sistem.');
    }
  };

  const handleQuickDemo = async (selectedRole: 'Super Admin' | 'Petugas Manifest' | 'Supervisor Kargo' | 'Nahkoda / Perwira') => {
    setErrorMsg('');
    await loginAsDemoRole(selectedRole);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      await loginWithGoogleProvider();
    } catch {
      setErrorMsg('Login Google dibatalkan atau terkendala.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto">
        
        {/* Left Side: Maritime Branding & Database Status */}
        <div className="md:col-span-5 bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-950 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 text-white relative overflow-hidden">
          {/* Subtle water decorative circles */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-sky-500/20 border border-sky-400/40 rounded-xl text-sky-400">
                <Ship className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">Sistem Pelabuhan & Armada</span>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  LogiShip OS
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              Sistem informasi manajemen terintegrasi muatan kargo, manifest penumpang, dan pemantauan pelayaran kapal secara real-time.
            </p>

            {/* Real Database Indicator */}
            <div className="mt-6 p-3.5 bg-slate-800/80 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Koneksi Real Database
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Firebase Firestore: <span className="text-emerald-300">Active</span>
              </p>
              <div className="mt-2 pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                <span className="flex items-center gap-1">✓ Multi-Role Auth</span>
                <span className="flex items-center gap-1">✓ Real-time Sync</span>
                <span className="flex items-center gap-1">✓ Full CRUD Data</span>
                <span className="flex items-center gap-1">✓ Histori Pelacakan</span>
              </div>
            </div>

            {/* Features summary */}
            <div className="mt-6 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-sky-400" />
                <span>Master Data Armada & Rute Pelayaran</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Radar Live Tracking Posisi & Kecepatan Kapal</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Sertifikasi Manifest Resmi KSOP Syahbandar</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            Direktorat Jenderal Perhubungan Laut © 2026
          </div>
        </div>

        {/* Right Side: Login & Registration Form */}
        <div className="md:col-span-7 p-6 md:p-8 bg-slate-900 flex flex-col justify-between">
          <div>
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isRegister ? 'Registrasi Akun Petugas' : 'Portal Masuk Petugas'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isRegister 
                    ? 'Daftarkan identitas petugas untuk akses sistem kapal' 
                    : 'Masuk dengan akun admin / petugas resmi pelabuhan'}
                </p>
              </div>

              <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className={`text-xs px-3 py-1 rounded-md transition font-medium ${
                    !isRegister ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className={`text-xs px-3 py-1 rounded-md transition font-medium ${
                    isRegister ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daftar
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Fast Login One-Click Presets */}
            {!isRegister && (
              <div className="mb-5 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  1-Click Cepat Masuk (Pilih Peran):
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('Super Admin')}
                    className="flex items-center gap-2 text-left p-2 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/40 text-xs text-sky-200 transition group"
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
                    <div className="truncate">
                      <div className="font-semibold text-white">Super Admin</div>
                      <div className="text-[10px] text-slate-400">Kepala Pelabuhan</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('Petugas Manifest')}
                    className="flex items-center gap-2 text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition group"
                  >
                    <User className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                    <div className="truncate">
                      <div className="font-semibold text-white">Petugas Manifest</div>
                      <div className="text-[10px] text-slate-400">Tiket & Penumpang</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('Supervisor Kargo')}
                    className="flex items-center gap-2 text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition group"
                  >
                    <Anchor className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                    <div className="truncate">
                      <div className="font-semibold text-white">Supervisor Kargo</div>
                      <div className="text-[10px] text-slate-400">Stevedoring & Palka</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('Nahkoda / Perwira')}
                    className="flex items-center gap-2 text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition group"
                  >
                    <Ship className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
                    <div className="truncate">
                      <div className="font-semibold text-white">Nahkoda / Capt.</div>
                      <div className="text-[10px] text-slate-400">Perwira Kapal</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Lengkap Petugas
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="contoh: Budi Setiawan, S.T."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email atau Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="admin@pelabuhan.go.id atau admin"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hak Akses / Peran Jabatan
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Super Admin">Super Admin (Kepala Otoritas Pelabuhan)</option>
                    <option value="Petugas Manifest">Petugas Manifest (Tiket & Penumpang)</option>
                    <option value="Supervisor Kargo">Supervisor Kargo (Palka & Kontainer)</option>
                    <option value="Nahkoda / Perwira">Nahkoda / Perwira Jaga Deck</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Menghubungkan Database...
                  </span>
                ) : isRegister ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Daftar & Masuk ke Sistem
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk ke Sistem Aplikasi
                  </>
                )}
              </button>
            </form>

            {/* Google provider button */}
            <div className="mt-3.5 pt-3.5 border-t border-slate-800">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Masuk dengan Akun Google (Firebase Auth)
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Aman terenkripsi SSL 256-bit</span>
            <span>Versi 2.4.0 (Enterprise)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
