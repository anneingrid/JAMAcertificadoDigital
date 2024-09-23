import React, { createContext, useState, useEffect, Children } from 'react';
import { supabase } from './ConexaoBD';
// import bcrypt from 'bcryptjs';
import forge from 'node-forge';
export const AppContext = createContext();

export const AppProvider = ({ children }) => {

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
                .single();

            if (error) {
                console.error('Erro ao cadastrar o usuário:', error.message || error);
                return { error: 'Erro ao cadastrar o usuário. Tente novamente.' };
            }

            // ----------- GERAR E ARMAZENAR CHAVES --------------------
            const { chavePublica, chavePrivada } = await gerarChaves();
            const { data: chavesArmazenadas, error: erroArmazenamento } = await supabase
                .from('Usuario')
                .update({ chave_publica: chavePublica, chave_privada: chavePrivada })
                .eq('id_usuario', novoUsuario.id_usuario);

            if (erroArmazenamento) {
                console.error('Erro ao armazenar as chaves:', erroArmazenamento.message || erroArmazenamento);
                return { error: 'Erro ao gerar e armazenar as chaves. Tente novamente.' };
            }

            return { success: 'Usuário cadastrado com sucesso e chaves geradas!' };
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
            const chave_privada = forge.pki.privateKeyToPem(keyPair.privateKey);
            const chave_publica = forge.pki.publicKeyToPem(keyPair.publicKey);

            return {chave_privada, chave_publica};

        } catch (error) {
            console.error('Erro ao gerar o par de chaves:', error.message || error);
            return null;
        }
    };


    return (
        <AppContext.Provider value={{
            cadastrarUsuario,
            login,
            logout,
            gerarChaves
        }}>
            {children}
        </AppContext.Provider>
    );
};