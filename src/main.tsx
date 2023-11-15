import { render } from 'preact';
import { App } from './app.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import {SocketProvider} from './context/socketContext.tsx'

render(
    <AuthProvider>
        <SocketProvider>
        <App />
        </SocketProvider>
    </AuthProvider>,
    document.getElementById('app')!
);
