const board = document.querySelector('.go-board');
const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
const toLeetMap = { 'A': '4', 'B': '8', 'E': '3', 'G': '6', 'L': '1', 'O': '0', 'S': '5', 'T': '7' };
const fromLeetMap = { '4': 'A', '8': 'B', '3': 'E', '6': 'G', '1': 'L', '0': 'O', '5': 'S', '7': 'T' };

// App State
let moves = []; // Full history of moves
let moveIndex = -1; // Index of the currently displayed move in the `moves` array

// DOM Elements
const resetButton = document.getElementById('reset-board');
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

// --- Coordinate and URL Encoding --- //

function toGoCoords(row, col) {
    const originalLetter = COLS[col];
    const leetLetter = toLeetMap[originalLetter] || originalLetter;
    return `${leetLetter}${19 - row}`;
}

function fromGoCoords(goCoord) {
    const firstChar = goCoord.charAt(0);
    const rowNumStr = goCoord.substring(1);
    const originalLetter = fromLeetMap[firstChar] || firstChar;
    const col = COLS.indexOf(originalLetter);
    const row = 19 - parseInt(rowNumStr, 10);
    return (col === -1 || isNaN(row)) ? null : { row, col };
}

function updateURL() {
    const movesToEncode = moves.slice(0, moveIndex + 1);
    const movesString = movesToEncode.map(move => toGoCoords(move.row, move.col)).join(';');
    if (movesString) {
        const buffer = new TextEncoder().encode(movesString);
        window.location.hash = bs58.encode(buffer);
    } else {
        window.location.hash = '';
    }
}

// --- Board Drawing and State --- //

function redrawBoard() {
    // Clear current stones
    board.innerHTML = '';

    // Draw stones up to the current moveIndex
    const movesToDraw = moves.slice(0, moveIndex + 1);
    let isBlack = true;
    movesToDraw.forEach(move => {
        const stone = document.createElement('div');
        stone.classList.add('stone', isBlack ? 'black' : 'white');
        const space = 30;
        const margin = 15;
        stone.style.left = `${move.col * space + margin - 15}px`;
        stone.style.top = `${move.row * space + margin - 15}px`;
        board.appendChild(stone);
        isBlack = !isBlack;
    });

    // Update button states
    undoButton.disabled = moveIndex < 0;
    redoButton.disabled = moveIndex >= moves.length - 1;

    updateURL();
}

function loadFromURL() {
    const encoded = window.location.hash.substring(1);
    if (!encoded) return;

    try {
        const buffer = bs58.decode(encoded);
        const movesString = new TextDecoder().decode(buffer);
        const moveList = movesString.split(';');
        
        moves = moveList.filter(m => m).map(fromGoCoords).filter(m => m !== null);
        moveIndex = moves.length - 1;
        redrawBoard();
    } catch (e) {
        console.error("Failed to decode Base58 hash:", e);
        window.location.hash = '';
    }
}

// --- Event Listeners --- //

board.addEventListener('click', (event) => {
    const rect = board.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const space = 30;
    const margin = 15;
    const col = Math.round((x - margin) / space);
    const row = Math.round((y - margin) / space);

    if (col < 0 || col > 18 || row < 0 || row > 18) return;

    // Check if a stone already exists at this position in the current timeline
    const currentMoves = moves.slice(0, moveIndex + 1);
    if (currentMoves.some(move => move.row === row && move.col === col)) {
        return;
    }

    // If user has undone moves, truncate the future history
    if (moveIndex < moves.length - 1) {
        moves = moves.slice(0, moveIndex + 1);
    }

    moves.push({ row, col });
    moveIndex++;
    redrawBoard();
});

undoButton.addEventListener('click', () => {
    if (moveIndex >= 0) {
        moveIndex--;
        redrawBoard();
    }
});

redoButton.addEventListener('click', () => {
    if (moveIndex < moves.length - 1) {
        moveIndex++;
        redrawBoard();
    }
});

resetButton.addEventListener('click', () => {
    moves = [];
    moveIndex = -1;
    redrawBoard();
});

// Initial Load
loadFromURL();
