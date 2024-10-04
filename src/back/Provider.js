import React, { createContext, useState, useEffect } from 'react';
import { supabase } from './ConexaoBD';
import bcrypt from 'bcryptjs';
export const AppContext = createContext();


export const AppProvider = ({ children }) => {
    const forge = require('node-forge');
    // ----------- CERTIFICADO CA RAIZ--------------------
    const certificadoCARaiz = async () => {
        try {
            const keys = forge.pki.rsa.generateKeyPair(2048);

            const cert = forge.pki.createCertificate();

            cert.publicKey = keys.publicKey;

            cert.serialNumber = (new Date().getTime()).toString(16);

            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);  // Válido por 10 anos

            cert.setSubject([
                { name: 'commonName', value: 'Certificado Raiz CA' },
                { name: 'countryName', value: 'BR' },
                { name: 'stateOrProvinceName', value: 'Tocantins' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);

            cert.setIssuer([
                { name: 'commonName', value: 'Certificado Raiz CA' },
                { name: 'countryName', value: 'BR' },
                { name: 'stateOrProvinceName', value: 'Tocantins' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);

            cert.setExtensions([
                { name: 'basicConstraints', cA: true, critical: true },
                { name: 'keyUsage', keyCertSign: true, cRLSign: true, },
                { name: 'subjectKeyIdentifier' }
            ]);

            cert.sign(keys.privateKey, forge.md.sha256.create());

            const pemCert = forge.pki.certificateToPem(cert);
            const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

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
            //caça a chave priv do ca raiz
            const { data, error } = supabase
                .storage
                .from('AC')
                .getPublicUrl('CHAVES.pem');

            if (error || !data || !data.publicUrl) {
                console.error('Erro ao buscar a URL pública da chave privada:', error);
                return null;
            }
            const linkChavePrivada = data.publicUrl;
            const response = await fetch(linkChavePrivada);
            const chavePrivadaPem = await response.text();

            if (!chavePrivadaPem) {
                throw new Error('Chave privada da CA raiz não encontrada.');
            }
            const chavePrivadaCa = forge.pki.privateKeyFromPem(chavePrivadaPem);

            const chaveIntermediaria = forge.pki.rsa.generateKeyPair(2048);

            const certIntermediario = forge.pki.createCertificate();
            certIntermediario.publicKey = chaveIntermediaria.publicKey;

            certIntermediario.serialNumber = new Date().getTime().toString();
            certIntermediario.validity.notBefore = new Date();
            certIntermediario.validity.notAfter = new Date();
            certIntermediario.validity.notAfter.setFullYear(certIntermediario.validity.notBefore.getFullYear() + 2);

            certIntermediario.setSubject([ // Informações do certificado intermediário
                { name: 'commonName', value: 'JAMA Certificado Digital' },
                { name: 'countryName', value: 'BR (Brasil)' },
                { shortName: 'ST', value: 'TO' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);

            certIntermediario.setIssuer([ // Emissor é a própria CA raiz
                { name: 'commonName', value: 'JAMA Certificado Digital' },
                { name: 'countryName', value: 'BR (Brasil)' },
                { shortName: 'ST', value: 'TO' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);

            certIntermediario.sign(chavePrivadaCa, forge.md.sha256.create());
            const pemCertIntermediario = forge.pki.certificateToPem(certIntermediario);
            const pemChaveIntermediaria = forge.pki.privateKeyToPem(chaveIntermediaria.privateKey);

            const { data: dadosCert, error: erroCertUpload } = await supabase
                .storage
                .from('intermediario')
                .upload(`cert_intermediario.pem`, pemCertIntermediario);

            const { data: dadosChave, error: erroChaveUpload } = await supabase
                .storage
                .from('intermediario')
                .upload(`chave_intermediaria.pem`, pemChaveIntermediaria);

            if (erroChaveUpload || erroCertUpload) {
                throw new Error('Erro ao fazer upload da chave intermediária: ' + erroChaveUpload.message + erroCertUpload.message);
            }

            console.log('Certificado intermediário e chave privada armazenados com sucesso!');
            return dadosCert + dadosCert;
        } catch (error) {
            console.error('Erro ao criar o certificado intermediário:', error.message || error);
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
                .update({ chave_publica: chave_publ, link_chave_privada: publicURL, })
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
                .select('certificadoDados')
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

            const privateKeyPem = await buscarChavePrivadaIntermediaria(idUsuario); //pega chave privada
            if (!privateKeyPem) {
                throw new Error('Chave privada não encontrada.');
            }
            const privateKeyIntermediaria = forge.pki.privateKeyFromPem(privateKeyPem);

            cert.sign(privateKeyIntermediaria, forge.md.sha256.create()); // Assina o certificado

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
                .update({ certificadoDados: dadosCertificado, link_certificado: linkCert })
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
            const cert = dados.certificadoDados;
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

    const verificarAssinatura = async (idDocumento, documento, chavePublica) => {
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

    const buscarChavePrivadaIntermediaria = async () => {
        const { data, error } = supabase
            .storage
            .from('intermediario')
            .getPublicUrl('chave_intermediaria.pem');
        if (error || !data || !data.publicUrl) {
            console.error('Erro ao buscar a URL pública da chave privada:', error);
            return null;
        }
        const linkChavePrivada = data.publicUrl;
        const response = await fetch(linkChavePrivada);
        return await response.text();
    };

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
            verificarAssinatura,
            buscarChavePrivada
        }}>
            {children}
        </AppContext.Provider>
    );
}