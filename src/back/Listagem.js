import { useEffect, useState } from 'react';
import { supabase } from './ConexaoBD';

const useDocumentos = (usuarioLogado) => {
    const [documentosNaoAssinados, setDocumentosNaoAssinados] = useState([]);
    const [documentosAssinados, setDocumentosAssinados] = useState([]);

    const fetchDocumentos = async () => {
        const { data: documentos, error: errorDocumentos } = await supabase
            .from('Documento')
            .select(`
                *,
                Usuario (
                    id_usuario,
                    nome_usuario
                )
            `);

        const { data: assinaturas, error: errorAssinaturas } = await supabase
            .from('Assinatura')
            .select('id_documento, assinatura_hash, assinado_em, assinatura');

        if (errorDocumentos || errorAssinaturas) {
            console.error('Erro ao buscar documentos ou assinaturas:', errorDocumentos?.message || errorAssinaturas?.message);
            return;
        }

        const idsAssinados = assinaturas.map(assinatura => assinatura.id_documento);

        const documentosNaoAssinados = documentos.filter(documento => !idsAssinados.includes(documento.id_documento));

        const documentosAssinados = documentos
            .filter(documento => idsAssinados.includes(documento.id_documento))
            .map(documento => {
                const assinatura = assinaturas.find(a => a.id_documento === documento.id_documento);
                return {
                    ...documento,
                    assinaturaHash: assinatura.assinatura_hash,
                    assinadoEm: assinatura.assinado_em,
                    assinatura: assinatura.assinatura
                };
            });

        setDocumentosNaoAssinados(documentosNaoAssinados);
        setDocumentosAssinados(documentosAssinados);
    };

    useEffect(() => {
        if (usuarioLogado) {
            fetchDocumentos();
        }
    }, [usuarioLogado]);

    return { documentosNaoAssinados, documentosAssinados, fetchDocumentos };
};

export default useDocumentos;
