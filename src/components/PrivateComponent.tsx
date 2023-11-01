import { ReactNode } from 'preact/compat';
import { route } from 'preact-router';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const shouldNavigate = true;
    if (shouldNavigate) {
        route('/login', true);
        return null;
    }
    return children;
};

export default PrivateRoute;
