import { render } from 'preact';
import { App } from './app.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';

render(
    <AuthProvider>
        <App />
    </AuthProvider>,
    document.getElementById('app')!
);
