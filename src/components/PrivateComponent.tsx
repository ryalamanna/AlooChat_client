import { ReactNode, useEffect } from 'preact/compat';
import { route } from 'preact-router';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const { token, user } = useAuth();
    var shouldNavigate = true;
    if(token && user?._id){
        shouldNavigate = false;
    }
    if (shouldNavigate) {
        route('/login', true);
        return null;
    }
    return children;
};

export default PrivateRoute;
