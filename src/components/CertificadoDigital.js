import React, { useState, useContext, useEffect } from 'react';
import { FaCertificate } from 'react-icons/fa';
import { AppContext } from '../back/Provider';
import { MutatingDots } from 'react-loader-spinner';

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
  }, [usuarioLogado.id_usuario, usuarioLogado.nome_usuario, buscarUsuarioPorId]);

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
    <div>
      <h2><FaCertificate /> Certificado Digital</h2>

      {carregando ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MutatingDots
            visible={true}
            height="100"
            width="100"
            color="#df003b95"
            secondaryColor="#df003b95"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      ) : dadosCertificado ? (
        <div>
          <h5>Certificado Existente</h5>
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
          <button type="submit" className="primary-btn" onClick={criarCertificado}>Criar Certificado</button>
        </div>
      )}
    </div>
  );
};

export default CertificadoDigital;
