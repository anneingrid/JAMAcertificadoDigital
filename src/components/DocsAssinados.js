import React, { useEffect, useState, useContext } from 'react';
import { Accordion, Toast } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEye, FaFileContract } from 'react-icons/fa';
import { AppContext } from '../back/Provider';
import { Oval, ThreeDots } from 'react-loader-spinner';

const ListaDocumentosAssinados = () => {
    const { documentosAssinados } = useContext(AppContext);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [carregando, setCarregando] = useState(false);

    const verificar = async () => {
        setCarregando(true);

        try {
            // só pra fazer uma firula
            await new Promise(resolve => setTimeout(resolve, 2000)); 
        } catch (erro) {
            
        } finally {
            setCarregando(false);
            setToastMessage('👀Assinatura verificada!');
            setShowToast(true); 
        }
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

                                        <button className='primary-butao' onClick={verificar}>
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
                                                    <FaEye className='icons' />Verificar

                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>



                            </Accordion.Body>

                        </Accordion.Item>
                    ))
                ) : (
                    <p>Nenhum documento assinado encontrado.</p>
                )}
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

export default ListaDocumentosAssinados;
