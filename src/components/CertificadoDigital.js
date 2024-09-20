import React, { useState } from 'react';
import { FaCertificate } from 'react-icons/fa';

const CertificadoDigital = () => {
  const [certificate, setCertificate] = useState('');
  const [formData, setFormData] = useState({
    country: 'BR',
    state: 'TO',
    locality: 'Palmas',
    organization: 'JAMA Certificado Digital',
    commonName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const criarCertificado = (e) => {
    e.preventDefault();
    const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    setCertificate(`
      -------CERTIFICADO-------
      Nome do País: ${formData.country}
      Estado: ${formData.state}
      Localidade: ${formData.locality}
      Organização: ${formData.organization}
      Nome Completo: ${formData.commonName}
      Data de Início: ${formData.startDate}
      Data de Término: ${endDate}
      -------------------------
    `);
  };

  return (
    <div>
      <h2><FaCertificate /> Criar Certificado Digital</h2>
      <form onSubmit={criarCertificado}>
        <label>Nome Completo:</label>
        <input
          type="text"
          name="commonName"
          value={formData.commonName}
          onChange={handleChange}
          placeholder="Seu Nome"
          required
        />
        <button type="submit" className="primary-btn">Criar Certificado</button>
      </form>
      {certificate && (
        <div>
          <h3>Certificado Gerado</h3>
          <textarea value={certificate} readOnly rows={10} />
        </div>
      )}
    </div>
  );
};

export default CertificadoDigital;
