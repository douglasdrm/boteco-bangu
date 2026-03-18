/* Perfect Pour - Game Logic */

function startPourGame() {
    const container = document.getElementById('game-canvas-container');
    container.innerHTML = `
        <div class="game-ui">
            <div class="game-score">Pontos: <span id="score">0</span></div>
            <div class="game-score">Vidas: <span id="lives">3</span></div>
        </div>
        
        <div class="flex flex-col items-center justify-center h-full">
            <div class="text-white mb-4 text-center">
                <p id="target-instruction" class="font-bold text-xl text-gold">Preparando...</p>
                <p class="text-sm opacity-60">Segure para encher!</p>
            </div>
            
            <div class="relative bg-white/20 p-2 rounded-xl mb-8">
                <div class="beer-glass">
                    <div id="liquid" class="beer-liquid"></div>
                    <div id="foam" class="beer-foam"></div>
                    <!-- Target lines will be updated dynamically -->
                    <div id="target-zone-visual" class="absolute left-0 w-full bg-gold/30 z-20 transition-all duration-300"></div>
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
    let lives = 3;
    let isPouring = false;
    let level = 0;
    let speed = 0.6;
    let withFoam = true; // Current round goal
    
    const liquid = document.getElementById('liquid');
    const foam = document.getElementById('foam');
    const pourBtn = document.getElementById('pour-btn');
    const instr = document.getElementById('target-instruction');
    const targetVisual = document.getElementById('target-zone-visual');

    const setupRound = () => {
        level = 0;
        withFoam = Math.random() > 0.5;
        updateUI();
        
        if (withFoam) {
            instr.innerText = "COM COLARINHO!";
            instr.className = "font-bold text-xl text-white italic";
            // Target: 82% to 90%
            targetVisual.style.bottom = "82%";
            targetVisual.style.height = "8%"; 
        } else {
            instr.innerText = "SEM COLARINHO! (Até a boca)";
            instr.className = "font-bold text-xl text-gold uppercase";
            // Target: 94% to 98%
            targetVisual.style.bottom = "94%";
            targetVisual.style.height = "4%";
        }
        
        pourBtn.className = "bg-gold text-red-950 px-12 py-6 rounded-full font-paytone text-2xl shadow-2xl active:scale-95 transition-transform";
        pourBtn.innerText = "ENCHER!";
    };

    const updateUI = () => {
        liquid.style.height = level + '%';
        foam.style.bottom = level + '%';
        foam.style.height = (level > 0 ? (withFoam ? 15 : 5) : 0) + '%';
    };

    const startPour = () => {
        if (lives <= 0) return;
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
        
        let success = false;
        if (withFoam) {
            success = (level >= 82 && level <= 92);
        } else {
            success = (level >= 94 && level <= 99);
        }

        if (success) {
            score++;
            document.getElementById('score').innerText = score;
            pourBtn.className = "bg-green-500 text-white px-12 py-6 rounded-full font-paytone text-xl shadow-2xl transition-all";
            pourBtn.innerText = "PERFEITO!";
            speed += 0.05;
        } else {
            lives--;
            document.getElementById('lives').innerText = lives;
            pourBtn.className = "bg-red-500 text-white px-12 py-6 rounded-full font-paytone text-xl shadow-2xl transition-all";
            pourBtn.innerText = level > 98 ? "TRANSBORDOU!" : "ERROU O PONTO!";
            if (lives > 0) {
                // Shake glass on error
                document.querySelector('.beer-glass').classList.add('animate-shake');
                setTimeout(() => document.querySelector('.beer-glass').classList.remove('animate-shake'), 500);
            }
        }

        pourTimeout = setTimeout(() => {
            if (lives <= 0) {
                showGameOver(score);
            } else {
                setupRound();
            }
        }, 1500);
    };

    // Initialize first round
    setupRound();

    // Event Listeners
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
