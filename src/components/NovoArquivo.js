import React, { useState, useContext } from 'react';
import { AppContext } from '../back/Provider';
import { FaFile, FaSave, FaFolderOpen, FaFolderPlus } from 'react-icons/fa';
import { supabase } from '../back/ConexaoBD';

const NovoArquivo = () => {
    const { usuarioLogado} = useContext(AppContext);
    const [conteudoArquivo, setConteudoArquivo] = useState(null);
    const [editandoNovoArquivo, setEditandoNovoArquivo] = useState(false);
    const [novoConteudo, setNovoConteudo] = useState('');
    const [arquivoParaUpload, setArquivoParaUpload] = useState(null);

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

        try {
            const descricaoArquivo = conteudoArquivo ? conteudoArquivo.substring(0, 10) : 'Descrição padrão';
            const { data: documentoData, error: dbError } = await supabase
                .from('Documento')
                .insert({
                    descricao_documento: descricaoArquivo,
                    id_usuario: usuarioLogado.id_usuario,
                    hash_do_documento: 'sem hash por enquanto',
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
                alert('Arquivo enviado e URL salva com sucesso!');
            }

        } catch (error) {
            console.error('Erro no upload:', error.message);
            alert('Erro no upload do arquivo.');
        }
    };


    return (
        <div>
            <span className="hdois">
                <FaFile className='iconTop' /> Novo Arquivo
            </span>
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
                    <span style={{ textAlign: 'center', fontWeight: 'bold' }}>Conteúdo do Arquivo:</span>
                    <pre className='dados'>{conteudoArquivo}</pre>
                </div>
            )}
            <div className="alinharBotoes">

                <button onClick={uploadArquivo} className="primary-butao">
                    <FaSave className='icons' />Salvar
                </button>
            </div>

            <div className="alinharBotoes">

                {editandoNovoArquivo && (
                    <div>
                        <p>Novo Arquivo:</p>
                        <textarea
                            value={novoConteudo}
                            onChange={(e) => setNovoConteudo(e.target.value)}
                            rows={10}
                            placeholder="Digite o conteúdo do novo arquivo aqui..."
                        />
                        <button onClick={salvarArquivo} className="primary-butao">
                            Salvar Arquivo
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default NovoArquivo;
