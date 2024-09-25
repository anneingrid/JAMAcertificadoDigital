import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../back/ConexaoBD';
import { AppContext } from '../back/Provider';
import { FaFileSignature, FaFolder } from 'react-icons/fa';
import { Accordion, Toast, Button } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const ListaDocumentos = () => {
    const { usuarioLogado, assinar,documentosNaoAssinados, fetchDocumentos } = useContext(AppContext);
    const [documentos, setDocumentos] = useState([]);
    const [showToast, setShowToast] = useState(false); 
    const [toastMessage, setToastMessage] = useState(''); 

    const assinarDocumento = async (idDocumento) => {
        try {
            const resultado = await assinar(idDocumento, usuarioLogado.id_usuario);
            if (resultado) {
                setToastMessage('✅ Assinatura gerada com sucesso! Hash: ' + resultado);
                setShowToast(true);

                
                fetchDocumentos();
            }
        } catch (error) {
            console.error('Erro ao assinar o documento:', error.message);
            setToastMessage('❌ Erro ao assinar o documento.');
            setShowToast(true);
        }
    };

    return (
        <div>
            <span className="hdois"><FaFolder className='iconTop' />Documentos</span>
            <Accordion flush>
                {documentosNaoAssinados.map((documento) => (
                    <Accordion.Item
                        eventKey={documento.id_documento}
                        key={documento.id_documento}
                        style={{
                            borderBottom: '1px solid lightgray',
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
                                    <div className="dados"><strong>Id do Propietário:</strong> {documento.id_usuario}</div>
                                    <div className="dados"><strong>URL documento:</strong> <a href={documento.urlDocumento} target="_blank" rel="noopener noreferrer">
                                        <span>Abrir arquivo</span>
                                    </a></div>
                                    <div className="dados"><strong>Hash do documento:</strong> {documento.hash_do_documento}</div>
                                </div>

                                <div>
                                    <button onClick={() => assinarDocumento(documento.id_documento)} className='primary-butao'>
                                        <FaFileSignature className='icons' /> Assinar
                                    </button>
                                </div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={5000} 
                autohide
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)', 
                    minWidth: '400px', 
                    textAlign: 'center', 
                    zIndex: 9999 
                }}
            >
                <Toast.Header>
                    <strong className="me-auto">Notificação</strong>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </div>
    );
};

export default ListaDocumentos;
