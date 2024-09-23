import React, { useContext, useState } from 'react';
import { FaKey } from 'react-icons/fa';
import {AppContext} from '../back/Provider'

const GeradorDeChaves = () => {
  const { cadastrarUsuario, buscarUuidPorNome, certificado } = useContext(AppContext);
  const nomeTeste = 'UsuarioTeste';
  const cadastrar = async () => {
    const dados = await cadastrarUsuario(nomeTeste, 'user@exemplo.com', '1234');
    // if (dados.error) {
    //   alert('Erro ao cadastrar usuário:', dados.error);
    // } else {
    //   alert(dados.sucess)
    // }
  }
  const certificar = async () => {
    const uuid = await buscarUuidPorNome(nomeTeste);
    console.log(uuid);
    const resultado = await certificado(uuid);
    console.log(resultado);
  }
  return (
    <div>
      <h2><FaKey /> Cadastrar</h2>
      <button onClick={cadastrar} className="primary-btn">Novo Usuário</button>
      <button onClick={certificar} className="primary-btn">Certificado</button>

    </div>
  );
};

export default GeradorDeChaves;
