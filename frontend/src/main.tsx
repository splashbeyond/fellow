import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// Show helpful error message instead of crashing
if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'your_clerk_publishable_key_here') {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#E4E4DE',
      color: '#1B1B1B'
    }}>
      <h1 style={{ marginBottom: '1rem' }}>⚠️ Missing Clerk Configuration</h1>
      <p style={{ marginBottom: '1rem', textAlign: 'center', maxWidth: '600px' }}>
        Please add your Clerk Publishable Key to the <code>.env</code> file in the frontend directory.
      </p>
      <div style={{ 
        backgroundColor: '#C4C5BA', 
        padding: '1rem', 
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        maxWidth: '600px',
        width: '100%'
      }}>
        <p style={{ marginBottom: '0.5rem' }}>Create <code>frontend/.env</code> with:</p>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`VITE_SIGNALING_SERVER_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here`}
        </pre>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#595F39' }}>
        See <code>CLERK_SETUP.md</code> for instructions on getting your Clerk key.
      </p>
    </div>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  );
}

