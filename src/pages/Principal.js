import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../back/Provider';
import GeradorDeChaves from '../components/GeradorDeChaves';
import NovoArquivo from '../components/NovoArquivo';
import CertificadoDigital from '../components/CertificadoDigital';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import ListaDocumentos from '../components/Documentos';
import ListaDocumentosAssinados from '../components/DocsAssinados';
import Footer from '../components/Footer';



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
    <div >
      <div className="header-wrapper">
        <span className="text-center mb-4 cadeado">
          <img src="/logo.png" alt="JAMA Certificado" className="cadeado-image" />
        </span>
        <div className="logo-container text-center mb-4">
          <span className="jama-text">JAMA</span><br />
          <span className="certificado-text">Certificado Digital</span>
        </div>
        <div className="divider mb-4"></div>
        <div className="header-container text-center">
          <h3 className='title-nome'>Olá, <span className="login-link">{usuarioLogado.nome_usuario}</span>!</h3>
          <button onClick={handleLogout} className="primary logout-button">
            <FaArrowRightFromBracket /> SAIR
          </button>
        </div>
      </div>

      <div className="cards-container">
        <div className="cardi">
          <GeradorDeChaves />
        </div>
        <div className="cardi">
          <CertificadoDigital />
        </div>
        <div className="cardi">
          <NovoArquivo />
        </div>
      </div>
      <div className="cards-container">
        <div className="card-lista">
          <ListaDocumentos />
        </div>
        <div className="card-lista">
          <ListaDocumentosAssinados></ListaDocumentosAssinados>
        </div>
      </div>
      <div>
        <Footer></Footer>
      </div>
    </div>
  );
}

export default Principal;
