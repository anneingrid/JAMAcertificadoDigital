import React, { useContext, useEffect } from 'react';
import { AppContext } from '../back/Provider';

const ListarArquivos = () => {
    const { arquivos, loading, fetchArquivos } = useContext(AppContext);

    // Faz o fetch de arquivos quando o componente é montado
    useEffect(() => {
        fetchArquivos(); 
    }, []); // Chama a função uma única vez quando o componente é montado

    // Mostra o loading enquanto os arquivos estão sendo carregados
    if (loading) {
        return <p>Carregando arquivos...</p>;
    }

    // Se não há arquivos, mostra uma mensagem adequada
    if (arquivos.length === 0) {
        return <p>Nenhum arquivo encontrado.</p>;
    }

    return (
        <div className="documentos-container">
            <h2>Arquivos Disponíveis</h2>
            <div className="arquivos-lista">
                {arquivos.map((arquivo) => (
                    <div className="arquivo-item" key={arquivo.name}>
                        <p>{arquivo.name}</p>
                        {/* <button onClick={() => baixarArquivo(arquivo.name)}>Baixar</button> */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListarArquivos;
