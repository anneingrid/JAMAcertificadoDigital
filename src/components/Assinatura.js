import React, { useState } from 'react';
import { FaFileSignature } from 'react-icons/fa';

const Assinatura = () => {
  const [signature, setSignature] = useState('');
  const [document, setDocument] = useState('');

  const assinarDocumento = () => {
    setSignature('Assinatura digital gerada...');
  };

  return (
    <div>
      <h2><FaFileSignature /> Assinar Documento</h2>
      <textarea
        placeholder="Digite o conteúdo do documento"
        value={document}
        onChange={(e) => setDocument(e.target.value)}
      />
      <button className="primary-btn" onClick={assinarDocumento}>Assinar Documento</button>
      {signature && (
        <div>
          <h3>Assinatura Digital</h3>
          <textarea value={signature} readOnly rows={5} />
        </div>
      )}
    </div>
  );
};

export default Assinatura;
