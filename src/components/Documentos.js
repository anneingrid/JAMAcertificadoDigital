import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../back/Provider';
import { FaFileSignature, FaFolder } from 'react-icons/fa';
import { Accordion, Toast, Placeholder, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import useDocumentos from '../back/Listagem';

const ListaDocumentos = () => {
    const { usuarioLogado, assinar} = useContext(AppContext);
    const { documentosNaoAssinados, fetchDocumentos } = useDocumentos(usuarioLogado);
    const [carregandoDocumento, setCarregandoDocumento] = useState({}); 
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [buscando, setBuscando] = useState(true);

    useEffect(() => {
        if (documentosNaoAssinados) {
            setBuscando(false);
        }
    }, [documentosNaoAssinados]);

    const assinarDocumento = async (idDocumento, descricao) => {
        setCarregandoDocumento((prev) => ({ ...prev, [idDocumento]: true })); 
    
        try {
            const resultado = await assinar(idDocumento, usuarioLogado.id_usuario, descricao);
    
            if (resultado === 'erroCert') {
                setToastMessage('❌ Erro: Certificado não encontrado, crie um para assinar!');

            } else if (resultado) {
                setToastMessage('✅ Assinatura gerada com sucesso! Hash: ' + resultado);

            } else {
                setToastMessage('❌ Erro ao assinar o documento.');
            }
    
            setShowToast(true); 
            fetchDocumentos(); 
        } catch (error) {
            console.error('Erro ao assinar o documento:', error.message);
            setToastMessage('❌ Erro ao assinar o documento: ' + error.message);
            setShowToast(true);
        } finally {
            setCarregandoDocumento((prev) => ({ ...prev, [idDocumento]: false })); 
        }
    };
    

    const placeholderStyles = {
        borderBottom: '1px solid lightgray',
        padding: '10px',
    };

    const emptyStateStyles = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #d3d3d3',
        borderRadius: '12px',
        maxWidth: '500px',
        margin: '20px auto',
        color: '#7a7a7a',
        textAlign: 'center',
    };

    const EmptyState = () => (
        <div style={emptyStateStyles}>
            <div style={{ marginBottom: '20px' }}>
                <svg width="64" height="64" fill="#d3d3d3" viewBox="0 0 24 24">
                    <path d="M19 3H9.42L7.2 1H1v22h22V5a2 2 0 00-2-2zm0 16H5V5h2.58l2.22 2H19z" />
                </svg>
            </div>
            <p style={{ margin: 0, fontSize: '18px' }}>Nenhum documento disponível para assinatura.</p>
        </div>
    );

    const PlaceholderItem = ({ index }) => (
        <Accordion.Item eventKey={index} key={index} style={placeholderStyles}>
            <Accordion.Header>
                <div className="placeholder-glow" style={{ margin: '20px 0', padding: '10px' }}>
                    <p className="placeholder col-12" style={{ height: '16px' }}></p>
                </div>
            </Accordion.Header>
            <Accordion.Body>
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={8} className="mb-2" />
                    <Placeholder xs={6} className="mb-2" />
                    <Placeholder xs={4} className="mb-2" />
                </Placeholder>
            </Accordion.Body>
        </Accordion.Item>
    );

    return (
        <div>
            <span className="hdois mb-4">
                <FaFolder className="iconTop" /> Documentos
            </span>

            {buscando ? (
                <Accordion flush>
                    {[1, 2, 3].map((_, index) => (
                        <PlaceholderItem index={index} key={index} />
                    ))}
                </Accordion>
            ) : (
                <Accordion flush>
                    {documentosNaoAssinados.length > 0 ? (
                        documentosNaoAssinados.map((documento) => (
                            <Accordion.Item
                                eventKey={documento.id_documento}
                                key={documento.id_documento}
                                
                            >
                                <Accordion.Header>
                                    {documento.id_documento} - {documento.descricao_documento || 'Descrição não disponível'}
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div>
                                            <div className="dados">
                                                <strong>Id:</strong> {documento.id_documento}
                                            </div>
                                            <div className="dados">
                                                <strong>Usuário:</strong> {documento.Usuario.nome_usuario}
                                            </div>
                                            <div className="dados">
                                                <strong>URL documento:</strong>{' '}
                                                <a href={documento.urlDocumento} target="_blank" rel="noopener noreferrer">
                                                    <span>Abrir arquivo</span>
                                                </a>
                                            </div>
                                            <div className="dados">
                                                <strong>Hash do documento:</strong> {documento.hash_do_documento.substring(0,20)}...
                                            </div>
                                        </div>

                                        <div>
                                            <button
                                                onClick={() => assinarDocumento(documento.id_documento, documento.descricao_documento)}
                                                className="primary-butao"
                                                disabled={carregandoDocumento[documento.id_documento]}
                                            >
                                                {carregandoDocumento[documento.id_documento] ? (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <div>
                                                            <Spinner animation="border" size="sm" />
                                                        </div>
                                                        <div>Assinando...</div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FaFileSignature className="icons" /> Assinar
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </Accordion>
            )}

            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={5000}
                autohide
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    minWidth: '300px',
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
