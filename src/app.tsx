import Router from 'preact-router';
import './app.css';
import Register from './pages/Register/Register';
import Main from './pages/main/Main';
import { useEffect } from 'preact/hooks';
import { token, userDetails } from './signals/AuthSignals';
import { LocalStorage } from './utils';

export function App() {
    useEffect(() => {
        token.value = LocalStorage.get('tojen');
        userDetails.value = LocalStorage.get('user');
    }, []);

    return (
        <>
            <Router>
                <Register path="/login" isRegistered />
                <Register path="/register" />
                <Main path="/chat" />
            </Router>
        </>
    );
}
