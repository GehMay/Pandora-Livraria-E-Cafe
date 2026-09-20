// ═══════════════════════════════════════════════════════════════
// LOGIN, CADASTRO E SESSÃO
// Sessão simples de demonstração: guarda no navegador quem entrou,
// só para personalizar a tela. Não protege nenhuma página.
// ═══════════════════════════════════════════════════════════════

const CHAVE_SESSAO = 'pandoraUsuario';

function lerSessao() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
    } catch {
        return null;
    }
}

function salvarSessao(usuario) {
    try {
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
    } catch {
        // Navegador com armazenamento bloqueado: segue sem guardar a sessão
    }
}

function sair() {
    try {
        localStorage.removeItem(CHAVE_SESSAO);
    } catch { /* sem armazenamento, nada a limpar */ }
    window.location.href = 'index.html';
}

async function enviarParaApi(rota, dados) {
    const resposta = await fetch(rota, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    const corpo = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
        throw new Error(corpo.erro || 'Algo deu errado. Tente de novo.');
    }
    return corpo;
}

// ── Formulários de login e cadastro ─────────────────────────────
const formulario = document.querySelector('form[data-api]');

if (formulario) {
    const mensagem = document.getElementById('mensagem-form');
    const botao = formulario.querySelector('button[type="submit"]');
    const textoBotao = botao.textContent;

    function mostrarMensagem(texto, tipo) {
        mensagem.textContent = texto;
        mensagem.className = 'form-mensagem form-mensagem-' + tipo;
        mensagem.hidden = false;
    }

    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const dados = Object.fromEntries(new FormData(formulario));
        botao.disabled = true;
        botao.textContent = 'Aguarde...';
        mensagem.hidden = true;

        try {
            const ehCadastro = formulario.dataset.api === '/api/cadastro';
            let resultado = await enviarParaApi(formulario.dataset.api, dados);

            // Depois de criar a conta, já entra direto
            if (ehCadastro) {
                resultado = await enviarParaApi('/api/login', { email: dados.email, senha: dados.senha });
            }

            salvarSessao(resultado.usuario);
            mostrarMensagem('Tudo certo! Entrando...', 'ok');
            setTimeout(() => { window.location.href = 'index.html'; }, 700);
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro');
            botao.disabled = false;
            botao.textContent = textoBotao;
        }
    });
}

// ── Cabeçalho: mostra quem está logado ──────────────────────────
const usuarioLogado = lerSessao();
const areaAcoes = document.querySelector('.cabecalho_acoes');

if (usuarioLogado && areaAcoes) {
    const primeiroNome = String(usuarioLogado.nome || '').split(' ')[0];

    const saudacao = document.createElement('span');
    saudacao.className = 'cabecalho_saudacao';
    saudacao.textContent = 'Olá, ' + primeiroNome + (usuarioLogado.tipo === 'admin' ? ' · Equipe' : '');

    const botaoSair = document.createElement('button');
    botaoSair.type = 'button';
    botaoSair.className = 'btn-login';
    botaoSair.textContent = 'Sair';
    botaoSair.addEventListener('click', sair);

    areaAcoes.replaceChildren(saudacao, botaoSair);
}
