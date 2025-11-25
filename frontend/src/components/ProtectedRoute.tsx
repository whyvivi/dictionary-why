import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * 路由守卫组件
 * 未登录用户访问受保护路由时,自动重定向到登录页
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
    if (!isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
