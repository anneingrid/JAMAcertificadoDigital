import React from 'react';
import GeradorDeChaves from './components/GeradorDeChaves';
import CertificadoDigital from './components/CertificadoDigital';
import Assinatura from './components/Assinatura';
import './App.css';
import SeletorDeArquivos from './components/Arquivos';

function App() {
  return (
    <div className="App">
      <h1>JAMA Certificado Digital </h1>
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
      <div>
        <SeletorDeArquivos/>
      </div>
    </div>
  );
}

export default App;
