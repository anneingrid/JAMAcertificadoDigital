import React, { useState, useContext, useEffect } from 'react';
import { FaCertificate } from 'react-icons/fa';
import { AppContext } from '../back/Provider';

const CertificadoDigital = () => {
  const { usuarioLogado, certificado, buscarUsuarioPorId } = useContext(AppContext);
  const [dadosCertificado, setDadosCertificado] = useState(null);

  useEffect(() => {
    const verificarCertificado = async () => {
      const usuario = await buscarUsuarioPorId(usuarioLogado.id_usuario);
      if (usuario && usuario.certificadoDados) {
        setDadosCertificado(usuario.certificadoDados);
      }
    };

    verificarCertificado();
  }, [usuarioLogado.nome_usuario, buscarUsuarioPorId]);

  const certificar = async () => {
    const resultado = await certificado(usuarioLogado.id_usuario, usuarioLogado.nome_usuario);
    if (resultado) {
      setDadosCertificado(resultado);
    }
  };


  const criarCertificado = (e) => {
    e.preventDefault();
    certificar();
  };

  return (
    <div>
      <h2><FaCertificate /> Criar Certificado Digital</h2>

      {dadosCertificado ? (
        <div>
          <h5>Certificado Existente</h5>
          <div className="dados">
            <div className="dados"><strong>Número de Série:</strong> {dadosCertificado.serialNumber}</div>

            <div className="dados"><strong>Emissor: </strong>JAMA Certificado Digital</div>
            <div className="dados"><strong>Nome Completo:</strong> {dadosCertificado.commonName}</div>
            <div className="dados"><strong>País: </strong>{dadosCertificado.country}</div>
            <div className="dados"><strong>Estado:</strong> {dadosCertificado.state}</div>
            <div className="dados"><strong>Cidade: </strong>{dadosCertificado.locality}</div>
            <div className="dados"><strong>Data de Início:</strong> {dadosCertificado.validity.notBefore}</div>
            <div className="dados"><strong>Data de Término: </strong>{dadosCertificado.validity.notAfter}</div>
          </div>
        </div>
      ) : (

        <button type="submit" className="primary-btn" onClick={criarCertificado}>Criar Certificado</button>

      )}
    </div>
  );
};

export default CertificadoDigital;
