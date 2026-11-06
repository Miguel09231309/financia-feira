import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

(window as unknown as { __feiraBooted?: boolean }).__feiraBooted = true;
createRoot(document.getElementById('root')!).render(<App />);
