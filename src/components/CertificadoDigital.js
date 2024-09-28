import React, { useState, useContext, useEffect } from 'react';
import { FaCertificate } from 'react-icons/fa';
import { AppContext } from '../back/Provider';

const CertificadoDigital = () => {
  const { usuarioLogado, certificado, buscarUsuarioPorId } = useContext(AppContext);
  const [dadosCertificado, setDadosCertificado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const verificarCertificado = async () => {
      setCarregando(true);
      const usuario = await buscarUsuarioPorId(usuarioLogado.id_usuario);
      if (usuario && usuario.certificadoDados) {
        setDadosCertificado(usuario.certificadoDados);
      }
      setCarregando(false);
    };

    verificarCertificado();
  }, [usuarioLogado.id_usuario]);

  const certificar = async () => {
    setCarregando(true);
    const resultado = await certificado(usuarioLogado.id_usuario, usuarioLogado.nome_usuario);
    if (resultado) {
      setDadosCertificado(resultado);
    }
    setCarregando(false);
  };

  const criarCertificado = (e) => {
    e.preventDefault();
    certificar();
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString();
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <span className="hdois" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <FaCertificate className='iconTop'/> Certificado Digital
      </span>

      {carregando ? (
        <div className="placeholder-glow" style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <p className="placeholder col-12" style={{ height: '20px', borderRadius: '5px' }}></p>
          <p className="placeholder col-11" style={{ height: '20px', borderRadius: '5px' }}></p>
          <p className="placeholder col-8" style={{ height: '20px', borderRadius: '5px' }}></p>
          <p className="placeholder col-6" style={{ height: '20px', borderRadius: '5px' }}></p>
          <p className="placeholder col-6" style={{ height: '20px', borderRadius: '5px' }}></p>
          <p className="placeholder col-6" style={{ height: '20px', borderRadius: '5px' }}></p>
        </div>
      ) : dadosCertificado ? (
        <div>
          <div className="dados" style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
            <div className="dados" ><strong>Número de Série:</strong> {dadosCertificado.serialNumber}</div>
            <div className="dados" ><strong>Emissor: </strong>JAMA Certificado Digital</div>
            <div className="dados" ><strong>Nome Completo:</strong> {dadosCertificado.commonName}</div>
            <div className="dados" ><strong>País: </strong>{dadosCertificado.country}</div>
            <div className="dados" ><strong>Estado:</strong> {dadosCertificado.state}</div>
            <div className="dados" ><strong>Cidade: </strong>{dadosCertificado.locality}</div>
            <div className="dados" ><strong>Data de Início:</strong> {formatarData(dadosCertificado.validity.notBefore)}</div>
            <div className="dados" ><strong>Data de Término: </strong>{formatarData(dadosCertificado.validity.notAfter)}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
          <p style={{ color: '#7a7a7a' }}>Nenhum certificado encontrado. Deseja criar um novo?</p>
          <button type="submit" className="primary-butao" style={{ padding: '10px 20px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer' }} onClick={criarCertificado}>
            Criar Certificado
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificadoDigital;
