import Router from 'preact-router';
import './app.css';
import Register from './pages/Register/Register';
import Main from './pages/main/Main';

export function App() {
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
