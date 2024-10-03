import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        
        <div style={sectionStyle}>
          <img src="/logo.png" alt="Logo JAMA Certificado Digital" style={{ maxWidth: '100px' }} />
          <p style={descriptionStyle}>
            JAMA Certificado Digital - Soluções práticas e seguras para geração de certificados digitais e assinaturas eletrônicas.
          </p>
          <p style={descriptionStyle}>
            Obrigada Fábio, <span style={{color:'#e9688a'}}>por nunca acreditar</span>!
          </p>
        </div>

        
      </div>

      <div style={copyrightStyle}>
        <p style={{ margin: 0, color: '#aaa' }}>
          &copy; 2024 JAMA Certificado Digital. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

const footerStyle = {
  backgroundColor: '#383838',
  padding: '2rem 0',
  borderTop: '4px solid #e9688a',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems:'center',
  flexWrap: 'wrap',
  textAlign: 'center',

};

const sectionStyle = {
  flex: '1 1 20%',
};

const descriptionStyle = {
  margin: '1rem 0',
  lineHeight: '1.6',
  color: 'white',
};

const copyrightStyle = {
  textAlign: 'center',
  padding: '1rem 0',
  borderTop: '1px solid #333',
  marginTop: '1.5rem',
};

export default Footer;
