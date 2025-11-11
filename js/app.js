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

                    const dominio = email.split('@')[1]?.split('.')[0]?.toLowerCase(); // pega parte após @

                    if (dominio === 'admin') {
                        setTimeout(() => IU.navegar('usuarios.html'), 700);
                    } else {
                        setTimeout(() => IU.navegar('perfil.html'), 700);
                    }
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
                const telefone = (document.getElementById('telefone')?.value || '').trim();
                const dataNascimento = (document.getElementById('dataNascimento')?.value || '').trim();
                const cep = (document.getElementById('cep')?.value || '').trim();
                const senha = document.getElementById('senha')?.value || '';
                const confirmaSenha = document.getElementById('confirmaSenha')?.value || '';

                if (!nome || !email || !senha || !confirmaSenha || !cep || !dataNascimento) {
                    IU.mensagem('mensagem', 'Preencha todos os campos obrigatórios.');
                    return;
                }

                if (senha !== confirmaSenha) {
                    IU.mensagem('mensagem', 'As senhas não coincidem.');
                    return;
                }

                if (senha.length < 6) {
                    IU.mensagem('mensagem', 'A senha deve ter pelo menos 6 caracteres.');
                    return;
                }

                if (UsuariosRepositorio.existeEmail(email)) {
                    IU.mensagem('mensagem', 'E-mail já cadastrado.');
                    return;
                }

                const usuario = {
                    id: Date.now(),
                    nome,
                    email,
                    telefone,
                    dataNascimento,
                    cep,
                    senha
                };

                // Salva o usuário
                UsuariosRepositorio.adicionar(usuario);

                // Cria sessão automática após cadastro
                Sessao.definir({
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    dataNascimento: usuario.dataNascimento,
                    cep: usuario.cep
                });

                IU.mensagem('mensagem', 'Cadastro realizado com sucesso!', 'sucesso');

                // Limpa campos
                ['nome', 'email', 'telefone', 'dataNascimento', 'cep', 'senha', 'confirmaSenha']
                    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

                // Redireciona direto para o perfil
                setTimeout(() => IU.navegar('perfil.html'), 1000);
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

    // --------------------------- Login com Google -----------------------------
    window.addEventListener('load', function () {
        const googleDiv = document.getElementById('googleLoginBtn');
        if (!googleDiv) return; // só executa na página de login

        google.accounts.id.initialize({
            client_id: "737705245330-rmi811nld99d5vinvgisem7fnt5iqne8.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });

        google.accounts.id.renderButton(
            googleDiv,
            { theme: "outline", size: "large", width: "100%" }
        );
    });

    function handleCredentialResponse(response) {
        try {
            const data = jwt_decode(response.credential);
            console.log("Usuário logado com Google:", data);

            const usuario = {
                id: data.sub,
                nome: data.name,
                email: data.email,
                telefone: data.phone_number || '',
                dataNascimento: '',
                cep: ''
            };

            // Cria ou atualiza o usuário no repositório local
            if (!UsuariosRepositorio.existeEmail(usuario.email)) {
                UsuariosRepositorio.adicionar({ ...usuario, senha: null });
            }

            // Define a sessão com os dados do Google
            Sessao.definir({ id: usuario.id, nome: usuario.nome, email: usuario.email });

            IU.mensagem('mensagem', `Bem-vindo, ${usuario.nome}!`, 'sucesso');

            // Redireciona após login
            setTimeout(() => IU.navegar('perfil.html'), 1000);

        } catch (e) {
            console.error("Erro ao processar login do Google:", e);
            IU.mensagem('mensagem', 'Erro ao autenticar com o Google.');
        }
    }


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

    // Perfil
    window.voltarPaginaInicial = () => { IU.navegar('index.html'); };


    // Render e verificação de acesso
    document.addEventListener('DOMContentLoaded', () => {
        const pagina = window.location.pathname.split('/').pop();
        const usuarioLogado = Sessao.obter();

        // Ajusta o link de login conforme o tipo de usuário logado
        const configurarLinkLogin = () => {
            const linkEl = document.getElementById('loginIconLink');
            if (!linkEl) return; // Sai se não encontrar o ícone

            if (usuarioLogado) {
                // Se o usuário estiver logado
                const dominio = usuarioLogado.email.split('@')[1]?.split('.')[0]?.toLowerCase();

                if (dominio === 'admin') {
                    linkEl.href = 'usuarios.html'; // Admin
                } else {
                    linkEl.href = 'perfil.html';   // Usuário Comum
                }
            } else {
                // Se o usuário não estiver logado
                linkEl.href = 'login.html';
            }
        };
        configurarLinkLogin();

        // Se estiver na página de usuários
        if (pagina === 'usuarios.html') {
            // Se não estiver logado, manda pro login
            if (!usuarioLogado) {
                IU.navegar('login.html');
                return;
            }

            // Verifica se o domínio do e-mail não é admin
            const dominio = usuarioLogado.email.split('@')[1]?.split('.')[0]?.toLowerCase();
            if (dominio !== 'admin') {
                alert('Acesso restrito. Você será redirecionado para seu perfil.');
                IU.navegar('perfil.html');
                return;
            }

            // Caso seja admin, carrega a lista normalmente
            Paginas.usuarios.carregarListaUsuarios();
        }

        // Se estiver na página de perfil, exibe as informações do usuário logado
        if (pagina === 'perfil.html') {
            if (!usuarioLogado) {
                IU.navegar('login.html');
                return;
            }

            const perfilCampos = {
                nome: document.getElementById('perfil-nome'),
                email: document.getElementById('perfil-email'),
                dataNascimento: document.getElementById('perfil-dataNascimento'),
                telefone: document.getElementById('perfil-telefone'),
                cep: document.getElementById('perfil-cep')
            };

            const usuarioCompleto = UsuariosRepositorio.obterPorEmail(usuarioLogado.email);

            if (usuarioCompleto) {
                perfilCampos.nome.textContent = usuarioCompleto.nome || '-';
                perfilCampos.email.textContent = usuarioCompleto.email || '-';
                perfilCampos.dataNascimento.textContent = usuarioCompleto.dataNascimento || '-';
                perfilCampos.telefone.textContent = usuarioCompleto.telefone || '-';
                perfilCampos.cep.textContent = usuarioCompleto.cep || '-';
            } else {
                IU.mensagem('mensagem', 'Usuário não encontrado.');
            }
        }

    });

    // --------------------------- Edição do Perfil ------------------------------
    window.editarPerfil = function () {
        const container = document.getElementById('perfil-detalhes');
        const usuarioSessao = Sessao.obter();
        if (!usuarioSessao) {
            IU.navegar('login.html');
            return;
        }

        const usuario = UsuariosRepositorio.obterPorEmail(usuarioSessao.email);
        if (!usuario) {
            alert('Usuário não encontrado.');
            return;
        }

        const jaEditando = container.dataset.editando === 'true';

        if (!jaEditando) {
            // Entrar em modo de edição
            container.dataset.editando = 'true';

            // Transforma os spans em inputs
            container.querySelectorAll('.campo-perfil').forEach(div => {
                const label = div.querySelector('label').textContent;
                const span = div.querySelector('span');
                const id = span.id.replace('perfil-', '');

                if (id === 'email') return; // não permite alterar email

                const valorAtual = span.textContent !== '[Carregando...]' ? span.textContent : '';
                const input = document.createElement('input');
                input.type = id === 'dataNascimento' ? 'date' : 'text';
                input.id = `input-${id}`;
                input.value = valorAtual;
                input.className = 'input-edicao';
                div.replaceChild(input, span);
            });

            // Muda texto do botão
            const botaoEditar = document.querySelector('button[onclick="editarPerfil()"]');
            botaoEditar.textContent = '💾 Salvar Alterações';

        } else {
            // Salvar alterações
            const novosDados = {
                nome: document.getElementById('input-nome')?.value || usuario.nome,
                telefone: document.getElementById('input-telefone')?.value || usuario.telefone,
                dataNascimento: document.getElementById('input-dataNascimento')?.value || usuario.dataNascimento,
                cep: document.getElementById('input-cep')?.value || usuario.cep,
            };

            // Atualiza dados no repositório
            const lista = UsuariosRepositorio.obterTodos().map(u => {
                if (u.email === usuario.email) {
                    return { ...u, ...novosDados };
                }
                return u;
            });
            UsuariosRepositorio.salvarTodos(lista);

            // Atualiza também a sessão
            Sessao.definir({ ...usuarioSessao, ...novosDados });

            // Sai do modo de edição
            container.dataset.editando = 'false';

            // Recria os spans com os novos valores
            container.querySelectorAll('.campo-perfil').forEach(div => {
                const input = div.querySelector('input');
                const span = div.querySelector('span');
                const id = input
                    ? input.id.replace('input-', '')
                    : span
                        ? span.id.replace('perfil-', '')
                        : null;

                if (!id) return; // segurança extra

                const novoValor = novosDados[id] || usuario[id] || '-';
                const novoSpan = document.createElement('span');
                novoSpan.id = `perfil-${id}`;
                novoSpan.textContent = novoValor;

                // Se houver input, substitui; se houver span, atualiza
                if (input) {
                    div.replaceChild(novoSpan, input);
                } else if (span) {
                    span.textContent = novoValor;
                }
            });

            // Muda texto do botão de volta
            const botaoEditar = document.querySelector('button[onclick="editarPerfil()"]');
            botaoEditar.textContent = '📝 Editar Dados';

            IU.mensagem('mensagem', 'Dados atualizados com sucesso!', 'sucesso');
        }
    };

    // Disponível para depuração
    window.__app = { Armazenamento, UsuariosRepositorio, Sessao, IU, Paginas };
})(window, document);
