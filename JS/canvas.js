const canvas = document.getElementById('meuCanvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = canvas.width;
let mouseY = canvas.height;
let sobreCard = false; // Nossa variável nova!

// Ouve o mouse
window.addEventListener('mousemove', function(evento) {
    mouseX = evento.clientX;
    mouseY = evento.clientY;

    // Detetive de Cards: O mouse está num card?
    if (evento.target.closest('.card') || evento.target.closest('.card-interno')) {
        sobreCard = true;
    } else {
        sobreCard = false;
    }
});

// Função que desenha
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (sobreCard === true) {
        // SOBRE O CARD: Fica um verde esmeralda transparente, para contrastar com o card branco
        ctx.fillStyle = 'rgba(181, 255, 220, 0.66)';
        ctx.shadowBlur = 15; // Mantém um brilho suave
    } else {
        // NO FUNDO CINZA: Fica branco com brilho fortíssimo
        ctx.fillStyle = 'rgba(3, 99, 0, 0.64)';
        ctx.shadowBlur = 60; // Aumentei o brilho para ficar bem forte
    }

    // Removendo qualquer desenho fixo no final da tela
    // Certifique-se de que não há código como ctx.fillRect() ou ctx.strokeRect() com coordenadas fixas
    // Se necessário, ajuste aqui para evitar o quadrado no final da tela
}

// Loop de animação
function loop() {
    desenhar();
    requestAnimationFrame(loop);
}

// Inicia o loop
loop();