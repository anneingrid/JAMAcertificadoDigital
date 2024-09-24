import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../back/Provider'
import { FaFileSignature } from 'react-icons/fa';

const Assinatura = () => {
  const { usuarioLogado, assinar } = useContext(AppContext);

  const [signature, setSignature] = useState('');
  const [document, setDocument] = useState('');
  const [conteudoArquivo, setConteudoArquivo] = useState(null);
  const [editandoNovoArquivo, setEditandoNovoArquivo] = useState(false);
  const [novoConteudo, setNovoConteudo] = useState('');

  
  const assinarDocumento = async () => {
    try {
        const resultado = await assinar(1,usuarioLogado.id_usuario, conteudoArquivo);
        if (resultado) {
            setSignature('Assinatura digital gerada com sucesso!');
        } else {
            setSignature('Erro ao gerar a assinatura.');
        }
    } catch (error) {
        console.error('Erro ao assinar o documento:', error.message);
        setSignature('Erro ao assinar o documento.');
    }

};
  const abrirArquivo = async () => {
    try {
      // Solicita ao usuário para abrir um arquivo
      const [arquivoSelecionado] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Arquivos de Texto',
            accept: {
              'text/plain': ['.txt'],
            },
          },
          {
            description: 'Arquivos PDF',
            accept: {
              'application/pdf': ['.pdf'],
            },
          },
          {
            description: 'Arquivos JSON',
            accept: {
              'application/json': ['.json'],
            },
          },
          {
            description: 'Documentos Word',
            accept: {
              'application/msword': ['.doc'], // Para arquivos .doc
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], // Para arquivos .docx
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });
      const arquivo = await arquivoSelecionado.getFile();
      const textoDoArquivo = await arquivo.text();

      setConteudoArquivo(textoDoArquivo);
      setEditandoNovoArquivo(false); // Garante que a área de texto para o novo arquivo feche
    } catch (erro) {
      console.error('Erro ao abrir o arquivo:', erro);
    }
  };

  const salvarArquivo = async () => {
    try {
      const arquivoParaSalvar = await window.showSaveFilePicker({
        suggestedName: 'novoArquivo.txt',
      });
      const fluxoGravacao = await arquivoParaSalvar.createWritable();
      await fluxoGravacao.write(novoConteudo || 'Texto padrão');
      await fluxoGravacao.close();

      // Após salvar o arquivo, exibe o conteúdo digitado na tela
      setConteudoArquivo(novoConteudo);
      setEditandoNovoArquivo(false); // Fecha a área de texto ao salvar o arquivo
    } catch (erro) {
      console.error('Erro ao salvar o arquivo:', erro);
    }
  };

  const criarNovoArquivo = () => {
    setEditandoNovoArquivo(true); // Abre a área de texto para criar um novo arquivo
    setNovoConteudo(''); // Limpa o conteúdo da área de texto
    setConteudoArquivo(null); // Limpa o conteúdo do arquivo anterior (se houver)
  };

  return (
    <div>
      <h2><FaFileSignature /> Assinar Documento</h2>
      <div className="alinharBotoes">
        <button onClick={abrirArquivo} className="primary-btn">Abrir Arquivo</button>
        <button onClick={criarNovoArquivo} className="primary-btn">Novo Arquivo</button>
      </div>
      <div className="alinharBotoes">
        {conteudoArquivo && (
          <div>
            <h3>Conteúdo do Arquivo:</h3>
            <pre>{conteudoArquivo}</pre>
          </div>
        )}
        {editandoNovoArquivo && (
          <div>
            <h3>Novo Arquivo:</h3>
            <textarea
              value={novoConteudo}
              onChange={(e) => setNovoConteudo(e.target.value)}
              rows={10}
              placeholder="Digite o conteúdo do novo arquivo aqui..."
            />
            <button onClick={salvarArquivo} className="primary-btn">Salvar Arquivo</button>
          </div>
        )}
      </div>
      <div className="alinharBotoes">
        <button className="primary-btn-assinar" onClick={assinarDocumento}>Assinar Documento</button> 
      </div>
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
