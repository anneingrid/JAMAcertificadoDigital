import React, { createContext, useState, useEffect } from 'react';
import { supabase } from './ConexaoBD';
import bcrypt from 'bcryptjs';
export const AppContext = createContext();


export const AppProvider = ({ children }) => {
    const forge = require('node-forge');
    // ----------- CERTIFICADO AC--------------------
    const certificadoAC = async () => {
        try {
            const keys = forge.pki.rsa.generateKeyPair(2048);

            const cert = forge.pki.createCertificate();

            // Atribuir a chave pública ao certificado
            cert.publicKey = keys.publicKey;

            // Definir o número de série do certificado
            cert.serialNumber = (new Date().getTime()).toString(16);

            // Definir as datas de validade do certificado
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);  // Válido por 10 anos

            // Configurar os campos "subject" (quem o certificado representa)
            cert.setSubject([
                { name: 'commonName', value: 'Certificado Raiz CA' },
                { name: 'countryName', value: 'BR' },
                { name: 'stateOrProvinceName', value: 'Tocantins' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);

            // Configurar os campos "issuer" (a própria CA raiz é a emissora)
            cert.setIssuer([
                { name: 'commonName', value: 'Certificado Raiz CA' },
                { name: 'countryName', value: 'BR' },
                { name: 'stateOrProvinceName', value: 'Tocantins' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);

            // Adicionar extensões ao certificado
            cert.setExtensions([
                {
                    name: 'basicConstraints',
                    cA: true,  // Este certificado é de uma CA
                    critical: true
                },
                {
                    name: 'keyUsage',
                    keyCertSign: true,  // O certificado pode assinar outros certificados
                    cRLSign: true,  // O certificado pode assinar listas de revogação
                },
                {
                    name: 'subjectKeyIdentifier'
                }
            ]);

            // Assinar o certificado com a chave privada
            cert.sign(keys.privateKey, forge.md.sha256.create());

            // Converter o certificado e a chave privada para PEM (formato legível)
            const pemCert = forge.pki.certificateToPem(cert);
            const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

            //SALVANDO NO BUCKET
            const { data: dados, error: erro } = await supabase.storage
                .from('AC')
                .upload(`CHAVES.pem`, pemKey);
            const { data: dados2, error: erro2 } = await supabase.storage
                .from('AC')
                .upload(`CERT.pem`, pemCert);
            if (erro || erro2) {
                console.error(`Erro ao fazer upload do arquivo:`, erro.message);
            } else {
                console.log(`Arquivo  armazenado com sucesso:`, dados, dados2);
            }
           
            return true;
        } catch (error) {
            console.log(`Erro`, error);

        }
    };

    // ----------- CERTIFICADO INTERMEDIÁRIO -------------------
    const certificadoIntermediario = async () => {
        try {
           
        } catch (error) {
            console.error('Erro durante o login:', error.message || error);
        }
    };
    // ----------- USUÁRIO LOGADO--------------------
    const [usuarioLogado, setUsuarioLogado] = useState(null);

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
                return { error: 'Usuário não encontrado.' };
            }

            const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);

            if (!senhaCorreta) {
                return { error: 'Senha incorreta.' };
            }

            setUsuarioLogado(usuario);
            return { success: true, usuario };
        } catch (error) {
            console.error('Erro durante o login:', error.message || error);
            return { error: 'Erro durante o login. Tente novamente.' };
        }
    };

    // ----------- LOGOUT --------------------
    const logout = () => {
        setUsuarioLogado(null);

    }

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
            const nomeArquivo = `${idUsuario}.pem`;

            const { data, error } = supabase
                .storage
                .from('chave')
                .getPublicUrl(nomeArquivo);

            if (error || !data || !data.publicUrl) {
                console.error('Erro ao buscar a URL pública da chave privada:', error);
                return null;
            }

            const linkChavePrivada = data.publicUrl;

            const response = await fetch(linkChavePrivada);
            if (!response.ok) {
                throw new Error('Erro ao baixar o arquivo: ' + response.statusText);
            }

            const pemContent = await response.text();

            return pemContent;
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
                if (error) {
                    console.error('Erro ao buscar chave pública', error);
                    return null;
                }
            }
            const publicKey = (data[0].chave_publica);
            return publicKey;

        } catch (error) {
            console.error('Erro ao importar chave pública', error.message || error);
            return null;
        }
    }

    // ----------- ASSINAR --------------------
    const assinar = async (idDocumento, idUsuario, text) => {
        try {
            const dados = await buscarUsuarioPorId(idUsuario);
            const cert = dados.certificado;
            if (!cert) {
                return 'erroCert';
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
        fetchDocumentos();
    }, [usuarioLogado]);




    // ----------- VERIFICAR ASSINATURA --------------------
    const obterCertificado = async (idUsuario) => {
        try {
            const nomeArquivo = `${idUsuario}.pem`;
            const { data, error } = supabase
                .storage
                .from('certificado')
                .getPublicUrl(nomeArquivo);

            if (error || !data || !data.publicUrl) {
                console.error('Erro ao buscar a URL pública do certificado', error);
                return null;
            }
            const linkCertificado = data.publicUrl;
            const response = await fetch(linkCertificado);
            const pemContent = await response.text();
            return pemContent;
        } catch (error) {
            console.error('Erro ao buscar certificado', error.message || error);
            return null;
        }
    };

    const extrairChavePublica = async (certificado) => {
        try {
            const pegaCertificado = forge.pki.certificateFromPem(certificado);
            const chavePublica = pegaCertificado.publicKey;
            const chavePublicaPem = forge.pki.publicKeyToPem(chavePublica);
            return chavePublicaPem;
        } catch (error) {
            console.error('Erro ao extrair chave pública:', error);
        }
    };

    const verificarAssinatura4 = async (idDocumento, documento, chavePublica) => {
        try {
            const { data, error } = await supabase
                .from('Assinatura')
                .select('assinatura')
                .eq('id_documento', idDocumento)
                .single();
            console.log(data);
            const md = forge.md.sha256.create();
            md.update(documento, 'utf8');  // Documento original que foi assinado

            // Decodifica a assinatura de Base64 para bytes
            const assinatura = forge.util.decode64(data);

            // Verifica a assinatura com a chave pública
            const isValid = chavePublica.verify(md.digest().bytes(), assinatura);
            console.log(isValid)
            return isValid;
        } catch (error) {
            console.error('Erro ao verificar a assinatura:', error);
            return false;
        }
    }


    return (
        <AppContext.Provider value={{
            cadastrarUsuario,
            usuarioLogado,
            login,
            logout,
            certificado,
            buscarChavePublica,
            buscarUsuarioPorId,
            obterCertificado,
            extrairChavePublica,
            assinar,
            documentosNaoAssinados,
            documentosAssinados,
            fetchDocumentos,
            verificarAssinatura4,
            buscarChavePrivada
        }}>
            {children}
        </AppContext.Provider>
    );
}