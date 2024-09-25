import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../back/ConexaoBD';
import { Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEye, FaFileContract } from 'react-icons/fa';
import { AppContext } from '../back/Provider';

const ListaDocumentosAssinados = () => {
    const { usuarioLogado, assinar, documentosAssinados, fetchDocumentos } = useContext(AppContext);

    const formatarData = (data) => {
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    return (
        <div>

            <span className="hdois"><FaFileContract className='iconTop' />Documentos Assinados</span>
            <Accordion flush>
                {documentosAssinados.length > 0 ? (
                    documentosAssinados.map((documento) => (
                        <Accordion.Item
                            eventKey={documento.id_documento}
                            key={documento.id_documento}
                            style={{
                                padding: '10px',
                                marginBottom: '10px',
                            }}
                        >
                            <Accordion.Header>
                                {documento.id_documento} - {documento.descricao_documento || 'Descrição não disponível'}
                            </Accordion.Header>
                            <Accordion.Body>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div className="dados"><strong>Id do Documento:</strong> {documento.id_documento}</div>
                                        <div className="dados"><strong>Assinado em:</strong> {documento.assinadoEm}</div>
                                        <div className="dados" style={{
                                            whiteSpace: 'nowrap', 
                                            overflow: 'hidden',    
                                            textOverflow: 'ellipsis', 
                                            maxWidth: '100%'      
                                        }}>
                                            <strong>Hash Assinatura:</strong> {documento.assinaturaHash.substring(0, 20)}...
                                        </div>
                                        <div className="dados"><strong>Assinado por:</strong> {documento.id_usuario}</div>


                                        <div className="dados"><strong>URL documento:</strong> <a href={documento.urlDocumento} target="_blank" rel="noopener noreferrer">
                                            <span>Abrir arquivo</span>
                                        </a></div>
                                    </div>

                                    <div>

                                        <button className='primary-butao'> <FaEye className='icons' />Verificar</button>
                                    </div>
                                </div>



                            </Accordion.Body>

                        </Accordion.Item>
                    ))
                ) : (
                    <p>Nenhum documento assinado encontrado.</p>
                )}
            </Accordion>
        </div>
    );
};

export default ListaDocumentosAssinados;
