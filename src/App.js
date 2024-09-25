import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import GeradorDeChaves from './components/GeradorDeChaves';
import { AppContext } from '../src/back/Provider';
import CertificadoDigital from './components/CertificadoDigital';
import NovoArquivo from './components/NovoArquivo';
import './App.css';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Principal from './pages/Principal';


function App() {
  const { usuarioLogado, logout } = useContext(AppContext);
  const [isAuthenticated, setIsAuthenticated] = useState(!!usuarioLogado);

  useEffect(() => {
    setIsAuthenticated(!!usuarioLogado);
  }, [usuarioLogado]);


  return (
    <Router>

      <Routes>

        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/Principal" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/Cadastro" element={<Cadastro />} />
        <Route
          path="/Principal"
          element={isAuthenticated ? <Principal /> : <Navigate to="/" />} />
        <Route
          path="/GeradorDeChaves"
          element={isAuthenticated ? <GeradorDeChaves /> : <Navigate to="/" />} />

        <Route
          path="/CertificadoDigital"
          element={isAuthenticated ? <CertificadoDigital /> : <Navigate to="/" />} />

        <Route
          path="/NovoArquivo"
          element={isAuthenticated ? <NovoArquivo /> : <Navigate to="/" />} />

      </Routes>
    </Router>

  );
}

export default App;
