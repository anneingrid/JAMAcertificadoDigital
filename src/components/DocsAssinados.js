import React, { useEffect, useState, useContext } from 'react';
import { Accordion, Toast, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEye, FaFileContract } from 'react-icons/fa';
import { AppContext } from '../back/Provider';

const ListaDocumentosAssinados = () => {
    const { documentosAssinados, extrairChavePublica, obterCertificado, usuarioLogado, verificarAssinatura4 } = useContext(AppContext);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [buscando, setBuscando] = useState(true);

    useEffect(() => {
        if (documentosAssinados) {
            setBuscando(false);
        }

    }, [documentosAssinados]);


    const verificar = async (idDocumento, documento) => {
        setCarregando(true);
        try {
            const certificado = await obterCertificado(usuarioLogado.id_usuario);
            const chavePublica = await extrairChavePublica(certificado);
            const resultado = verificarAssinatura4(idDocumento, documento, chavePublica);
            console.log(resultado)
            if (resultado) {
                setToastMessage('✅Assinatura válida!');
                setShowToast(true);

            } else {
                setToastMessage('❌ Erro: Assinatura inválida!');
                setShowToast(true);
            }
        } catch (erro) {
            console.error(erro);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="hdois mb-4">
                <FaFileContract className='iconTop' /> Documentos Assinados
            </h2>
            {buscando ? (
                <div>
                    <Accordion flush>
                        {[1, 2, 3].map((_, index) => (
                            <Accordion.Item eventKey={index} key={index}>
                                <Accordion.Header>
                                    <div className="placeholder-glow" style={{ margin: '20px 0', padding: '10px' }}>
                                        <p className="placeholder col-12" style={{ height: '16px' }}></p>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className="placeholder-glow" style={{ margin: '20px 0', padding: '10px' }}>
                                        <p className="placeholder col-12" style={{ height: '16px' }}></p>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </div>
            ) : (
                <Accordion flush>
                    {documentosAssinados.length > 0 ? (
                        documentosAssinados.map((documento) => (
                            <Accordion.Item eventKey={documento.id_documento} key={documento.id_documento}>
                                <Accordion.Header>
                                    {documento.id_documento} - {documento.descricao_documento || 'Descrição não disponível'}
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="flex-grow-1">
                                            <div className="dados"><strong>ID:</strong> {documento.id_documento}</div>
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



                                        <button className='primary-butao'
                                            onClick={() => verificar(documento.id_documento,documento.descricao_documento)}

                                        >
                                            {carregando ? (
                                                <div className="d-flex align-items-center">
                                                    <Spinner animation="border" size="sm" />
                                                    <span className="ms-2">Verificando...</span>
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center">
                                                    <FaEye className='me-2' /> Verificar
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))
                    ) : (
                        <div style={{
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
                            textAlign: 'center'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <svg width="64" height="64" fill="#d3d3d3" viewBox="0 0 24 24">
                                    <path d="M19 3H9.42L7.2 1H1v22h22V5a2 2 0 00-2-2zm0 16H5V5h2.58l2.22 2H19z" />
                                </svg>
                            </div>
                            <p style={{ margin: 0, fontSize: '18px' }}>Nenhum documento assinado.</p>
                        </div>
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

export default ListaDocumentosAssinados;
