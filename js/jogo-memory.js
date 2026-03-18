/* Boteco Memory - Game Logic */

function startMemoryGame() {
    const container = document.getElementById('game-canvas-container');
    container.innerHTML = `
        <div class="game-ui">
            <div class="game-score">Pares: <span id="matches">0</span>/8</div>
            <div class="game-score">Cliques: <span id="clicks">0</span></div>
        </div>
        
        <div class="flex flex-col items-center justify-center h-full w-full">
            <div id="memory-board" class="memory-grid">
                <!-- Cards will be injected here -->
            </div>
            <p class="text-white/60 mt-4 text-sm font-montserrat">Encontre todos os pares!</p>
        </div>
    `;

    document.getElementById('game-container').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const icons = [
        'fa-beer', 'fa-drumstick-bite', 'fa-hamburger', 'fa-utensils',
        'fa-wine-glass', 'fa-pizza-slice', 'fa-cocktail', 'fa-star'
    ];
    
    // Duplicate and shuffle
    let cardIcons = [...icons, ...icons];
    cardIcons.sort(() => Math.random() - 0.5);

    const board = document.getElementById('memory-board');
    let flippedCards = [];
    let matches = 0;
    let clicks = 0;
    let lockBoard = false;

    function createBoard() {
        cardIcons.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card flex items-center justify-center text-white/10 hover:border-gold transition-colors';
            card.dataset.icon = icon;
            card.innerHTML = `<i class="fas fa-question opacity-20"></i>`;
            
            card.addEventListener('click', () => flipCard(card));
            board.appendChild(card);
        });
    }

    function flipCard(card) {
        if (lockBoard || card.classList.contains('flipped') || flippedCards.includes(card)) return;

        clicks++;
        document.getElementById('clicks').innerText = clicks;
        
        card.classList.add('flipped');
        card.innerHTML = `<i class="fas ${card.dataset.icon} text-red-900"></i>`;
        card.classList.remove('text-white/10');
        card.style.background = '#fff';
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }

    function checkMatch() {
        lockBoard = true;
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.icon === card2.dataset.icon;

        if (isMatch) {
            matches++;
            document.getElementById('matches').innerText = matches;
            flippedCards = [];
            lockBoard = false;
            
            if (matches === 8) {
                setTimeout(() => showGameOver(clicks), 1000);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card1.innerHTML = `<i class="fas fa-question opacity-20"></i>`;
                card1.style.background = '#7b1113';
                
                card2.classList.remove('flipped');
                card2.innerHTML = `<i class="fas fa-question opacity-20"></i>`;
                card2.style.background = '#7b1113';
                
                flippedCards = [];
                lockBoard = false;
            }, 1000);
        }
    }

    createBoard();

    activeGame = {
        stop: () => {},
        start: startMemoryGame
    };
}
