import React, { useState, useContext } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../back/Provider';

function Cadastro() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const { cadastrarUsuario } = useContext(AppContext);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        if (formData.senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        try {
            const result = await cadastrarUsuario(formData.nome, formData.email, formData.senha);
            setSuccess(result.success);
        } catch {
            setError('Ocorreu um erro ao cadastrar o usuário. Tente novamente.');
        } finally {

            setShowToast(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
            setLoading(false); // Garante que o estado de carregamento é atualizado
        }
    };

    return (
        <Container fluid className="cadastro-container">
            <Row>
                <Col md={12} className="cadastro-box">
                    <span className="hdois text-center mb-4 cadastro-title">Por favor, preencha o formulário para se cadastrar!</span>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formFullName">
                            <Form.Label>Nome Completo:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu nome completo"
                                className="cadastro-input"
                                name="nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label>Email:</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Digite seu email"
                                className="cadastro-input"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mt-3">
                            <Form.Label>Senha:</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Digite sua senha"
                                className="cadastro-input"
                                name="senha"
                                value={formData.senha}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group controlId="formConfirmPassword" className="mt-3">
                            <Form.Label>Confirmar Senha:</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirme sua senha"
                                className="cadastro-input"
                                name="confirmarSenha"
                                value={formData.confirmarSenha}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <button type="submit" className="cadastro-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" /> Carregando...
                                </>
                            ) : (
                                'Cadastrar'
                            )}
                        </button>

                        <div className="cadastro-entrar">
                            <span>Já tem uma conta? </span>
                            <a href="/" className="login-link">Entrar</a>
                        </div>
                    </Form>
                </Col>
            </Row>

            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
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
                <Toast.Body>Cadastro realizado com sucesso! Você será redirecionado para o login.</Toast.Body>
            </Toast>
        </Container>
    );
}

export default Cadastro;
