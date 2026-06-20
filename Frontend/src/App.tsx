import { ErrorBoundary } from 'react-error-boundary';
import './App.css'
import ErrorFallback from './components/MyError.tsx';
import { Route, Routes } from 'react-router';
import { PageIndex } from './components/PageIndex.tsx';
import { PageGebiet } from './components/PageGebiet.tsx';
import { PageThema } from './components/PageThema.tsx';
import { PageAdmin } from './components/PageAdmin.tsx';
import { PagePrefs } from './components/PagePrefs.tsx';
import Header from './components/Header.tsx';
import { useEffect, useState } from 'react';
import { LoginContext} from './LoginContext.ts';
import { getLogin } from './backend/api.ts';
import { LoginResource } from './Resources.ts';


function App() {

    const [login, setLogin] = useState<LoginResource| false | undefined>(undefined);

    useEffect(() => {
        async function fetchLogin() {
            const currentLoginInfo = await getLogin();
            setLogin(currentLoginInfo);
        }
        fetchLogin();
    }, [])


    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <LoginContext value={ { login, setLogin } }>
            <Header></Header>
            <div className="App">
                <Routes>
                    <Route path="/" element={<PageIndex />} />
                    <Route path="/gebiet/:id" element={<PageGebiet />} />
                    <Route path="/gebiet/:gebietId/thema/:id" element={<PageThema />} /> 
                    <Route path="/thema/:id" element={<PageThema />} />
                    <Route path="/admin" element={<PageAdmin />} />
                    <Route path="/prefs" element={<PagePrefs />} />
                    <Route path="*" element={<PageIndex />} />
                </Routes>
            </div>
            </LoginContext>
        </ErrorBoundary>
    );
}

export default App
