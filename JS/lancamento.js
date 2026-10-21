async function carregarLivrosNaTela() {
    try {
        const resposta = await fetch('/api/lancamentos');
        const livros = await resposta.json();

        // 1. Pegamos a div vazia que você preparou no HTML
        const container = document.getElementById('meus-lancamentos');

        // 2. Limpamos ela só por garantia
        container.innerHTML = '';

        // 3. Para cada livro que veio do banco, ele vai desenhar um card!
        livros.forEach(livro => {
            // Pega o molde do HTML
            const molde = document.getElementById('molde-livro');
            const copia = molde.content.cloneNode(true);

            // Preenche os dados do banco nos lugares certos
            copia.querySelector('.book-title').textContent = livro.titulo;
            copia.querySelector('.categoria-livro').textContent = livro.categoria || 'Geral';
            copia.querySelector('.autor-livro').textContent = livro.autor;
            copia.querySelector('.preco-livro').textContent = livro.preco;
            copia.querySelector('.card-interno').dataset.categoria = livro.categoria || 'Geral';
            copia.querySelector('.card-banner').innerHTML = ICONES_POR_CATEGORIA[livro.categoria] || ICONE_LIVRO_PADRAO;

            // Cola na tela
            container.appendChild(copia);
        });

    } catch (erro) {
        console.error("Ops! Erro ao tentar carregar os livros:", erro);
    }
}

// Ícones em SVG (sem preenchimento, só traço) para um visual consistente entre categorias.
const ICONE_LIVRO_PADRAO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"/><path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H12v16h6.5c.83 0 1.5-.67 1.5-1.5v-13Z"/></svg>';

const ICONES_POR_CATEGORIA = {
    'Poções': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v5.5L5.5 16A3 3 0 0 0 8.2 20.5h7.6A3 3 0 0 0 18.5 16L14 8.5V3"/><path d="M8 15h8"/></svg>',
    'Transfiguração': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l10-10"/><path d="M18 3l1 2.5L21.5 6.5 19 7.5 18 10l-1-2.5L14.5 6.5 17 5.5z" fill="currentColor" stroke="none"/></svg>',
    'Artes das Trevas': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3C7.58 3 4 6.58 4 11c0 2.8 1.44 5.26 3.6 6.7V20h2.1v-2h.8v2h2.1v-2h.8v2h2.1v-2.3C18.56 16.26 20 13.8 20 11c0-4.42-3.58-8-8-8Z"/><circle cx="9.5" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.5" cy="11" r="1.2" fill="currentColor" stroke="none"/></svg>',
    'Biografias': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4Z"/><path d="M5 17a2 2 0 0 1 2-2h11"/><path d="M8 8h6M8 11h6"/></svg>',
    'Feitiços': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M6 6l2.2 2.2M15.8 15.8 18 18M18 6l-2.2 2.2M8.2 15.8 6 18"/><circle cx="12" cy="12" r="2.5"/></svg>'
};

carregarLivrosNaTela();
