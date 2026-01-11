# 📱 Crediário App - Gestão Financeira Mobile

Sistema completo de gestão de clientes e débitos desenvolvido em **React Native** com **TypeScript** e **SQLite**. O aplicativo permite o controle total de crediário para pequenos negócios, funcionando 100% offline.

---

## 🚀 Funcionalidades Principais

* ✅ **Gestão de Clientes (CRUD):** Cadastro, visualização, edição e exclusão de clientes e dívidas.
* ✅ **Banco de Dados Offline:** Persistência de dados local utilizando **SQLite**, garantindo que nada se perca ao fechar o app.
* ✅ **Painel Financeiro Inteligente:** Cálculo automático em tempo real do "Total a Receber" de todos os clientes.
* ✅ **Sistema de Status (Vencimento):**
    * 🟢 **Verde:** Dívida recente (menos de 30 dias).
    * 🔴 **Vermelho:** Dívida atrasada (mais de 30 dias).
* ✅ **Busca Instantânea:** Filtro de clientes por nome em tempo real.
* ✅ **Cobrança via WhatsApp:** Botão integrado que abre o WhatsApp do cliente com uma mensagem de cobrança personalizada já preenchida.
* ✅ **UX/UI Refinada:** Máscaras de input automáticas para CPF, Telefone e Data.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** TypeScript
* **Framework:** React Native (Expo)
* **Banco de Dados:** Expo SQLite
* **Roteamento:** Expo Router
* **Integração:** Linking API (WhatsApp)

---

## 📱 Como rodar o projeto

### Pré-requisitos
* Node.js instalado
* Emulador Android/iOS ou App Expo Go no celular

### Passo a passo
1. Clone o repositório:
```bash
git clone [https://github.com/FernandoCamposJr/CrediarioApp.git](https://github.com/FernandoCamposJr/CrediarioApp.git)