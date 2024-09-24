import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../back/Provider';
import GeradorDeChaves from '../components/GeradorDeChaves';
import Assinatura from '../components/Assinatura';
import CertificadoDigital from '../components/CertificadoDigital';
import { FaArrowRightFromBracket } from 'react-icons/fa6';



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

  return (
    <div className="App">
      <div >
        <h2 className="text-center mb-6 cadeado">
          <img src="/logo.png" alt="JAMA Certificado" className="cadeado-image" />
        </h2>
        <div className="logo-container">
          <span className="jama-text">JAMA</span><br />
          <span className="certificado-text">Certificado Digital</span>
        </div>

      </div>
      <div className="divider"></div>
      <div className="header-container">
        <h3 className='title-nome'>Olá, <span className="login-link">{usuarioLogado.nome_usuario}</span>! </h3>
        <button onClick={handleLogout} className="primary"> <FaArrowRightFromBracket /> SAIR </button>
      </div>

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
