const board = document.querySelector('.go-board');
let isBlackTurn = true;
let moves = [];
let moveIndex = -1;

const resetButton = document.getElementById('reset-board');
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');
const saveButton = document.getElementById('save-button'); // Get the new save button

function updateURL() {
    const movesToEncode = moves.slice(0, moveIndex + 1);
    const movesString = movesToEncode.map(move => `${move.row},${move.col}`).join(';');
    window.location.hash = movesString;
}

function placeStone(row, col, color) {
    const stone = document.createElement('div');
    stone.classList.add('stone', color);
    const space = 30;
    const margin = 15;
    stone.style.left = `${move.col * space + margin - 15}px`;
    stone.style.top = `${move.row * space + margin - 15}px`;
    board.appendChild(stone);
}

function redrawBoard() {
    board.innerHTML = '';
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

    undoButton.disabled = moveIndex < 0;
    redoButton.disabled = moveIndex >= moves.length - 1;

    updateURL();
}

function loadFromURL() {
    const movesString = window.location.hash.substring(1);
    if (movesString) {
        moves.length = 0; // Clear existing moves
        const moveList = movesString.split(';');
        moveList.forEach(pair => {
            if (!pair) return;
            const [row, col] = pair.split(',').map(Number);
            moves.push({ row, col });
        });
        moveIndex = moves.length - 1;
        redrawBoard();
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

    if (col < 0 || col > 18 || row < 0 || row > 18) return;

    const currentMoves = moves.slice(0, moveIndex + 1);
    if (currentMoves.some(move => move.row === row && move.col === col)) {
        return;
    }

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

saveButton.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert("URL이 클립보드에 복사되었습니다!");
    }).catch(err => {
        console.error('URL 복사 실패:', err);
        alert("URL 복사에 실패했습니다. 브라우저 설정을 확인해주세요.");
    });
});

// Initial Load
loadFromURL();
