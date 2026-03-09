import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAdminProps {
    children: React.ReactNode;
}

/**
 * Wraps any admin-only route.
 * - While auth is loading: render nothing (App-level spinner handles it).
 * - Unauthenticated: redirect to /auth/login.
 * - Authenticated but NOT admin: redirect to /feed (role mismatch).
 * - Authenticated admin: render children.
 */
const RequireAdmin = ({ children }: RequireAdminProps) => {
    const { authStatus, isAdmin } = useAuth();

    if (authStatus === 'loading') return null;

    if (authStatus === 'unauthenticated') {
        return <Navigate to="/auth/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/feed" replace />;
    }

    return <>{children}</>;
};

export default RequireAdmin;
