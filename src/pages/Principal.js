import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../back/Provider';
import GeradorDeChaves from '../components/GeradorDeChaves';
import Assinatura from '../components/Assinatura';
import CertificadoDigital from '../components/CertificadoDigital';
import Menu from '../components/Menu';
import Navbar from '../components/Navbar';

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

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'GeradorDeChaves':
        return <GeradorDeChaves />;
      case 'Assinatura':
        return <Assinatura />;
      case 'CertificadoDigital':
        return <CertificadoDigital />;
      default:
        return <GeradorDeChaves />;
    }
  };

  return (
    <div className="principal-container">
      <Navbar visible={showNavbar} />
      <Menu setActiveScreen={setActiveScreen} handleLogout={handleLogout} />
      <div className="principal-content">
        {renderActiveScreen()}
      </div>
    </div>
  );
}

export default Principal;
