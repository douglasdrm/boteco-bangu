/* Perfect Pour - Game Logic */

function startPourGame() {
    const container = document.getElementById('game-canvas-container');
    container.innerHTML = `
        <div class="game-ui">
            <div class="game-score">Sucessos: <span id="score">0</span></div>
            <div class="game-score">Tentativa: <span id="attempt">1</span></div>
        </div>
        
        <div class="flex flex-col items-center justify-center h-full">
            <div class="text-white mb-4 text-center">
                <p class="font-bold">Segure para encher!</p>
                <p class="text-sm opacity-60">Pare na marca amarela.</p>
            </div>
            
            <div class="relative bg-white/20 p-2 rounded-xl mb-8">
                <div class="beer-glass">
                    <div id="liquid" class="beer-liquid"></div>
                    <div id="foam" class="beer-foam"></div>
                    <!-- Target line -->
                    <div class="absolute bottom-[85%] left-0 w-full h-1 bg-gold opacity-50 z-20"></div>
                    <div class="absolute bottom-[95%] left-0 w-full h-1 bg-gold opacity-50 z-20"></div>
                </div>
            </div>
            
            <button id="pour-btn" class="bg-gold text-red-950 px-12 py-6 rounded-full font-paytone text-2xl shadow-2xl active:scale-95 transition-transform select-none">
                ENCHER!
            </button>
        </div>
    `;

    document.getElementById('game-container').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    let score = 0;
    let attempts = 0;
    let isPouring = false;
    let level = 0;
    let speed = 0.5;
    const liquid = document.getElementById('liquid');
    const foam = document.getElementById('foam');
    const pourBtn = document.getElementById('pour-btn');

    const updateUI = () => {
        liquid.style.height = level + '%';
        foam.style.bottom = level + '%';
        foam.style.height = (level > 0 ? 15 : 0) + '%';
    };

    const startPour = () => {
        if (attempts >= 10) return;
        isPouring = true;
        pourBtn.innerText = "PARAR!";
        const move = () => {
            if (!isPouring) return;
            level += speed;
            updateUI();
            if (level >= 100) stopPour();
            else requestAnimationFrame(move);
        };
        requestAnimationFrame(move);
    };

    let pourTimeout;

    const stopPour = () => {
        if (!isPouring) return;
        isPouring = false;
        attempts++;
        document.getElementById('attempt').innerText = attempts;
        
        // Check result
        if (level >= 85 && level <= 95) {
            score++;
            document.getElementById('score').innerText = score;
            pourBtn.className = "bg-green-500 text-white px-12 py-6 rounded-full font-paytone text-xl shadow-2xl transition-all";
            pourBtn.innerText = "PERFEITO! +1";
        } else {
            pourBtn.className = "bg-red-500 text-white px-12 py-6 rounded-full font-paytone text-xl shadow-2xl transition-all";
            pourBtn.innerText = level > 95 ? "TRANSBORDOU!" : "FALTOU CHOPE!";
        }

        pourTimeout = setTimeout(() => {
            if (attempts >= 5) {
                showGameOver(score);
            } else {
                level = 0;
                updateUI();
                pourBtn.className = "bg-gold text-red-950 px-12 py-6 rounded-full font-paytone text-2xl shadow-2xl active:scale-95 transition-transform";
                pourBtn.innerText = "ENCHER!";
                speed += 0.2; // Increase difficulty
            }
        }, 1500);
    };

    // Event Listeners for Touch/Mouse
    pourBtn.addEventListener('mousedown', startPour);
    pourBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startPour(); });
    window.addEventListener('mouseup', stopPour);
    window.addEventListener('touchend', stopPour);

    activeGame = {
        stop: () => {
            isPouring = false;
            clearTimeout(pourTimeout);
            window.removeEventListener('mouseup', stopPour);
            window.removeEventListener('touchend', stopPour);
        },
        start: startPourGame
    };
}
