import React, { useState } from 'react';
import { FaFileSignature } from 'react-icons/fa';

const Assinatura = () => {
  const [signature, setSignature] = useState('');
  const [document, setDocument] = useState('');
  const [conteudoArquivo, setConteudoArquivo] = useState(null);

  const assinarDocumento = () => {
    setSignature('Assinatura digital gerada...');
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

          // { Não sei se é necessário aceitar, no nosso contexto
          //     description: 'Imagens',
          //     accept: {
          //         'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
          //     },
          // }

        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });
      const arquivo = await arquivoSelecionado.getFile();
      const textoDoArquivo = await arquivo.text();

      setConteudoArquivo(textoDoArquivo);
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
      await fluxoGravacao.write(conteudoArquivo || 'Texto padrão');
      await fluxoGravacao.close();
    } catch (erro) {
      console.error('Erro ao salvar o arquivo:', erro);
    }
  };
  return (
    <div>
      <h2><FaFileSignature /> Assinar Documento</h2>
      <div>
        <button onClick={abrirArquivo} className="primary-btn">Abrir Arquivo</button>
        <button onClick={salvarArquivo} className="primary-btn" >Salvar Arquivo</button>
      </div>
      <div>
        {conteudoArquivo && (
          <div>
            <h3>Conteúdo do Arquivo:</h3>
            <pre>{conteudoArquivo}</pre>
          </div>
        )}
      </div>

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
