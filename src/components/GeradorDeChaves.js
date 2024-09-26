import React, { useContext, useEffect, useState } from 'react';
import { FaKey } from 'react-icons/fa';
import { AppContext } from '../back/Provider';

const GeradorDeChaves = () => {
  const { usuarioLogado, buscarChavePublica } = useContext(AppContext);
  const [chavePublica, setChavePublica] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const chave = async () => {
      setCarregando(true);
      const chavePublica = await buscarChavePublica(usuarioLogado.id_usuario);
      setChavePublica(chavePublica);
      setCarregando(false);
    };
    chave();
  }, [usuarioLogado]);

  return (
    <div>
      <span className="hdois"><FaKey className='iconTop' /> Chave</span>
      {carregando ? (
        <div className="placeholder-glow" style={{ margin: '20px 0', padding: '10px' }}>
          <p className="placeholder col-8" style={{ height: '16px' }}></p>
          <p className="placeholder col-10" style={{ height: '16px' }}></p>
          <p className="placeholder col-12" style={{ height: '16px' }}></p>
          <p className="placeholder col-12" style={{ height: '16px' }}></p>
          <p className="placeholder col-12" style={{ height: '16px' }}></p>
        </div>
      ) : (
        <>
          <h5 className='hcinco'>Chave pública gerada!</h5>
          <p className='dados' style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 9,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxHeight: 'calc(1.2em * 9)',
          }}>{chavePublica}</p>
        </>
      )}
    </div>
  );
};

export default GeradorDeChaves;
