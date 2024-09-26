import React, { useState, useContext, useEffect } from 'react';
import { FaCertificate } from 'react-icons/fa';
import { AppContext } from '../back/Provider';

const CertificadoDigital = () => {
  const { usuarioLogado, certificado, buscarUsuarioPorId } = useContext(AppContext);
  const [dadosCertificado, setDadosCertificado] = useState(null);
  const [carregandu, setCarregandu] = useState(true);

  useEffect(() => {
    const verificarCertificado = async () => {
      setCarregandu(true);
      const usuario = await buscarUsuarioPorId(usuarioLogado.id_usuario);
      if (usuario && usuario.certificadoDados) {
        setDadosCertificado(usuario.certificadoDados);
      }
      setCarregandu(false);
    };

    verificarCertificado();
  }, [usuarioLogado.id_usuario, usuarioLogado.nome_usuario, buscarUsuarioPorId]);

  const certificar = async () => {
    setCarregandu(true);
    const resultado = await certificado(usuarioLogado.id_usuario, usuarioLogado.nome_usuario);
    if (resultado) {
      setDadosCertificado(resultado);
    }
    setCarregandu(false);
  };

  const criarCertificado = (e) => {
    e.preventDefault();
    certificar();
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString();
  };

  return (
    <div>
      <span className="hdois"><FaCertificate className='iconTop'/> Certificado Digital</span>

      {carregandu ? (
        <div className="placeholder-glow" style={{ margin: '20px 0', padding: '10px' }}>
          <p className="placeholder col-12" style={{ height: '16px' }}></p>
          <p className="placeholder col-11" style={{ height: '16px' }}></p>
          <p className="placeholder col-8" style={{ height: '16px' }}></p>
          <p className="placeholder col-6" style={{ height: '16px' }}></p>
          <p className="placeholder col-6" style={{ height: '16px' }}></p>
          <p className="placeholder col-6" style={{ height: '16px' }}></p>
          <p className="placeholder col-7" style={{ height: '16px' }}></p>
          <p className="placeholder col-7" style={{ height: '16px' }}></p>
        </div>
      ) : dadosCertificado ? (
        <div>
          <h5 className='hcinco'>Certificado Existente</h5>
          <div className="dados">
            <div className="dados"><strong>Número de Série:</strong> {dadosCertificado.serialNumber}</div>
            <div className="dados"><strong>Emissor: </strong>JAMA Certificado Digital</div>
            <div className="dados"><strong>Nome Completo:</strong> {dadosCertificado.commonName}</div>
            <div className="dados"><strong>País: </strong>{dadosCertificado.country}</div>
            <div className="dados"><strong>Estado:</strong> {dadosCertificado.state}</div>
            <div className="dados"><strong>Cidade: </strong>{dadosCertificado.locality}</div>
            <div className="dados"><strong>Data de Início:</strong> {formatarData(dadosCertificado.validity.notBefore)}</div>
            <div className="dados"><strong>Data de Término: </strong>{formatarData(dadosCertificado.validity.notAfter)}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" className="primary-butao" onClick={criarCertificado}>Criar Certificado</button>
        </div>
      )}
    </div>
  );
};

export default CertificadoDigital;
