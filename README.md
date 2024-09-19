# JAMA Certificado Digital

## Visão Geral
Este projeto simula o processo de criação e utilização de um certificado digital, baseado nas diretrizes da Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil). A solução gera um par de chaves RSA de 2048 bits, cria um certificado digital X.509 com informações personalizadas (como país, organização e validade), e usa a chave privada para assinar digitalmente um documento. A chave privada, o certificado e a assinatura são armazenados separadamente.

## Repositório
O código fonte desta solução pode ser acessado no repositório do GitHub.

## Requisitos

### Geração de um Par de Chaves RSA
- Utilizar uma biblioteca de criptografia para gerar um par de chaves RSA.
- O tamanho da chave deve ser de 2048 bits.

### Criação de um Certificado Digital Simulado
- O certificado deve ser um X.509 com as seguintes informações:
  - **País:** BR (Brasil)
  - **Estado/Província:** TO (Tocantins)
  - **Localidade:** Palmas
  - **Organização:** FC Solutions
  - **Nome Comum:** Seu nome
  - **Data de início de validade:** Data atual
  - **Data de término de validade:** Um ano após a data de início

### Salvamento da Chave Privada e do Certificado
- Salvar a chave privada e o certificado digital em arquivos separados.

### Assinatura Digital de um Documento
- Simular a assinatura digital de um documento de texto simples.
- Usar a chave privada associada ao certificado para calcular a assinatura digital.
- Armazenar a assinatura digital em um arquivo separado.

### Documentação do Processo
Documentar o processo passo a passo, incluindo:
- Instalação da biblioteca de criptografia.
- Métodos utilizados para geração de chaves, criação de certificado e assinatura digital.
- Descrição dos códigos utilizados.
- Apresentação do documento original e do documento assinado.

## Arquitetura
- **Front-end:** React JS
- **Back-end e armazenamento:** Supabase
- **Biblioteca para criptografia:** Node Forge

   
