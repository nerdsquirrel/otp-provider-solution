import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
    const [username, setUsername] = useState(null);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (!token) {
            setUsername(null);
            setRoles([]);
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const name = payload.unique_name || payload.name || payload.sub || null;
            const r = payload.role
                ? Array.isArray(payload.role) ? payload.role : [payload.role]
                : [];
            setUsername(name);
            setRoles(r);
        } catch {
            setUsername(null);
            setRoles([]);
        }
    }, [token]);

    const login = (jwt) => {
        localStorage.setItem('auth_token', jwt);
        setToken(jwt);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            username,
            roles,
            isAuthenticated: !!token,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}