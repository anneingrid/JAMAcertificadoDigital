import React, { useState, useContext } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../back/Provider';

function Login({ setIsAuthenticated }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AppContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (email.trim() !== '' && password.trim() !== '') {
            const result = await login(email, password);
            if (result.error) {
                setError(result.error);
            } else {
                setIsAuthenticated(true);
                navigate('/Principal');
            }
        } else {
            setError('Por favor, preencha todos os campos.');
        }
    };

    return (
        <div fluid className="login-container">
            <div className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div md={12} className="login-box">
                    <span className="hdois text-center mb-4 login-title">
                        <img src="logo.png" alt="JAMA Certificado" className="login-image" />
                    </span>
                    <div className="logo">
                        <span className="jama-text-logo">JAMA</span><br />
                        <span className="certificado-text-logo">Certificado Digital</span>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleLogin}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label className="text-start">Email</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-input"
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" className="mt-3">
                            <Form.Label className="text-start">Senha</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                            />
                        </Form.Group>

                        <button type="submit" className="login-vai">
                            Entrar
                        </button>
                    </Form>

                    <div className="register-container">
                        <span>Não tem uma conta? </span>
                        <Link to="/Cadastro" className="register-link">Registre-se</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
