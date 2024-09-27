import React, { useState, useContext } from 'react';
import { AppContext } from '../back/Provider';
import { FaFile, FaSave, FaFolderOpen, FaFolderPlus, FaFileUpload } from 'react-icons/fa';
import { supabase } from '../back/ConexaoBD';
import { Accordion, Toast } from 'react-bootstrap';
import { Oval, ThreeDots } from 'react-loader-spinner';

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
        <div style={{
            alignContent: 'center', alignItems: 'center', justifyContent: 'center', display: 'block',
        }}>
            <span className="hdois">
                <FaFile className='iconTop' /> Novo Arquivo
            </span>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
                <div className="alinharBotoes">
                    <button onClick={abrirArquivo} className="primary-butao">
                        <FaFolderOpen className='icons' />Abrir Arquivo
                    </button>
                    <button onClick={criarNovoArquivo} className="primary-butao">
                        <FaFolderPlus className='icons' /> Novo Arquivo
                    </button>
                </div>
                {conteudoArquivo && (
                    <div style={{ justifyContent: "flex-start", alignItems: 'flex-start', marginTop: 20 }}>
                        <span style={{ fontWeight: 'bold' }}>Conteúdo do Arquivo:</span>
                        <pre className='dados'>{conteudoArquivo}</pre>
                    </div>
                )}

                {/* Mostrar o botão de upload apenas se houver um arquivo selecionado e não estiver editando um novo arquivo */}
                {!editandoNovoArquivo && arquivoParaUpload && (

                    <div className="alinharBotoes">
                        <button onClick={uploadArquivo} className="primary-butao">
                            {carregando ? (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <ThreeDots
                                        visible={true}
                                        height="25"
                                        width="25"
                                        color="white"
                                        secondaryColor="#df003b95"
                                        radius="9"
                                        ariaLabel="three-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                    />
                                </div>
                            ) : (
                                <>
                                    <FaFileUpload className='icons' />Salvar

                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Área de edição do novo arquivo */}
                {editandoNovoArquivo && (
                    <div>
                        <p style={{ margin: '10px', fontSize: 14 }}>Novo Arquivo:</ p>
                        <textarea
                            value={novoConteudo}
                            onChange={(e) => setNovoConteudo(e.target.value)}
                            rows={10}
                            placeholder="Digite o conteúdo do novo arquivo aqui..."
                            style={{ fontSize: 14 }}
                        />
                        <button onClick={salvarArquivo} className="primary-butao">
                            <FaSave className='icons' />Salvar Arquivo
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
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: '400px',
                    textAlign: 'center',
                    zIndex: 9999
                }}
            >
                <Toast.Header>
                    <strong className="me-auto">Notificação</strong>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </div>
    );


};

export default NovoArquivo;
