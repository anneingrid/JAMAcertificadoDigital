import React, { useContext, useEffect, useState } from 'react';
import { FaKey } from 'react-icons/fa';
import { AppContext } from '../back/Provider';
import { MutatingDots } from 'react-loader-spinner';

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
      <h2><FaKey /> Chave</h2>
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
      ) : (
        <>
          <h5>Chave pública gerada!</h5>
          <p className='dados'>{chavePublica}</p>
        </>
      )}
    </div>
  );
};

export default GeradorDeChaves;
