import React, { useContext, useEffect, useState } from 'react';
import { FaKey } from 'react-icons/fa';
import { AppContext } from '../back/Provider'

const GeradorDeChaves = () => {
  const { cadastrarUsuario, usuarioLogado, certificado, buscarChavePublica } = useContext(AppContext);
  const [chavePublica, setChavePublica] = useState('');
  const certificar = async () => {
    const resultado = await certificado(usuarioLogado.id_usuario);
    console.log(resultado);
  }
  useEffect(() => {
    const chave = async () => {
      const chavePublica = await buscarChavePublica(usuarioLogado.id_usuario);
      setChavePublica(chavePublica);
    }
    chave()
  }, [usuarioLogado]);
  return (
    <div>
      <h2><FaKey /> Cadastrar</h2>
      <h5>Chave pública gerada</h5>
      <p className='dados'>{chavePublica}</p>
      <button onClick={certificar} className="primary-btn">Certificado</button>

    </div>
  );
};

export default GeradorDeChaves;
