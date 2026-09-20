// Menos estrelas em telas pequenas: mais leve para o celular
const QUANTIDADE_ESTRELAS = window.innerWidth < 700 ? 12 : 30;

for (let i = 0; i < QUANTIDADE_ESTRELAS; i++) { // Coloquei 30, mas pode voltar para 100 depois

    // Posição X aleatória
    let posX = Math.random() * window.innerWidth;
    
    // Velocidade aleatória
    let velocidade = Math.random() * 2 + 0.5;
    
    // Criação da estrela
    let estrela = document.createElement('div');
    estrela.textContent = '🌟';
    estrela.style.position = 'fixed';
    estrela.style.pointerEvents = 'none';
    estrela.style.userSelect = 'none';
    estrela.style.zIndex = '9998';
    
    // 💡 Correção 1: Aqui aplicamos a posição X aleatória!
    estrela.style.left = posX + 'px';
    
    // Vou iniciar de baixo da tela
    let posY = window.innerHeight; 
    estrela.style.top = posY + 'px';

    //Dá opacidade aleatória de 0.3 a 1.0
    estrela.style.opacity = Math.random() * 0.5;
    
    document.body.appendChild(estrela);

    // 💡 Correção 2: Função animar e sua chamada FICAM DENTRO do loop!
    function animar() {
        posY -= velocidade; // Sobe
        estrela.style.top = posY + 'px';
        
        // Se ela sair da tela por cima, faz ela voltar lá para baixo!
        if (posY < -50) {
            posY = window.innerHeight;
            // E damos uma nova posição horizontal para não ficar repetitivo
            estrela.style.left = (Math.random() * window.innerWidth) + 'px';
        }
        
        requestAnimationFrame(animar);
    }
    
    // Chama a animação para ESTA estrela específica
    animar(); 
}

// ═══════════════════════════════════════════════════════════════
// VARINHAS VOADORAS (Cruzam a tela de um lado para o outro e vão embora)
// ═══════════════════════════════════════════════════════════════
function criarVarinhasVoadoras(quantidade = 2) {
    for (let i = 0; i < quantidade; i++) {
        const varinha = document.createElement('div');
        varinha.textContent = '🪄';
        varinha.style.position = 'fixed';
        varinha.style.pointerEvents = 'none'; // Não bloqueia cliques
        varinha.style.userSelect = 'none';
        varinha.style.zIndex = '9997';

        document.body.appendChild(varinha);

        let posX = -200;
        let posY = -200;
        let velX = 0;
        let velY = 0;
        let sentido = 1; // 1: esquerda -> direita | -1: direita -> esquerda
        let tempo = 0;
        let emVoo = false;

        // Prepara e dispara uma nova travessia pela tela
        function lancarVarinha() {
            varinha.style.fontSize = (Math.random() * 0.8 + 2.2) + 'rem'; // Tamanho variado
            sentido = Math.random() < 0.5 ? 1 : -1;

            if (sentido === 1) {
                // Começa fora da tela pela esquerda
                posX = -100;
                velX = Math.random() * 1.5 + 2.5; // Velocidade para a direita
            } else {
                // Começa fora da tela pela direita
                posX = window.innerWidth + 100;
                velX = -(Math.random() * 1.5 + 2.5); // Velocidade para a esquerda
            }

            // Altura aleatória na tela
            posY = Math.random() * (window.innerHeight - 200) + 60;
            velY = (Math.random() - 0.5) * 0.8; // Leve desvio vertical
            tempo = Math.random() * 10;
            emVoo = true;
        }

        // Animação contínua da varinha
        function voar() {
            if (emVoo) {
                tempo += 0.04;
                posX += velX;
                posY += velY + Math.sin(tempo) * 0.7; // Leve flutuação ondulada

                // Inclina a ponta da varinha na direção do voo
                const inclinacao = sentido === 1 ? (25 + Math.sin(tempo) * 8) : (-25 - Math.sin(tempo) * 8);
                const espelhamento = sentido === 1 ? 'scaleX(1)' : 'scaleX(-1)';

                varinha.style.left = posX + 'px';
                varinha.style.top = posY + 'px';
                varinha.style.transform = `${espelhamento} rotate(${inclinacao}deg)`;

                // Verifica se já atravessou e saiu completamente da tela
                const saiuPelaDireita = sentido === 1 && posX > window.innerWidth + 100;
                const saiuPelaEsquerda = sentido === -1 && posX < -100;

                if (saiuPelaDireita || saiuPelaEsquerda) {
                    emVoo = false;
                    // Espera um tempo aleatório (1.5 a 3.5 segundos) e cruza de novo
                    const espera = Math.random() * 2000 + 1500;
                    setTimeout(lancarVarinha, espera);
                }
            }

            requestAnimationFrame(voar);
        }

        // Espaça o lançamento inicial para cada varinha aparecer em um momento diferente
        setTimeout(lancarVarinha, i * 2500);
        voar();
    }
}

// Quantidade de varinhas cruzando a tela (pode alterar para 1, 2, 3, etc.)
criarVarinhasVoadoras(2);