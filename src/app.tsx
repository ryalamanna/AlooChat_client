import Router , {route} from 'preact-router';
import './app.css';
import Register from './pages/Register/Register';
import Chat from './pages/main/Chat';
import { useAuth } from './context/AuthContext';
import { UserInterface } from './interfaces/user';
import { useEffect } from 'preact/hooks';

export function App() {
    const { token, user } = useAuth();
    
    return (
        <>
            <Router>
                <AuthComp path='/' token={token} user={user}/>
                <Register path="/login" isRegistered />
                <Register path="/register" />
                <Chat path="/chat" />
            </Router>
        </>
    );
}


const AuthComp = ({path , token , user}:{path:string , token :string | null, user : UserInterface | null}) =>{
    console.log(path);
    
    useEffect(() => {
        if(token && user?._id){
            console.log('auth');
            console.log(token);
            console.log( user._id);
            route('/chat', true);
        } else {
            route('/login',true);
        }
    },[])
     
    return null;
}