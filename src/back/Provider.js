import React, { createContext, useState, useEffect, Children } from 'react';
// import { supabase } from './ConexaoBD';
// import bcrypt from 'bcryptjs';
// import forge from 'node-forge';
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
                .from('usuarios')
                .select('*')
                .eq('nome_usuario', nome)
                .single();

            if (nomeExistente) {
                return { error: 'Nome de usuário já está em uso. Escolha outro.' };
            }

            const { data: emailExistente } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .single();

            if (emailExistente) {
                return { error: 'E-mail já está em uso. Escolha outro.' };
            }

            const hashedPassword = await hashPassword(senha);
            const { data, error } = await supabase
                .from('usuarios')
                .insert([{ nome_usuario: nome, email: email, senha: hashedPassword }]);

            if (error) {
                console.error('Erro ao cadastrar o usuário:', error.message || error);
                return { error: 'Erro ao cadastrar o usuário. Tente novamente.' };
            }

            return { success: 'Usuário cadastrado com sucesso!' };
        } catch (error) {
            console.error('Erro no processo de cadastro:', error.message || error);
            return { error: 'Erro no processo de cadastro. Tente novamente.' };
        }
    };
    const hashPassword = async (password) => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    };

    // ----------- LOGIN --------------------
    const login = async (email, password) => {
        try {
            const { data: usuario, error: fetchError } = await supabase
                .from('usuarios')
                .select('id_usuario, nome_usuario, senha')
                .eq('email', email)
                .single();

            if (fetchError || !usuario) {
                localStorage.removeItem('usuarioLogado');
                return { error: 'Usuário não encontrado.' };
            }

            const isPasswordCorrect = bcrypt.compareSync(password, usuario.senha);

            if (!isPasswordCorrect) {
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
            const { data: buscaUsuario, error: erroBuscaUsuario } = await supabase
                .from('usuarios')
                .select('chave_privada, chave_publica')
                .eq('id_usuario', idUsuario);



            const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

            const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
            const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

            const { data, error } = await supabase
                .from('usuarios')
                .update({ chave_publica: publicKeyPem, chave_privada: privateKeyPem })
                .match({ id_usuario: idUsuario });

            if (error) {
                console.error('Erro ao armazenar as chaves:', error.message || error);
                return null;
            }

            return data;

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