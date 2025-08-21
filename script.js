/**
 * Snake Game – Version Web (Canvas + Tailwind)
 */

// Grille logique fixe (ne dépend pas de la taille d'écran)
const GRID_WIDTH = 30;  // colonnes
const GRID_HEIGHT = 24; // lignes
let CELL_PX = 20;       // taille d'une cellule en pixels (responsive)
const FPS = 10; // ticks per second

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game');
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('start-btn');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');
const soundBtn = document.getElementById('sound-btn');

const eatAudio = document.getElementById('eat-audio');
const overAudio = document.getElementById('over-audio');
const dpadUpBtn = document.getElementById('dpad-up');
const dpadDownBtn = document.getElementById('dpad-down');
const dpadLeftBtn = document.getElementById('dpad-left');
const dpadRightBtn = document.getElementById('dpad-right');

let gameLoopId = null;
let lastTickMs = 0;

const COLORS = {
	black: '#000000',
	white: '#ffffff',
	green: '#00ff00',
	darkGreen: '#009b00',
	red: '#ff0000',
};

/** Game State */
let snake = [];
let direction = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let soundEnabled = true;
let touchStartX = null;
let touchStartY = null;
const SWIPE_THRESHOLD_PX = 30;

function resizeCanvasToContainer() {
	// Calcule une taille de cellule adaptée à la largeur disponible
	const container = canvas.parentElement; // wrapper relatif
	const availableWidth = Math.max(200, Math.min(window.innerWidth - 32, container.clientWidth || window.innerWidth));
	const desiredCell = Math.floor(availableWidth / GRID_WIDTH);
	const clampedCell = Math.max(12, Math.min(28, desiredCell));
	CELL_PX = clampedCell;
	canvas.width = GRID_WIDTH * CELL_PX;
	canvas.height = GRID_HEIGHT * CELL_PX;
}

function resetGame() {
	snake = [{ x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) }];
	direction = { x: 1, y: 0 };
	food = generateFood();
	score = 0;
	gameOver = false;
	scoreEl.textContent = '0';
	updateOverlay();
}

function generateFood() {
	while (true) {
		const pos = {
			x: Math.floor(Math.random() * GRID_WIDTH),
			y: Math.floor(Math.random() * GRID_HEIGHT),
		};
		if (!snake.some((s) => s.x === pos.x && s.y === pos.y)) return pos;
	}
}

function changeDirection(newDx, newDy) {
	// Empêche les demi-tours
	if (direction.x === -newDx && direction.y === -newDy) return;
	direction = { x: newDx, y: newDy };
}

function handleKey(e) {
	if (gameOver) return;
	switch (e.key) {
		case 'ArrowUp':
		case 'w':
		case 'W':
			changeDirection(0, -1);
			break;
		case 'ArrowDown':
		case 's':
		case 'S':
			changeDirection(0, 1);
			break;
		case 'ArrowLeft':
		case 'a':
		case 'A':
			changeDirection(-1, 0);
			break;
		case 'ArrowRight':
		case 'd':
		case 'D':
			changeDirection(1, 0);
			break;
	}
}

function bindDpad() {
	if (dpadUpBtn) {
		const up = (ev) => { ev.preventDefault(); changeDirection(0, -1); };
		dpadUpBtn.addEventListener('click', up);
		dpadUpBtn.addEventListener('touchstart', up, { passive: false });
	}
	if (dpadDownBtn) {
		const down = (ev) => { ev.preventDefault(); changeDirection(0, 1); };
		dpadDownBtn.addEventListener('click', down);
		dpadDownBtn.addEventListener('touchstart', down, { passive: false });
	}
	if (dpadLeftBtn) {
		const left = (ev) => { ev.preventDefault(); changeDirection(-1, 0); };
		dpadLeftBtn.addEventListener('click', left);
		dpadLeftBtn.addEventListener('touchstart', left, { passive: false });
	}
	if (dpadRightBtn) {
		const right = (ev) => { ev.preventDefault(); changeDirection(1, 0); };
		dpadRightBtn.addEventListener('click', right);
		dpadRightBtn.addEventListener('touchstart', right, { passive: false });
	}
}

function bindSwipe() {
	canvas.addEventListener('touchstart', (e) => {
		if (!e.touches || !e.touches[0]) return;
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}, { passive: true });

	canvas.addEventListener('touchmove', (e) => {
		// Empêche le scroll pendant le jeu
		e.preventDefault();
	}, { passive: false });

	canvas.addEventListener('touchend', (e) => {
		if (touchStartX == null || touchStartY == null) return;
		const touch = e.changedTouches && e.changedTouches[0];
		if (!touch) return;
		const dx = touch.clientX - touchStartX;
		const dy = touch.clientY - touchStartY;
		touchStartX = touchStartY = null;
		if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) return;
		if (Math.abs(dx) > Math.abs(dy)) {
			// Horizontal
			changeDirection(dx > 0 ? 1 : -1, 0);
		} else {
			// Vertical
			changeDirection(0, dy > 0 ? 1 : -1);
		}
	}, { passive: false });
}

function tick() {
	if (gameOver) return;

	// Nouveau head
	const head = { ...snake[0] };
	head.x += direction.x;
	head.y += direction.y;

	// Collisions murs
	if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
		setGameOver();
		return;
	}

	// Collisions corps
	if (snake.some((s) => s.x === head.x && s.y === head.y)) {
		setGameOver();
		return;
	}

	// Ajout tête
	snake.unshift(head);

	// Manger
	if (head.x === food.x && head.y === food.y) {
		score += 10;
		scoreEl.textContent = String(score);
		food = generateFood();
		if (soundEnabled) try { eatAudio.currentTime = 0; eatAudio.play(); } catch {}
	} else {
		// Avancer: retirer la queue
		snake.pop();
	}
}

function setGameOver() {
	gameOver = true;
	updateOverlay();
	if (soundEnabled) try { overAudio.currentTime = 0; overAudio.play(); } catch {}
}

function updateOverlay() {
	overlay.classList.toggle('hidden', !gameOver);
}

function draw() {
	// Fond
	ctx.fillStyle = COLORS.black;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Serpent
	if (snake.length) {
		// Tête
		ctx.fillStyle = COLORS.darkGreen;
		ctx.fillRect(snake[0].x * CELL_PX, snake[0].y * CELL_PX, CELL_PX, CELL_PX);
		// Corps
		ctx.fillStyle = COLORS.green;
		for (let i = 1; i < snake.length; i++) {
			const s = snake[i];
			ctx.fillRect(s.x * CELL_PX, s.y * CELL_PX, CELL_PX, CELL_PX);
		}
	}

	// Nourriture
	ctx.fillStyle = COLORS.red;
	ctx.fillRect(food.x * CELL_PX, food.y * CELL_PX, CELL_PX, CELL_PX);
}

function gameLoop(ts) {
	if (!lastTickMs) lastTickMs = ts;
	const delta = ts - lastTickMs;
	const tickInterval = 1000 / FPS;
	if (delta >= tickInterval) {
		lastTickMs = ts;
		tick();
	}
	draw();
	gameLoopId = requestAnimationFrame(gameLoop);
}

function start() {
	resetGame();
	if (gameLoopId) cancelAnimationFrame(gameLoopId);
	lastTickMs = 0;
	gameLoopId = requestAnimationFrame(gameLoop);
}

// UI bindings
startBtn.addEventListener('click', () => {
	if (gameOver) {
		start();
	} else if (!gameLoopId) {
		start();
	}
});

soundBtn.addEventListener('click', () => {
	soundEnabled = !soundEnabled;
	soundBtn.setAttribute('aria-pressed', String(soundEnabled));
	soundBtn.textContent = `Son: ${soundEnabled ? 'Activé' : 'Coupé'}`;
});

window.addEventListener('keydown', handleKey);
bindDpad();
bindSwipe();

// Démarrage initial: afficher le plateau sans bouger
resizeCanvasToContainer();
resetGame();
draw();

// Responsive: recalcule la taille du canvas au redimensionnement
window.addEventListener('resize', () => {
	const prevWidth = canvas.width;
	const prevHeight = canvas.height;
	resizeCanvasToContainer();
	// Pas besoin d'ajuster la logique: on redessine simplement au nouveau scale
	if (prevWidth !== canvas.width || prevHeight !== canvas.height) {
		draw();
	}
});


