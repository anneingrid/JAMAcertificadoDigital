import React, { createContext, useState, useEffect } from 'react';
import { supabase } from './ConexaoBD';
import bcrypt from 'bcryptjs';
// import forge from 'node-forge';
export const AppContext = createContext();


export const AppProvider = ({ children }) => {
    const forge = require('node-forge');

    // ----------- USUÁRIO LOGADO--------------------
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

        if (usuario) {
            setUsuarioLogado(usuario);
        }
    }, []);


    const salvarUsuarioNoLocalStorage = (usuario) => {
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    };

    // ----------- CADASTRO USUÁRIO --------------------
    const cadastrarUsuario = async (nome, email, senha) => {
        try {
            const { data: nomeExistente } = await supabase
                .from('Usuario')
                .select('*')
                .eq('nome_usuario', nome)
                .single();

            if (nomeExistente) {
                return { error: 'Nome de usuário já está em uso. Escolha outro.' };
            }

            const { data: emailExistente } = await supabase
                .from('Usuario')
                .select('*')
                .eq('email', email)
                .single();

            if (emailExistente) {
                return { error: 'E-mail já está em uso. Escolha outro.' };
            }

            const hashedSenha = await hashSenha(senha);
            const { data: novoUsuario, error } = await supabase
                .from('Usuario')
                .insert([{ nome_usuario: nome, email: email, senha: hashedSenha }])
                .select('*')
                .single();

            if (error) {
                console.error('Erro ao cadastrar o usuário:', error.message || error);
                return { error: 'Erro ao cadastrar o usuário. Tente novamente.' };
            }

            // ----------- GERAR E ARMAZENAR CHAVES --------------------
            const chaves = await gerarChaves(novoUsuario.id_usuario);
            if (!chaves) {
                console.error('Erro ao gerar e armazenar as chaves');
                return { error: 'Erro ao gerar e armazenar as chaves. Tente novamente.' };
            }

            return true;
        } catch (error) {
            console.error('Erro no processo de cadastro:', error.message || error);
            return { error: 'Erro no processo de cadastro. Tente novamente.' };
        }
    };

    const hashSenha = async (senha) => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(senha, salt);
        return hash;
    };

    // ----------- LOGIN --------------------
    const login = async (email, senha) => {
        try {
            const { data: usuario, error: fetchError } = await supabase
                .from('Usuario')
                .select('id_usuario, nome_usuario, senha')
                .eq('email', email)
                .single();

            if (fetchError || !usuario) {
                localStorage.removeItem('usuarioLogado');
                return { error: 'Usuário não encontrado.' };
            }

            const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);

            if (!senhaCorreta) {
                return { error: 'Senha incorreta.' };
            }

            setUsuarioLogado(usuario);
            salvarUsuarioNoLocalStorage(usuario);

            return { success: true, usuario };
        } catch (error) {
            console.error('Erro durante o login:', error.message || error);
            localStorage.removeItem('usuarioLogado');
            return { error: 'Erro durante o login. Tente novamente.' };
        }
    };

    // ----------- LOGOUT --------------------
    const logout = () => {
        setUsuarioLogado(null);
        localStorage.removeItem('usuarioLogado');
    };

    // ----------- GERAR CHAVES --------------------
    const gerarChaves = async (idUsuario) => {
        try {
            const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
            const chave_priv = forge.pki.privateKeyToPem(keyPair.privateKey);
            const chave_publ = forge.pki.publicKeyToPem(keyPair.publicKey);

            const { data: dados, error: erro } = await supabase.storage
                .from('chave')
                .upload(`${idUsuario}.pem`, chave_priv);

            if (erro) {
                console.error('Erro ao obter URL pública:', erro.message);
                alert('Erro ao obter a URL pública do arquivo.');
                return null;
            }

            const caminho = dados.path;

            const { data: publicData, error: urlError } = supabase
                .storage
                .from('chave')
                .getPublicUrl(caminho);

            if (urlError) {
                console.error('Erro ao obter URL pública:', urlError.message);
                alert('Erro ao obter a URL pública do arquivo.');
                return null;
            }

            const publicURL = publicData.publicUrl;

            const { data, error } = await supabase
                .from('Usuario')
                .update({ chave_publica: chave_publ, chave_privada: chave_priv, link_chave_privada: publicURL, })
                .match({ id_usuario: idUsuario })
                .select('*');

            if (error) {
                console.error("Erro:", error.message || error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Erro ao gerar o par de chaves:', error.message || error);
            return null;
        }

    };

    // ----------- GERAR CERTIFICADO --------------------
    const certificado = async (idUsuario, nome) => {
        try {
            const { data: usuarioData, error: usuarioError } = await supabase
                .from('Usuario')
                .select('certificado')
                .eq('id_usuario', idUsuario)
                .single();
    
            if (usuarioError) {
                throw new Error('Erro ao verificar usuário:' + usuarioError.message);
            }
            if (usuarioData && usuarioData.certificado) {
                alert('Um certificado já foi gerado para este usuário.');
                return usuarioData.certificadoDados;
            }
    
            const publicKeyPem = await buscarChavePublica(idUsuario);
            if (!publicKeyPem) {
                throw new Error('Chave pública não encontrada.');
            }
            const publicKey = forge.pki.publicKeyFromPem(publicKeyPem); // transformando a chave em PEM
    
            const cert = forge.pki.createCertificate(); //cria o objeto do certificado
            cert.publicKey = publicKey; // a partir daqui vamos definir as infos do certificado
    
            const numeroDeSerie = idUsuario.replace(/-/g, ''); // número de série
            cert.serialNumber = numeroDeSerie; // converte o UUID para o tipo certo
            cert.validity.notBefore = new Date(); // Data de início de validade
            cert.validity.notAfter = new Date(); // Data de término de validade
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // Validade de 1 ano
    
            // mudando o dono
            cert.setSubject([
                { name: 'commonName', value: nome },
                { name: 'countryName', value: 'BR (Brasil)' },
                { shortName: 'ST', value: 'TO' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);
            
            // mudando o emissor do certificado (nois)
            cert.setIssuer([
                { name: 'commonName', value: 'JAMA Certificado Digital' },
                { name: 'countryName', value: 'BR (Brasil)' },
                { shortName: 'ST', value: 'TO' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);
    
            const privateKeyPem = await buscarChavePrivada(idUsuario); //pega chave privada
            if (!privateKeyPem) {
                throw new Error('Chave privada não encontrada.');
            }
            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    
            cert.sign(privateKey); // Assina o certificado
    
            const pemCert = forge.pki.certificateToPem(cert); //pega o pem do certificado
    
            const dadosCertificado = { // isso foi firula que inventei pra apresentar bonitinho os dados
                commonName: nome, country: 'BR (Brasil)', state: 'TO', locality: 'Palmas', organization: 'FC Solutions',
                serialNumber: numeroDeSerie, validity: {
                    notBefore: cert.validity.notBefore.toISOString().split('T')[0],
                    notAfter: cert.validity.notAfter.toISOString().split('T')[0]
                }
            };
    
            //---- SALVAR O .PEMMMMM ------
            const { data: dados, error: uploadError } = await supabase.storage
                .from('certificado')
                .upload(`${idUsuario}.pem`, pemCert);
    
            if (uploadError) {
                throw new Error('Erro ao fazer upload do certificado: ' + uploadError.message);
            }
    
            const caminho = dados.path;
    
            // Obter a URL pública do arquivo salvo
            const { data: publicData, error: urlError } = supabase
                .storage
                .from('certificado')
                .getPublicUrl(caminho);
    
            if (urlError) {
                throw new Error('Erro ao obter URL pública: ' + urlError.message);
            }
    
            const linkCert = publicData.publicUrl;
    
            //---- SALVAR ISSO NO BANCO EM NOME DE JESUS ------
            const { data: updateData, error: updateError } = await supabase
                .from('Usuario')
                .update({ certificado: pemCert, certificadoDados: dadosCertificado, link_certificado: linkCert })
                .eq('id_usuario', idUsuario);
    
            if (updateError) {
                throw new Error('Erro ao atualizar dados do usuário: ' + updateError.message);
            } else {
                console.log('Certificado armazenado com sucesso:', updateData);
            }
            return cert;
    
        } catch (error) {
            console.error('Erro ao gerar certificado:', error.message || error);
            return null;
        }
    };
    

    //--------------------- DADOS USUÁRIO  ------------------
    const buscarUsuarioPorId = async (idUsuario) => {
        try {
            const { data, error } = await supabase
                .from('Usuario')
                .select('*')
                .eq('id_usuario', idUsuario);
            if (error) {
                throw error;
            }
            if (data.length > 0) {
                return data[0];
            } else {
                return 'Usuário não encontrado';
            }
        } catch (error) {
            console.error('Erro ao buscar o nome do usuário:', error.message || error);
            return null;
        }
    };

    // ----------- BUSCAR CHAVES --------------------

    const buscarChavePrivada = async (idUsuario) => {
        try {
            const { data, error } = await supabase
                .from('Usuario')
                .select('chave_privada')
                .eq('id_usuario', idUsuario);

            if (error || !data.length) {
                console.error('Erro ao buscar chaves', error);
                return null;
            }

            const privateKey = (data[0].chave_privada);
            return privateKey;
        } catch (error) {
            console.error('Erro ao buscar chave privada', error.message || error);
            return null;
        }
    };

    const buscarChavePublica = async (idUsuario) => {
        try {
            const { data, error } = await supabase
                .from('Usuario')
                .select('chave_publica')
                .eq('id_usuario', idUsuario);

            if (error) {
                console.error('Erro ao buscar chave pública', error);
                return null;
            }

            const publicKey = (data[0].chave_publica);
            return publicKey;
        } catch (error) {
            console.error('Erro ao importar chave pública', error.message || error);
            return null;
        }
    };

    // ----------- ASSINAR --------------------
    const assinar = async (idDocumento, idUsuario, text) => {
        try {
            const dados = await buscarUsuarioPorId(idUsuario);
            const cert = dados.certificado;
            if (!cert) {
                throw new Error('Certificado não encontrado ou inválido');
            }

            const privateKeyPem = await buscarChavePrivada(idUsuario);
            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

            const md = forge.md.sha512.create();
            md.update(text, 'utf8');
            const signature = privateKey.sign(md);

            const now = new Date();
            const localTime = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

            const { data, error } = await supabase
                .from('Assinatura')
                .insert([{
                    id_documento: idDocumento,
                    id_usuario: idUsuario,
                    assinatura: forge.util.encode64(signature),
                    assinado_em: localTime,
                    assinatura_hash: md.digest().toHex(),
                }]);

            if (error) {
                console.error('Erro ao inserir a assinatura:', error.message || error);
                return null;
            }

            return md.digest().toHex();
        } catch (error) {
            console.error('Erro ao gerar a assinatura:', error.message || error);
            return null;
        }
    };

    // ----------- VERIFICAR ASSINATURA --------------------

    const verificarAssinatura = async (idUsuario, textoOriginal, assinaturaBase64) => {
        try {
            // 1. Obter o certificado do usuário
            const { data: usuarioData, error: usuarioError } = await supabase
                .from('Usuario')
                .select('certificado')
                .eq('id_usuario', idUsuario)
                .single();

            if (usuarioError) {
                throw new Error('Erro ao verificar usuário: ' + usuarioError.message);
            }

            const certificadoPem = usuarioData.certificado;
            const publicKey = forge.pki.certificateFromPem(certificadoPem).publicKey;

            // 2. Gerar hash do texto original
            const md = forge.md.sha512.create();
            md.update(textoOriginal, 'utf8');
            const hashTexto = md.digest();

            // 3. Decodificar a assinatura em Base64
            const assinatura = forge.util.decode64(assinaturaBase64);

            // 4. Verificar a assinatura
            const isValid = publicKey.verify(md.algorithm, hashTexto.bytes(), assinatura);

            return isValid;

        } catch (error) {
            console.error('Erro ao verificar a assinatura:', error.message || error);
            return false;
        }
    };
    // ----------- LISTAGEM (TIVE QUE BOTAR AQUI) --------------------
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
            .select('id_documento, assinatura_hash, assinado_em');

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
                    assinadoEm: assinatura.assinado_em
                };
            });

        setDocumentosNaoAssinados(documentosNaoAssinados);
        setDocumentosAssinados(documentosAssinados);
    };

    useEffect(() => {
        fetchDocumentos();
    }, [usuarioLogado]);




    return (
        <AppContext.Provider value={{
            cadastrarUsuario,
            usuarioLogado,
            login,
            logout,
            certificado,
            buscarChavePublica,
            buscarUsuarioPorId,
            assinar,
            documentosNaoAssinados,
            documentosAssinados,
            fetchDocumentos
        }}>
            {children}
        </AppContext.Provider>
    );
};

