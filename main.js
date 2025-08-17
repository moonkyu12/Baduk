const board = document.querySelector('.go-board');
let isBlackTurn = true;
const moves = [];

function updateURL() {
    const movesString = moves.map(move => `${move.row},${move.col}`).join(';');
    window.location.hash = movesString;
}

function placeStone(row, col, color) {
    const stone = document.createElement('div');
    stone.classList.add('stone', color);
    const space = 30;
    const margin = 15;
    stone.style.left = `${col * space + margin - 15}px`;
    stone.style.top = `${row * space + margin - 15}px`;
    board.appendChild(stone);
}

function loadFromURL() {
    const movesString = window.location.hash.substring(1);
    if (movesString) {
        moves.length = 0; // Clear existing moves
        const movePairs = movesString.split(';');
        let turnColor = 'black';
        movePairs.forEach(pair => {
            const [row, col] = pair.split(',').map(Number);
            moves.push({ row, col });
            placeStone(row, col, turnColor);
            turnColor = (turnColor === 'black') ? 'white' : 'black';
        });
        isBlackTurn = (turnColor === 'black');
    }
}

board.addEventListener('click', (event) => {
    const rect = board.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const space = 30;
    const margin = 15;

    const col = Math.round((x - margin) / space);
    const row = Math.round((y - margin) / space);

    // Prevent placing stone on top of another
    if (moves.some(move => move.row === row && move.col === col)) {
        return;
    }

    const color = isBlackTurn ? 'black' : 'white';
    placeStone(row, col, color);
    moves.push({ row, col });
    isBlackTurn = !isBlackTurn;
    updateURL();
});

const resetButton = document.getElementById('reset-board');
resetButton.addEventListener('click', () => {
    const stones = document.querySelectorAll('.stone');
    stones.forEach(stone => stone.remove());
    moves.length = 0;
    isBlackTurn = true;
    window.location.hash = '';
});

// Load board state from URL on initial load
loadFromURL();
