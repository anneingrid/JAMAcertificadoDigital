import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../back/Provider';
import GeradorDeChaves from '../components/GeradorDeChaves';
import Assinatura from '../components/Assinatura';
import CertificadoDigital from '../components/CertificadoDigital';
import Login from './Login';


function Principal() {
  const { usuarioLogado, logout } = useContext(AppContext);
  const [showNavbar, setShowNavbar] = useState(true);
  const [activeScreen, setActiveScreen] = useState('GeradorDeChaves');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavbar(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
console.log(usuarioLogado.nome_usuario)

  return (
    <div className="App">
      <h1>JAMA Certificado Digital </h1>
      <h3 className='title-nome'>Seja bem vindo, <span className="login-link">{usuarioLogado.nome_usuario}</span>! </h3>

      <button onClick={handleLogout}> SAIR </button>
      <div className="cards-container">
        <div className="card">
          <GeradorDeChaves />
        </div>
        <div className="card">
          <CertificadoDigital />
        </div>
        <div className="card">
          <Assinatura />
        </div>
      </div>
    </div>
  );
}

export default Principal;
