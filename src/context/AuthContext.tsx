import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser } from '../types';
import { auth, ensureFirebaseAuth, loginWithGoogle, logoutFirebase } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithCredentials: (emailOrUser: string, pass: string, role?: string) => Promise<boolean>;
  loginWithGoogleProvider: () => Promise<boolean>;
  loginAsDemoRole: (role: 'Super Admin' | 'Petugas Manifest' | 'Supervisor Kargo' | 'Nahkoda / Perwira') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'logiship_auth_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local session
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }

    // Monitor Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        if (!user && fbUser.email) {
          const autoUser: AppUser = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            role: fbUser.email.includes('admin') ? 'Super Admin' : 'Petugas Manifest',
            port: 'Tanjung Priok (Jakarta)',
            avatar: fbUser.photoURL || undefined,
            isFirebaseAuthenticated: true
          };
          setUser(autoUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(autoUser));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithCredentials = async (emailOrUser: string, pass: string, chosenRole?: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Connect to Firebase backend session so rules permit operations
      await ensureFirebaseAuth();

      let detectedRole: AppUser['role'] = 'Petugas Manifest';
      if (chosenRole) {
        detectedRole = chosenRole as AppUser['role'];
      } else if (emailOrUser.toLowerCase().includes('admin')) {
        detectedRole = 'Super Admin';
      } else if (emailOrUser.toLowerCase().includes('kargo') || emailOrUser.toLowerCase().includes('cargo')) {
        detectedRole = 'Supervisor Kargo';
      } else if (emailOrUser.toLowerCase().includes('nahkoda') || emailOrUser.toLowerCase().includes('capt')) {
        detectedRole = 'Nahkoda / Perwira';
      }

      const displayName = emailOrUser.includes('@') 
        ? emailOrUser.split('@')[0].replace(/[._]/g, ' ').toUpperCase()
        : emailOrUser.toUpperCase();

      const newUser: AppUser = {
        id: 'usr-' + Date.now().toString(36),
        name: displayName,
        email: emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@pelabuhan.go.id`,
        role: detectedRole,
        port: 'Tanjung Priok (Jakarta)',
        isFirebaseAuthenticated: true
      };

      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Login failed', err);
      setLoading(false);
      return false;
    }
  };

  const loginWithGoogleProvider = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const fbUser = await loginWithGoogle();
      const newUser: AppUser = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Pengguna Google',
        email: fbUser.email || 'google_user@pelabuhan.go.id',
        role: 'Super Admin',
        port: 'Tanjung Priok (Jakarta)',
        avatar: fbUser.photoURL || undefined,
        isFirebaseAuthenticated: true
      };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Google login error', err);
      setLoading(false);
      return false;
    }
  };

  const loginAsDemoRole = async (role: 'Super Admin' | 'Petugas Manifest' | 'Supervisor Kargo' | 'Nahkoda / Perwira') => {
    setLoading(true);
    await ensureFirebaseAuth();
    
    const rolePresets: Record<typeof role, { name: string; email: string; port: string }> = {
      'Super Admin': {
        name: 'Capt. H. Bambang Subagyo (Kepala Otoritas Pelabuhan)',
        email: 'admin.utama@pelabuhan.go.id',
        port: 'Tanjung Priok (Jakarta)'
      },
      'Petugas Manifest': {
        name: 'Siti Nurhaliza (Petugas Pelayanan & Tiket)',
        email: 'petugas.manifest@pelabuhan.go.id',
        port: 'Tanjung Perak (Surabaya)'
      },
      'Supervisor Kargo': {
        name: 'Dodi Hermawan (Supervisor Stevedoring & Palka)',
        email: 'cargo.spv@pelabuhan.go.id',
        port: 'Pelabuhan Soekarno-Hatta (Makassar)'
      },
      'Nahkoda / Perwira': {
        name: 'Capt. Hendra Wicaksono, M.Mar (Nahkoda KM Kelimutu)',
        email: 'nahkoda.kelimutu@pelabuhan.go.id',
        port: 'Armada KM Kelimutu'
      }
    };

    const preset = rolePresets[role];
    const demoUser: AppUser = {
      id: 'demo-' + role.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: preset.name,
      email: preset.email,
      role: role,
      port: preset.port,
      isFirebaseAuthenticated: true
    };

    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    setLoading(false);
  };

  const logout = async () => {
    await logoutFirebase();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithCredentials,
        loginWithGoogleProvider,
        loginAsDemoRole,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
