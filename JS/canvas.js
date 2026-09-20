const canvas = document.getElementById('meuCanvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas para cobrir toda a janela
function redimensionar() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
redimensionar();
window.addEventListener('resize', redimensionar);

let mouseX = -100;
let mouseY = -100;
let mouseAtivo = false;
let sobreCard = false;

// Ouve o mouse. O brilho só existe para quem usa mouse de verdade (PC, ou celular/tablet com mouse conectado).
// Toques e caneta são ignorados: no celular sem mouse a luz fica sempre desligada.
window.addEventListener('pointermove', function(evento) {
    if (evento.pointerType !== 'mouse') {
        mouseAtivo = false;
        return;
    }

    mouseX = evento.clientX;
    mouseY = evento.clientY;
    mouseAtivo = true;

    // Detetive de Cards: O mouse está num card?
    if (evento.target.closest('.card') || evento.target.closest('.card-interno')) {
        sobreCard = true;
    } else {
        sobreCard = false;
    }
});

// Um toque na tela apaga a luz (o navegador do celular simula um "mouse" depois do toque)
window.addEventListener('pointerdown', function(evento) {
    if (evento.pointerType !== 'mouse') {
        mouseAtivo = false;
    }
});

// Esconde a luz quando o mouse sai da janela
document.addEventListener('mouseleave', function() {
    mouseAtivo = false;
});

// Raio da bolinha
// Raio da bolinha
const RAIO_BOLINHA = 6;

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mouseAtivo) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, RAIO_BOLINHA, 0, Math.PI * 2);

        if (sobreCard) {
            // Em cima do card: transparência aumenta (80% transparente, alpha 0.2)
            ctx.fillStyle = 'rgba(26, 71, 42, 0.2)';
            ctx.shadowColor = 'rgba(26, 71, 42, 0.25)';
            ctx.shadowBlur = 8;
        } else {
            // No fundo normal: cor sólida com ~40% de transparência (alpha 0.6)
            ctx.fillStyle = 'rgba(26, 71, 42, 0.6)';
            ctx.shadowColor = 'rgba(26, 71, 42, 0.4)';
            ctx.shadowBlur = 15;
        }

        ctx.fill();
    }
}

// Loop de animação
function loop() {
    desenhar();
    requestAnimationFrame(loop);
}

// Inicia o loop
loop();