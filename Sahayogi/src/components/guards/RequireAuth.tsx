import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
    children: React.ReactNode;
}

/**
 * Wraps any route that needs a logged-in user.
 * - While auth is loading: render nothing (App-level spinner handles it).
 * - Unauthenticated: hard-redirect to /auth/login.
 * - Authenticated: render children.
 */
const RequireAuth = ({ children }: RequireAuthProps) => {
    const { authStatus } = useAuth();
    const location = useLocation();

    if (authStatus === 'loading') return null;

    if (authStatus === 'unauthenticated') {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
};

export default RequireAuth;
