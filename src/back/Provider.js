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

            console.log(novoUsuario.id_usuario)

            if (error) {
                console.error('Erro ao cadastrar o usuário:', error.message || error);
                return { error: 'Erro ao cadastrar o usuário. Tente novamente.' };
            }
            // ----------- GERAR E ARMAZENAR CHAVES --------------------
            const chaves = await gerarChaves(novoUsuario.id_usuario);


            if (!chaves) {
                console.error('Erro ao armazenar as chaves:');
                return { error: 'Erro ao gerar e armazenar as chaves. Tente novamente.' };
            }

            return { success:'Usuário cadastrado com sucesso e chaves geradas!' };
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

            const { data, error } = await supabase
                .from('Usuario')
                .update({ chave_publica: chave_publ, chave_privada: chave_priv })
                .match({ id_usuario: idUsuario });

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
    const certificado = async (idUsuario) => {
        try {
            const publicKeyPem = await buscarChavePublica(idUsuario);
            const publicKey = forge.pki.publicKeyFromPem(publicKeyPem); //transformando as bixa em pem

            const nome = await getNomeUsuario(idUsuario);
            const cert = forge.pki.createCertificate();
            console.log('Certificado criado:', cert);
            cert.publicKey = publicKey;

            const numeroDeSerie = idUsuario.replace(/-/g, ''); // numero de serie
            cert.serialNumber = '1234567890';//converte o UUID para o tipo certo
            cert.validity.notBefore = new Date(); // data de inicio (atual)
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); //validade de 1 ano

            cert.setSubject([
                { name: 'commonName', value: nome },
                { name: 'countryName', value: 'BR (Brasil)' },
                { shortName: 'ST', value: 'TO' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);
            cert.setIssuer([
                { name: 'commonName', value: 'JAMA Certificado Digital' },
                { name: 'countryName', value: 'BR (Brasil)' },
                { shortName: 'ST', value: 'TO' },
                { name: 'localityName', value: 'Palmas' },
                { name: 'organizationName', value: 'FC Solutions' }
            ]);

            const privateKeyPem = await buscarChavePrivada(idUsuario);
            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
            cert.sign(privateKey);

            const pemCert = forge.pki.certificateToPem(cert);
            console.log(pemCert);

            //---- SALVAR ISSO NO BANCO EM NOME DE JESUS ------
            const { data, error } = await supabase
                .from('Usuario')
                .update({ certificado: pemCert })
                .eq('id_usuario', idUsuario);

            if (error) {
                throw new Error('Erro:' + error.message);
            } else {
                alert('Certificado armazendo:', data);
            }


        } catch (error) {
            console.error('Erro ao gerar certificado:', error.message || error);
            return null;
        }
    };

    const buscarUuidPorNome = async (nomeUsuario) => {
        try {
            const { data, error } = await supabase
                .from('Usuario')
                .select('id_usuario')
                .eq('nome_usuario', nomeUsuario)
                .single();

            if (error) {
                console.error('Erro ao buscar UUID:', error.message || error);
                return null;
            }

            if (!data) {
                console.log('Usuário não encontrado.');
                return null;
            }

            return data.id_usuario; // Retorna o UUID encontrado
        } catch (error) {
            console.error('Erro na busca pelo UUID:', error.message || error);
            return null;
        }
    };

    //--------------------- DADOS USUÁRIO  ------------------
    const getNomeUsuario = async (idUsuario) => {
        try {
            const { data, error } = await supabase
                .from('Usuario')
                .select('nome_usuario')
                .eq('id_usuario', idUsuario);

            if (error) {
                throw error;
            }

            if (data.length > 0) {
                const { nome_usuario } = data[0];
                return nome_usuario;
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

            if (error || !data.length) {
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

    return (
        <AppContext.Provider value={{
            cadastrarUsuario,
            usuarioLogado,
            login,
            logout,
            certificado,
            buscarUuidPorNome
        }}>
            {children}
        </AppContext.Provider>
    );
};

