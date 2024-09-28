import React, { useState, useContext } from 'react';
import { AppContext } from '../back/Provider';
import { FaFile, FaSave, FaFolderOpen, FaFolderPlus, FaFileUpload } from 'react-icons/fa';
import { supabase } from '../back/ConexaoBD';
import { Toast, Spinner } from 'react-bootstrap';
import { Oval } from 'react-loader-spinner';

const NovoArquivo = () => {
    const { usuarioLogado, fetchDocumentos } = useContext(AppContext);
    const [conteudoArquivo, setConteudoArquivo] = useState(null);
    const [editandoNovoArquivo, setEditandoNovoArquivo] = useState(false);
    const [novoConteudo, setNovoConteudo] = useState('');
    const [arquivoParaUpload, setArquivoParaUpload] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [carregando, setCarregando] = useState(false);
    const forge = require('node-forge');

    // Gerar hash do conteúdo
    function gerarHash(dados) {
        const md = forge.md.sha256.create();
        md.update(dados, 'utf8');
        return md.digest().toHex();
    }

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
                ],
                excludeAcceptAllOption: true,
                multiple: false,
            });
            const arquivo = await arquivoHandle.getFile();
            const textoDoArquivo = await arquivo.text();
            setConteudoArquivo(textoDoArquivo);
            setArquivoParaUpload(arquivo);
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

            const blob = new Blob([novoConteudo], { type: 'text/plain' });
            const novoArquivo = new File([blob], 'novoArquivo.txt', { type: 'text/plain' });
            setArquivoParaUpload(novoArquivo);
            setToastMessage('✔️Arquivo Salvo, pronto para Upload!');
            setShowToast(true);
        } catch (erro) {
            console.error('Erro ao salvar o arquivo:', erro);
        }
    };

    const criarNovoArquivo = () => {
        setEditandoNovoArquivo(true);
        setNovoConteudo('');
        setConteudoArquivo(null);
        setArquivoParaUpload(null);
    };

    const uploadArquivo = async () => {
        if (!arquivoParaUpload) {
            alert('Nenhum arquivo selecionado para upload.');
            return;
        }
        setCarregando(true);
        try {
            const hashGerado = gerarHash(conteudoArquivo);
            const descricaoArquivo = conteudoArquivo ? conteudoArquivo.substring(0, 10) : 'Descrição padrão';
            const { data: documentoData, error: dbError } = await supabase
                .from('Documento')
                .insert({
                    descricao_documento: descricaoArquivo,
                    id_usuario: usuarioLogado.id_usuario,
                    hash_do_documento: hashGerado,
                })
                .select();

            if (dbError) {
                console.error('Erro ao salvar no banco de dados:', dbError.message);
                alert('Erro ao salvar no banco de dados.');
                return;
            }

            const idDocumento = documentoData[0].id_documento;

            const { data, error } = await supabase.storage
                .from('documento')
                .upload(`${idDocumento}.txt`, arquivoParaUpload);

            if (error) {
                console.error('Erro ao fazer upload:', error.message);
                alert('Erro ao fazer upload do arquivo.');
                return;
            }

            const filePath = data.path;

            const { data: publicData, error: urlError } = supabase
                .storage
                .from('documento')
                .getPublicUrl(filePath);

            if (urlError) {
                console.error('Erro ao obter URL pública:', urlError.message);
                alert('Erro ao obter a URL pública do arquivo.');
                return;
            }

            const publicURL = publicData.publicUrl;

            const { error: updateError } = await supabase
                .from('Documento')
                .update({
                    urlDocumento: publicURL,
                })
                .eq('id_documento', idDocumento);

            if (updateError) {
                console.error('Erro ao atualizar o documento:', updateError.message);
                alert('Erro ao atualizar o documento com a URL do arquivo.');
            } else {
                setToastMessage('✅Arquivo enviado e URL salva com sucesso!');
                setShowToast(true);
                fetchDocumentos();
                setArquivoParaUpload(null);
                setConteudoArquivo(null);

            }

        } catch (error) {
            console.error('Erro no upload:', error.message);
            alert('Erro no upload do arquivo.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div >
            <span className="hdois" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <FaFile className='iconTop' style={{ marginRight: '10px' }} /> Novo Arquivo
            </span>
            <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <div className="alinharBotoes" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <button onClick={abrirArquivo} className="primary-butao" style={{ marginRight: '10px' }}>
                        <FaFolderOpen className='icons' /> Abrir Arquivo
                    </button>
                    <button onClick={criarNovoArquivo} className="primary-butao">
                        <FaFolderPlus className='icons' /> Novo Arquivo
                    </button>
                </div>
                {conteudoArquivo && (
                    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <h5 style={{ margin: '10px 0', fontSize: 16 }}>Conteúdo do Arquivo:</h5>
                        <pre className='dados' style={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            padding: '15px',
                            backgroundColor: '#f1f1f1',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            maxHeight: '300px',
                            overflow: 'auto',
                        }}>{conteudoArquivo}</pre>
                    </div>
                )}
                {!editandoNovoArquivo && arquivoParaUpload && (
                    <div>
                        <button onClick={uploadArquivo} className="primary-butao" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            {carregando ? (
                                <Spinner animation="border" size="sm" style={{ marginRight: '10px' }} />
                            ) : (
                                <FaFileUpload className='icons' style={{ marginRight: '10px' }} />
                            )}
                            {carregando ? 'Carregando...' : 'Salvar'}
                        </button>
                    </div>
                )}
                {editandoNovoArquivo && (
                    <div style={{ marginTop: '20px' }}>
                        <h5 style={{ marginBottom: '10px', fontSize: 16 }}>Novo Arquivo:</h5>
                        <textarea
                            value={novoConteudo}
                            onChange={(e) => setNovoConteudo(e.target.value)}
                            rows={10}
                            placeholder="Digite o conteúdo do novo arquivo aqui..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '14px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                backgroundColor: '#fafafa',
                                marginBottom: '20px'
                            }}
                        />
                        <button onClick={salvarArquivo} className="primary-butao" style={{ width: '100%' }}>
                            <FaSave className='icons' style={{ marginRight: '10px' }} /> Salvar Arquivo
                        </button>
                    </div>
                )}
            </div>
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
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </div>
    );
};

export default NovoArquivo;
