/* Boteco Catch - Game Logic */

function startCatchGame() {
    const container = document.getElementById('game-canvas-container');
    container.innerHTML = `
        <div class="game-ui">
            <div class="game-score">Pontos: <span id="score">0</span></div>
            <div class="game-score">Vidas: <span id="lives">3</span></div>
        </div>
        <div id="player" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-5xl transition-all duration-75">
            <i class="fas fa-utensils text-white shadow-lg"></i>
        </div>
    `;

    document.getElementById('game-container').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    let score = 0;
    let lives = 3;
    let gameActive = true;
    const player = document.getElementById('player');
    let playerX = container.offsetWidth / 2;

    // Player Movement (Touch/Mouse)
    const movePlayer = (e) => {
        if (!gameActive) return;
        const rect = container.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        playerX = Math.max(25, Math.min(container.offsetWidth - 25, x));
        player.style.left = playerX + 'px';
    };

    container.addEventListener('mousemove', movePlayer);
    container.addEventListener('touchmove', movePlayer);

    const items = [
        { icon: 'fa-drumstick-bite', color: '#facc15', points: 10, type: 'good' },
        { icon: 'fa-beer', color: '#fde047', points: 20, type: 'good' },
        { icon: 'fa-pizza-slice', color: '#fb923c', points: 15, type: 'good' },
        { icon: 'fa-file-invoice-dollar', color: '#ef4444', points: -30, type: 'bad' },
        { icon: 'fa-bomb', color: '#000', points: -50, type: 'bad' }
    ];

    function createItem() {
        if (!gameActive) return;

        const itemData = items[Math.floor(Math.random() * items.length)];
        const item = document.createElement('div');
        item.className = 'absolute text-3xl animate-fall';
        item.innerHTML = `<i class="fas ${itemData.icon}" style="color: ${itemData.color}"></i>`;
        
        const startX = Math.random() * (container.offsetWidth - 30);
        item.style.left = startX + 'px';
        item.style.top = '-40px';
        container.appendChild(item);

        let posY = -40;
        const speed = 3 + (score / 100); // Speed up as score grows

        const fallInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(fallInterval);
                item.remove();
                return;
            }

            posY += speed;
            item.style.top = posY + 'px';

            // Collision Check
            const playerRect = player.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();

            if (
                itemRect.bottom >= playerRect.top &&
                itemRect.right >= playerRect.left &&
                itemRect.left <= playerRect.right &&
                itemRect.top <= playerRect.bottom
            ) {
                score = Math.max(0, score + itemData.points);
                document.getElementById('score').innerText = score;
                
                if (itemData.type === 'bad') {
                    lives--;
                    document.getElementById('lives').innerText = lives;
                    player.classList.add('animate-shake');
                    setTimeout(() => player.classList.remove('animate-shake'), 500);
                } else {
                    player.classList.add('scale-110');
                    setTimeout(() => player.classList.remove('scale-110'), 200);
                }

                clearInterval(fallInterval);
                item.remove();

                if (lives <= 0) endGame();
            }

            // Missed Check
            if (posY > container.offsetHeight) {
                clearInterval(fallInterval);
                item.remove();
                if (itemData.type === 'good') {
                    // Optional: lose points if good item missed? Nah, keep it friendly.
                }
            }
        }, 16);
    }

    const spawnInterval = setInterval(createItem, 1200);

    function endGame() {
        gameActive = false;
        clearInterval(spawnInterval);
        showGameOver(score);
    }

    activeGame = {
        stop: () => {
            gameActive = false;
            clearInterval(spawnInterval);
        },
        start: startCatchGame
    };
}
