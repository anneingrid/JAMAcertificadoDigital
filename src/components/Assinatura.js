import React, { useState, useContext } from 'react';
import { AppContext } from '../back/Provider';
import { FaFileSignature } from 'react-icons/fa';
import { supabase } from '../back/ConexaoBD';

const Assinatura = () => {
    const { usuarioLogado, assinar } = useContext(AppContext);
    const [signature, setSignature] = useState('');
    const [conteudoArquivo, setConteudoArquivo] = useState(null);
    const [editandoNovoArquivo, setEditandoNovoArquivo] = useState(false);
    const [novoConteudo, setNovoConteudo] = useState('');
    const [arquivoParaUpload, setArquivoParaUpload] = useState(null);

    const assinarDocumento = async () => {
        try {
            const resultado = await assinar(1, usuarioLogado.id_usuario, conteudoArquivo);
            if (resultado) {
                setSignature(
                    <>
                        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>

  <span style={{ color: '#00a316', fontSize:13.28 }}>✅ Assinatura gerada com sucesso!</span>
                        </div>
                        <div>
                            <span style={{fontSize:14}}>🔐 Hash:</span>

                        </div>
                        <span className='dados'>{resultado}</span>
                    </>
                );
            }
        } catch (error) {
            console.error('Erro ao assinar o documento:', error.message);
            setSignature('Erro ao assinar o documento.');
        }
    };

    const abrirArquivo = async () => {
        try {
            const [arquivoHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'Arquivos de Texto',
                        accept: {
                            'text/plain': ['.txt'],
                        },
                    },
                    // Outros tipos de arquivo podem ser adicionados aqui
                ],
                excludeAcceptAllOption: true,
                multiple: false,
            });
            const arquivo = await arquivoHandle.getFile();
            const textoDoArquivo = await arquivo.text();
            setSignature(null);
            setConteudoArquivo(textoDoArquivo);
            setArquivoParaUpload(arquivo); // Armazena o arquivo para upload
            setEditandoNovoArquivo(false);
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

            setConteudoArquivo(novoConteudo);
            setEditandoNovoArquivo(false);

            // Cria um Blob a partir do novo conteúdo e prepara para upload
            const blob = new Blob([novoConteudo], { type: 'text/plain' });
            const novoArquivo = new File([blob], 'novoArquivo.txt', { type: 'text/plain' });
            setArquivoParaUpload(novoArquivo);
        } catch (erro) {
            console.error('Erro ao salvar o arquivo:', erro);
        }
    };

    const criarNovoArquivo = () => {
        setEditandoNovoArquivo(true);
        setNovoConteudo('');
        setConteudoArquivo(null);
        setArquivoParaUpload(null);
        setSignature(null);

    };

    // Função de upload para o Supabase
    const uploadArquivo = async () => {
        if (!arquivoParaUpload) {
            alert('Nenhum arquivo selecionado para upload.');
            return;
        }
        try {
            const { data, error } = await supabase.storage
                .from('documento') // Substitua pelo nome do seu bucket
                .upload(`pasta/${arquivoParaUpload.name}`, arquivoParaUpload);

            if (error) {
                console.error('Erro ao fazer upload:', error.message);
                alert('Erro ao fazer upload do arquivo.');
            } else {
                console.log('Upload realizado com sucesso:', data);
                alert('Arquivo enviado com sucesso!');
            }
            setSignature(null);

        } catch (error) {
            console.error('Erro no upload:', error.message);
            alert('Erro no upload do arquivo.');
        }
    };

    return (
        <div>
            <h2>
                <FaFileSignature /> Assinar Documento
            </h2>
            <div className="alinharBotoes">
                <button onClick={abrirArquivo} className="primary-btn">
                    Abrir Arquivo
                </button>
                <button onClick={uploadArquivo} className="primary-btn">
                    Upload Arquivo
                </button>
                <button onClick={criarNovoArquivo} className="primary-btn">
                    Novo Arquivo
                </button>
            </div>
            {conteudoArquivo && (
                <div style={{ justifyContent: "flex-start", alignItems: 'flex-start', marginTop: 20 }}>
                    <span style={{ textAlign: 'center', fontWeight: 'bold' }}>Conteúdo do Arquivo:</span>
                    <pre className='dados'>{conteudoArquivo}</pre>
                </div>
            )}
            <div className="alinharBotoes">

                {editandoNovoArquivo && (
                    <div>
                        <h3>Novo Arquivo:</h3>
                        <textarea
                            value={novoConteudo}
                            onChange={(e) => setNovoConteudo(e.target.value)}
                            rows={10}
                            placeholder="Digite o conteúdo do novo arquivo aqui..."
                        />
                        <button onClick={salvarArquivo} className="primary-btn">
                            Salvar Arquivo
                        </button>
                    </div>
                )}
            </div>


            <div className="alinharBotoes">
                <button className="primary-btn-assinar" onClick={assinarDocumento}>
                    Assinar Documento
                </button>
            </div>

            {signature && (
                <div>
                    <span style={{ marginTop: 6, display: 'block', maxWidth: '100%', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {signature}
                    </span>
                </div>
            )}

        </div>
    );
};

export default Assinatura;
