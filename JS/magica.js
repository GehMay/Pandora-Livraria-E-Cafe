for (let i = 0; i < 30; i++) { // Coloquei 30, mas pode voltar para 100 depois

    // Posição X aleatória
    let posX = Math.random() * window.innerWidth;
    
    // Velocidade aleatória
    let velocidade = Math.random() * 2 + 0.5;
    
    // Criação da estrela
    let estrela = document.createElement('div');
    estrela.textContent = '🌟';
    estrela.style.position = 'fixed';
    
    // 💡 Correção 1: Aqui aplicamos a posição X aleatória!
    estrela.style.left = posX + 'px';
    
    // Vou iniciar de baixo da tela
    let posY = window.innerHeight; 
    estrela.style.top = posY + 'px';

    //Dá opacidade aleatória de 0.3 a 1.0
    estrela.style.opacity = Math.random() * 0.7;
    
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