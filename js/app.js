/*! app.js — Arquitetura em português com um único arquivo JS
   Módulos:
   - Armazenamento: helpers para LocalStorage
   - UsuariosRepositorio: CRUD de usuários
   - Sessao: sessão didática (não segura para produção)
   - IU (Interface do Usuário): mensagens e navegação
   - Paginas: lógica de cada página (login, cadastro, redefinição, usuários)
   - Exposição de funções globais para uso com onclick nos HTMLs
*/
(function (window, document) {
    'use strict';

    // --------------------------- Armazenamento -----------------------------
    const Armazenamento = {
        ler(chave, padrao = null) {
            try {
                const bruto = localStorage.getItem(chave);
                return bruto ? JSON.parse(bruto) : padrao;
            } catch (e) {
                alert('Erro ao ler o armazenamento');
                return padrao;
            }
        },
        escrever(chave, valor) { localStorage.setItem(chave, JSON.stringify(valor)); },
        remover(chave) { localStorage.removeItem(chave); }
    };

    // --------------------------- Repositório de Usuários -------------------
    const UsuariosRepositorio = {
        CHAVE: 'usuarios',
        obterTodos() { return Armazenamento.ler(this.CHAVE, []); },
        salvarTodos(lista) { Armazenamento.escrever(this.CHAVE, lista); },
        existeEmail(email) {
            const alvo = String(email || '').toLowerCase();
            return this.obterTodos().some(u => (u.email || '').toLowerCase() === alvo);
        },
        obterPorEmail(email) {
            const alvo = String(email || '').toLowerCase();
            return this.obterTodos().find(u => (u.email || '').toLowerCase() === alvo) || null;
        },
        adicionar(usuario) {
            const lista = this.obterTodos();
            lista.push(usuario);
            this.salvarTodos(lista);
        },
        atualizarSenha(email, novaSenha) {
            const lista = this.obterTodos().map(u => {
                if ((u.email || '').toLowerCase() === String(email).toLowerCase()) {
                    u.senha = novaSenha;
                }
                return u;
            });
            this.salvarTodos(lista);
        },
        removerPorEmail(email) {
            const lista = this.obterTodos().filter(u => u.email !== email);
            this.salvarTodos(lista);
        },
        limpar() { Armazenamento.remover(this.CHAVE); }
    };

    // --------------------------- Sessão (didática) -------------------------
    const Sessao = {
        CHAVE: 'sessaoUsuario',
        definir(usuarioPublico) { Armazenamento.escrever(this.CHAVE, usuarioPublico); },
        obter() { return Armazenamento.ler(this.CHAVE, null); },
        limpar() { Armazenamento.remover(this.CHAVE); }
    };

    // --------------------------- Interface do Usuário ----------------------
    const IU = {
        mensagem(idElemento, texto, tipo = 'erro') { // 'erro' | 'sucesso'
            const el = document.getElementById(idElemento);
            if (!el) return;
            el.textContent = texto;
            el.className = 'msg ' + (tipo === 'sucesso' ? 'sucesso' : 'erro');
            el.style.display = 'block';
        },
        navegar(url) { window.location.href = url; }
    };

    // --------------------------- Páginas -----------------------------------
    const Paginas = {
        login: {
            entrar() {
                const email = (document.getElementById('email')?.value || '').trim();
                const senha = document.getElementById('senha')?.value || '';

                if (!email || !senha) { IU.mensagem('mensagem', 'Preencha e-mail e senha.'); return; }

                const usuario = UsuariosRepositorio
                    .obterTodos()
                    .find(u => (u.email || '').toLowerCase() === email.toLowerCase() && u.senha === senha);

                if (usuario) {
                    Sessao.definir({ id: usuario.id, nome: usuario.nome, email: usuario.email });
                    IU.mensagem('mensagem', 'Login realizado com sucesso!', 'sucesso');
                    setTimeout(() => IU.navegar('usuarios.html'), 700);
                } else {
                    IU.mensagem('mensagem', 'E-mail ou senha inválidos.');
                }
            },
            irParaCadastro() { IU.navegar('cadastro.html'); },
            irParaRedefinicao() { IU.navegar('redefinir-senha.html'); }
        },

        cadastro: {
            salvarCadastro() {
                const nome = (document.getElementById('nome')?.value || '').trim();
                const email = (document.getElementById('email')?.value || '').trim();
                const senha = document.getElementById('senha')?.value || '';

                if (!nome || !email || !senha) { IU.mensagem('mensagem', 'Preencha todos os campos.'); return; }
                if (senha.length < 6) { IU.mensagem('mensagem', 'A senha deve ter pelo menos 6 caracteres.'); return; }
                if (UsuariosRepositorio.existeEmail(email)) { IU.mensagem('mensagem', 'E-mail já cadastrado.'); return; }

                UsuariosRepositorio.adicionar({ id: Date.now(), nome, email, senha });
                IU.mensagem('mensagem', 'Cadastro realizado com sucesso!', 'sucesso');
                ['nome', 'email', 'senha'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
                setTimeout(() => IU.navegar('login.html'), 900);
            },
            voltarParaLogin() { IU.navegar('login.html'); }
        },

        redefinicao: {
            verificarEmail() {
                const email = (document.getElementById('resetEmail')?.value || '').trim();
                const camposSenha = document.getElementById('resetFields');
                const msg = document.getElementById('resetMessage');
                const botao = document.getElementById('verifyEmailBtn');
                const usuario = UsuariosRepositorio.obterPorEmail(email);

                if (usuario) {
                    msg.textContent = 'E-mail confirmado. Agora redefina sua senha.';
                    msg.className = 'msg sucesso';
                    camposSenha.classList.remove('hidden');
                    botao.disabled = true;
                    document.getElementById('resetEmail').disabled = true;
                } else {
                    msg.textContent = 'E-mail não encontrado.';
                    msg.className = 'msg erro';
                    camposSenha.classList.add('hidden');
                }
            },
            salvarNovaSenha() {
                const email = (document.getElementById('resetEmail')?.value || '').trim();
                const senha1 = (document.getElementById('newPassword')?.value || '').trim();
                const senha2 = (document.getElementById('confirmPassword')?.value || '').trim();
                const msg = document.getElementById('resetMessage');
                const camposSenha = document.getElementById('resetFields');
                const botao = document.getElementById('verifyEmailBtn');
                const emailCampo = document.getElementById('resetEmail');

                if (!senha1 || !senha2) {
                    msg.textContent = 'Preencha ambos os campos de senha.';
                    msg.className = 'msg erro';
                    return;
                }

                if (senha1 !== senha2) {
                    msg.textContent = 'As senhas não coincidem.';
                    msg.className = 'msg erro';
                    return;
                }

                // Verifica se a nova senha é igual à senha atual
                const usuario = UsuariosRepositorio.obterPorEmail(email);
                if (usuario && usuario.senha === senha1) {
                    msg.textContent = 'A nova senha não pode ser igual à senha atual.';
                    msg.className = 'msg erro';
                    return;
                }

                // Atualiza a senha
                UsuariosRepositorio.atualizarSenha(email, senha1);
                msg.textContent = 'Senha redefinida com sucesso!';
                msg.className = 'msg sucesso';

                // Resetar estado visual
                camposSenha.classList.add('hidden');
                botao.disabled = false;
                emailCampo.disabled = false;
                document.getElementById('resetForm').reset();

                setTimeout(() => IU.navegar('login.html'), 1000);
            }
        },

        usuarios: {
            carregarListaUsuarios() {
                const cont = document.getElementById('lista');
                const vazio = document.getElementById('lista-vazia');
                if (!cont) return;

                const usuarios = UsuariosRepositorio.obterTodos();
                cont.innerHTML = '';
                if (vazio) vazio.style.display = usuarios.length ? 'none' : 'block';

                usuarios.forEach((u, i) => {
                    const div = document.createElement('div');
                    div.className = 'user';
                    div.innerHTML = `
            <strong>${i + 1}. ${u.nome}</strong><br>
            <span class="small">${u.email}</span>
            <div class="acoes">
              <button onclick="removerUsuario('${u.email}')">Remover</button>
            </div>`;
                    cont.appendChild(div);
                });
            },
            removerUsuario(email) { UsuariosRepositorio.removerPorEmail(email); this.carregarListaUsuarios(); },
            limparUsuarios() { if (confirm('Apagar todos os cadastros?')) { UsuariosRepositorio.limpar(); this.carregarListaUsuarios(); } },
            voltarPagina() { history.back(); },
            sairSessao() { Sessao.limpar(); IU.navegar('login.html'); }
        }
    };

    // --------------------------- Expor para onclick ------------------------
    // Login
    window.entrar = () => Paginas.login.entrar();
    window.irParaCadastro = () => Paginas.login.irParaCadastro();
    window.irParaRedefinicao = () => Paginas.login.irParaRedefinicao();

    // Cadastro
    window.salvarCadastro = () => Paginas.cadastro.salvarCadastro();
    window.voltarParaLogin = () => Paginas.cadastro.voltarParaLogin();

    // Redefinição
    window.verificarEmail = () => Paginas.redefinicao.verificarEmail();
    window.salvarNovaSenha = () => Paginas.redefinicao.salvarNovaSenha();

    // Usuários
    window.carregarListaUsuarios = () => Paginas.usuarios.carregarListaUsuarios();
    window.removerUsuario = (email) => Paginas.usuarios.removerUsuario(email);
    window.limparUsuarios = () => Paginas.usuarios.limparUsuarios();
    window.voltarPagina = () => Paginas.usuarios.voltarPagina();
    window.sairSessao = () => Paginas.usuarios.sairSessao();

    // Render automático da lista na página de usuários
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('lista')) { Paginas.usuarios.carregarListaUsuarios(); }
    });

    // Disponível para depuração
    window.__app = { Armazenamento, UsuariosRepositorio, Sessao, IU, Paginas };
})(window, document);