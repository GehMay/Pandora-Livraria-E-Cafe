const canvas = document.getElementById('meuCanvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
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
// Função que desenha
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (sobreCard === true) {
        // SOBRE O CARD: Fica um verde esmeralda transparente, para contrastar com o card branco
        ctx.fillStyle = 'rgba(181, 255, 220, 0.66)'; 
        ctx.shadowBlur = 15; // Mantém um brilho suave (antes estava 0!)
    } else {
        // NO FUNDO CINZA: Fica branco com brilho fortíssimo
        ctx.fillStyle = 'rgba(3, 99, 0, 0.64)'; 
        ctx.shadowBlur = 60; // Aumentei o brilho para ficar bem forte
    }
    
    // A cor da aura de luz
    ctx.shadowColor = '#0b3b25';

    // Desenha a esfera
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(desenhar);
}

desenhar(); // Começa tudo!