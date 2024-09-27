import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../back/Provider';
import { FaFileSignature, FaFolder } from 'react-icons/fa';
import { Accordion, Toast, Placeholder } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThreeDots } from 'react-loader-spinner';

const ListaDocumentos = () => {
    const { usuarioLogado, assinar, documentosNaoAssinados, fetchDocumentos } = useContext(AppContext);
    const [carregando, setCarregando] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [buscando, setBuscando] = useState(true);

    useEffect(() => {
        if (documentosNaoAssinados) {
            setBuscando(false);
        }
    }, [documentosNaoAssinados]);

    const assinarDocumento = async (idDocumento) => {
        setCarregando(true);
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
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div>
            <span className="hdois"><FaFolder className='iconTop' />Documentos</span>

            {buscando ? (
                <div>
                    <Accordion flush>
                        {[1, 2, 3].map((_, index) => (
                            <Accordion.Item
                                eventKey={index}
                                key={index}
                                style={{
                                    borderBottom: '1px solid lightgray',
                                    padding: '10px',
                                    marginBottom: '10px',
                                }}
                            >
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
                        ))}
                    </Accordion>
                </div>
            ) : (
                <Accordion flush>
                    {documentosNaoAssinados.map((documento) => (
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
                                        <div className="dados"><strong>Id:</strong> {documento.id_documento}</div>
                                        <div className="dados"><strong>Usuário:</strong> {documento.Usuario.nome_usuario}</div>
                                        <div className="dados"><strong>URL documento:</strong> <a href={documento.urlDocumento} target="_blank" rel="noopener noreferrer">
                                            <span>Abrir arquivo</span>
                                        </a></div>
                                        <div className="dados"><strong>Hash do documento:</strong> {documento.hash_do_documento}</div>
                                    </div>

                                    <div>
                                        <button onClick={() => assinarDocumento(documento.id_documento)} className='primary-butao'>
                                            {carregando ? (
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <ThreeDots
                                                        visible={true}
                                                        height="25"
                                                        width="25"
                                                        color="white"
                                                        secondaryColor="#df003b95"
                                                        radius="9"
                                                        ariaLabel="three-dots-loading"
                                                        wrapperStyle={{}}
                                                        wrapperClass=""
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <FaFileSignature className='icons' /> Assinar
                                                </>
                                            )}

                                        </button>
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}

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
