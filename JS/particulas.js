// Fagulhas mágicas flutuando pela tela — só decoração, sem interação.
// A posição/tempo de cada uma é sorteado, pra parecer orgânico e não repetitivo.
(function criarParticulasMagicas() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = document.createElement('div');
    container.className = 'particulas-magicas';
    container.setAttribute('aria-hidden', 'true');

    const QUANTIDADE = 16;
    for (let i = 0; i < QUANTIDADE; i++) {
        const particula = document.createElement('span');
        const esquerda = Math.random() * 100;
        const duracao = 10 + Math.random() * 12;
        const atraso = Math.random() * duracao;
        const deriva = (Math.random() * 60 - 30) + 'px';

        particula.style.left = esquerda + 'vw';
        particula.style.animationDuration = duracao + 's';
        particula.style.animationDelay = '-' + atraso + 's'; // começa "no meio" do ciclo
        particula.style.setProperty('--deriva-x', deriva);

        container.appendChild(particula);
    }

    document.body.appendChild(container);
})();
