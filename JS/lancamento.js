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

            // Cola na tela
            container.appendChild(copia);
        });

    } catch (erro) {
        console.error("Ops! Erro ao tentar carregar os livros:", erro);
    }
}

carregarLivrosNaTela();