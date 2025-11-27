# Site Notícias – README

Projeto frontend de um portal de notícias com sistema simples de autenticação e gerenciamento de usuários baseado em **LocalStorage**. A aplicação não possui backend e funciona inteiramente no navegador.

---

## 📁 Estrutura de Pastas

```
📦 projeto
 ┣ 📂 css
 │   ┗ 📄 style.css
 ┣ 📂 js
 │   ┣ 📄 app.js
 │   ┗ 📄 script.js
 ┣ 📄 index.html
 ┣ 📄 login.html
 ┣ 📄 cadastro.html
 ┣ 📄 perfil.html
 ┣ 📄 usuarios.html
 ┗ 📄 redefinir-senha.html
```

---

## 🎨 CSS – `style.css`

Contém **todo o estilo utilizado em todas as páginas**, incluindo:

* Layout geral
* Grid das notícias
* Estilos dos formulários
* Estilos dos painéis logados
* Responsividade completa para mobile, tablet e desktop

---

## 🧠 JavaScript – Arquivos

### `app.js`

Arquivo responsável por **toda a lógica de interação e funcionalidade** das páginas, **exceto a landing page** (`index.html`).

Principais responsabilidades:

* Sistema de login e cadastro usando LocalStorage
* Regras para diferenciar **usuário comum** e **administrador**
* Validação de formulários
* Redirecionamentos de fluxo
* Lógica das páginas **perfil**, **login**, **cadastro**, **redefinir senha** e **usuários**

### `script.js`

Arquivo dedicado exclusivamente à **landing page (`index.html`)**.

Funções principais:

* Lógica da página inicial
* Carregamento de notícias de acordo com categorias
* Implementação da API externa **newsdata.io**

#### 📰 API NewsData.io

A landing page consome notícias através da API pública **NewsData**.

Informações importantes:

* O plano gratuito permite **200 requisições por dia**
* Caso a página seja recarregada muitas vezes em pouco tempo, a API retorna o erro **429 — Too Many Requests**, fazendo com que o site pare de carregar notícias por alguns minutos
* Se preferir obter sua própria chave (API Key), basta acessar: [https://newsdata.io/](https://newsdata.io/)

---

## 🌐 Páginas HTML

### `index.html`

A página inicial do site.

* Exibe automaticamente notícias carregadas da API
* Possui menu superior com botão **Login**
* Categorias que fazem scroll para seções dentro da própria landing page

---

### `login.html`

Página de autenticação.

* Login com email e senha via LocalStorage

* **Autenticação via Google (frontend)**

  * Para funcionar, é necessário cadastrar os usuários de teste no Google Cloud Console: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

  * Além disso, é necessário **substituir o `client_id`** no trecho de código presente em `app.js`:

    ```javascript
    google.accounts.id.initialize({
        client_id: "SEU ID AQUI",
        callback: handleCredentialResponse
    });
    ```

  * Para obter seu próprio **Client ID**, siga estes passos:

    1. Acesse [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
    2. Crie um projeto (se ainda não existir)
    3. Vá em **Credenciais** → **Criar credencial** → **ID do Cliente OAuth**
    4. Escolha *Aplicativo Web*
    5. Cadastre o domínio ou `http://localhost` como origem autorizada
    6. Copie o **Client ID** gerado e substitua no código acima

* Botões de **esqueci a senha** e **cadastro**

---

### `cadastro.html`

Página de cadastro do usuário.

* Campos de registro de novo usuário
* Redirecionamento para o login se o usuário já possuir conta

---

### `perfil.html`

Página logada de **usuário comum**.

* Acessível quando o email cadastrado **não** contém `@admin`
* Exibe informações principais do usuário
* Permite edição de dados, exceto o email

---

### `usuarios.html`

Página logada de **administrador**.

* Acessível quando o email cadastrado contém `@admin`
* Lista **todos os usuários cadastrados** (apenas LocalStorage)

---

### `redefinir-senha.html`

Fluxo de redefinição de senha.

* Solicita o email registrado
* Se existir no LocalStorage, exibe campos para nova senha

---

## 📌 Observações Importantes

* O projeto **não** possui backend → todos os dados são simulados via LocalStorage
* Para autenticação Google, é necessário configurar credenciais no Console Cloud
* Todo JS está centralizado em arquivos externos (`script.js` e `app.js`) seguindo boas práticas

---

## ✔️ Tecnologias Utilizadas

* **HTML5**
* **CSS3 (responsivo)**
* **JavaScript puro**
* **LocalStorage** para simulação de dados
* **API NewsData.io** para notícias

---

## 📄 Licença

Projeto criado para fins de estudo e demonstração. Pode ser utilizado e modificado livremente.
