# 🌐 TechThings - Plataforma IoT para Monitoramento e Visualização de Dados

Projeto desenvolvido para a disciplina **Internet das Coisas (DLSC808)** — **Universidade Federal de Santa Maria (UFSM)**  
👨‍🏫 **Prof. Célio Trois**  
📍 Santa Maria, RS — 2025/02  

🔗 **Acesse o projeto online:** [https://internet-of-things-gamma.vercel.app/](https://internet-of-things-gamma.vercel.app/)

---

## 🧩 Descrição do Projeto

A **TechThings** é uma **plataforma web para aplicações IoT (Internet das Coisas)**, desenvolvida para **monitorar e visualizar dados em tempo real** provenientes de múltiplos dispositivos baseados em **ESP32**.

O sistema integra hardware e software, permitindo:
- 📡 **Captura de dados** de sensores conectados ao ESP32.  
- 🌐 **Envio de dados** para o servidor via HTTP ou MQTT.  
- 🧠 **Processamento e armazenamento** das leituras recebidas.  
- 📊 **Visualização em tempo real** através de uma **dashboard interativa**.  
- ⚙️ **Geração de alertas e automações** simples baseadas em condições configuráveis.

---

## 🖥️ Tecnologias Utilizadas

### 🔹 Frontend
- **React.js** — Framework principal da interface  
- **Chart.js** — Visualização gráfica dos dados dos sensores  
- **CSS3** — Estilização e layout responsivo  
- **Vercel** — Hospedagem do frontend  

### 🔹 Backend 
- **Node.js** — Recepção e tratamento de dados enviados pelos ESP32  
- **Banco de Dados** — Armazenamento histórico de leituras  

### 🔹 Hardware
- **ESP32** — Microcontrolador principal dos dispositivos IoT  
- **Sensores utilizados:**
  - Sensor de Temperatura – DS18B20  
  - Acelerômetro e Giroscópio MPU-6050  
  - Sensor de Gestos e Cor APDS-9960  
  - Sensor de Velocidade Encoder  
  - Sensor Ultrassônico HC-SR04  
  - Módulo Relé 5V 10A JQC3F  
  - Micro Servo Motor 9g SG90  
  - Joystick KY023 (3 eixos)  
  - Teclado Matricial 4x4  
  - Controle Remoto IR + Receptor IR  

---

## 📈 Funcionalidades Principais

- Dashboard responsiva com **cards individuais por sensor**  
- Exibição de **valores atuais e histórico em gráfico dinâmico**  
- Atualização automática dos dados  
- Integração futura com backend via API REST ou MQTT  
- Estrutura modular para fácil adição de novos sensores  

---

## 🚀 Deploy

O projeto está disponível online através da **Vercel**:  
👉 [https://internet-of-things-gamma.vercel.app/](https://internet-of-things-gamma.vercel.app/)

---

## ⚙️ Instalação Local

Caso queira rodar o projeto localmente:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/internet-of-things.git

# Acesse a pasta do frontend
cd iot-frontend

# Instale as dependências
npm install

# Inicie o servidor local
npm start
