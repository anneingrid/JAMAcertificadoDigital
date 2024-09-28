import React, { useContext, useEffect, useState } from 'react';
import { FaKey, FaCopy } from 'react-icons/fa';
import { AppContext } from '../back/Provider';
import { Accordion, Toast, Placeholder, Spinner } from 'react-bootstrap';

const GeradorDeChaves = () => {
  const { usuarioLogado, buscarChavePublica} = useContext(AppContext);
  const [chavePublica, setChavePublica] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const chave = async () => {
      setCarregando(true);
      const chavePublica = await buscarChavePublica(usuarioLogado.id_usuario);
      setChavePublica(chavePublica);
      setCarregando(false);
    };
    chave();
  }, [usuarioLogado]);

  const copiarChave = () => {
    navigator.clipboard.writeText(chavePublica);
    setShowToast(true);
  };

  return (
    <div >
      <span className="hdois" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <FaKey className='iconTop' /> Chave Pública
      </span>

      {carregando ? (
        <div className="placeholder-glow" style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#eaeaea' }}>
          <p className="placeholder col-8" style={{ height: '20px', borderRadius: '5px', backgroundColor: '#d6d6d6' }}></p>
          <p className="placeholder col-10" style={{ height: '20px', borderRadius: '5px', backgroundColor: '#d6d6d6' }}></p>
          <p className="placeholder col-12" style={{ height: '20px', borderRadius: '5px', backgroundColor: '#d6d6d6' }}></p>
          <p className="placeholder col-12" style={{ height: '20px', borderRadius: '5px', backgroundColor: '#d6d6d6' }}></p>
          <p className="placeholder col-12" style={{ height: '20px', borderRadius: '5px', backgroundColor: '#d6d6d6' }}></p>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <p className='dados' style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 9,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxHeight: 'calc(1.2em * 12)',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#333',
              padding:20
            }}>{chavePublica}</p>
            <button onClick={copiarChave} className='primary-butao' style={{
              position: 'absolute',
              top: '10px',
              right: '10px',

            }}>
              <FaCopy style={{ fontSize: '16px' }} /> Copiar
            </button>
          </div>
        </>
      )}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={5000}
        autohide
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          minWidth: '300px',
          zIndex: 9999
        }}
      >
        <Toast.Header closeButton={true}>
          <strong className="me-auto">Notificação</strong>
        </Toast.Header>
        <Toast.Body> Chave pública copiada!</Toast.Body>
      </Toast>
    </div>
  );
};

export default GeradorDeChaves;
