const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const finalTimeElement = document.getElementById('finalTime');
const loadingOverlay = document.getElementById('loadingOverlay');
const mainMenu = document.getElementById('mainMenu');
const menuOverlay = document.getElementById('menuOverlay');
const giveUpButton = document.getElementById('giveUpButton');
const menuTitle = document.getElementById('menuTitle');
const menuMessage = document.getElementById('menuMessage');

let cols, rows, cellSize;
let grid = [];
let stack = [];
let current;
let player;
let endCell;
let timerInterval;
let timeElapsed = 0;
let gameInProgress = false; 

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = [true, true, true, true];
        this.visited = false;
    }

    show() {
        const x = this.col * cellSize;
        const y = this.row * cellSize;
        if (this.visited) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(x, y, cellSize, cellSize);
        }

        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;

        ctx.beginPath();
        if (this.walls[0]) { 
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
        }
        if (this.walls[1]) {
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (this.walls[2]) {
            ctx.moveTo(x + cellSize, y + cellSize);
            ctx.lineTo(x, y + cellSize);
        }
        if (this.walls[3]) {
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    checkNeighbors() {
        let neighbors = [];
        let top = grid[this.row - 1]?.[this.col];
        let right = grid[this.row]?.[this.col + 1];
        let bottom = grid[this.row + 1]?.[this.col];
        let left = grid[this.row]?.[this.col - 1];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length > 0) {
            return neighbors[Math.floor(Math.random() * neighbors.length)];
        }
        return undefined;
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function setup() {
    grid = [];
    stack = [];

    loadingOverlay.style.display = 'flex';

    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            grid[row][col] = new Cell(row, col);
        }
    }
    current = grid[0][0];
    current.visited = true;
    stack.push(current);

    while (stack.length > 0) {
        let next = current.checkNeighbors();
        if (next) {
            next.visited = true;
            stack.push(next);
            removeWalls(current, next);
            current = next;
        } else {
            current = stack.pop();
        }
    }

    player = { cell: grid[0][0] };
    endCell = grid[rows - 1][cols - 1];

    loadingOverlay.style.display = 'none';

    canvas.style.display = 'block';
    timerElement.style.display = 'block';
    giveUpButton.style.display = 'block'; 

    timeElapsed = 0;
    timerElement.textContent = `Time: ${formatTime(timeElapsed)}`;
    clearInterval(timerInterval); 
    timerInterval = setInterval(() => {
        timeElapsed += 1;
        timerElement.textContent = `Time: ${formatTime(timeElapsed)}`;
    }, 1000);

    draw();

    gameInProgress = true; 
}

function removeWalls(current, next) {
    let x = current.col - next.col;
    let y = current.row - next.row;

    if (x === 1) {
        current.walls[3] = false;
        next.walls[1] = false;
    } else if (x === -1) {
        current.walls[1] = false;
        next.walls[3] = false;
    }

    if (y === 1) {
        current.walls[0] = false;
        next.walls[2] = false;
    } else if (y === -1) {
        current.walls[2] = false;
        next.walls[0] = false;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid[row][col].show();
        }
    }

    ctx.fillStyle = '#4caf50';
    ctx.fillRect(grid[0][0].col * cellSize + 6, grid[0][0].row * cellSize + 6, cellSize - 12, cellSize - 12);

    ctx.fillStyle = '#e53935';
    ctx.fillRect(endCell.col * cellSize + 6, endCell.row * cellSize + 6, cellSize - 12, cellSize - 12);

    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.arc(
        player.cell.col * cellSize + cellSize / 2,
        player.cell.row * cellSize + cellSize / 2,
        (cellSize - 6) / 2, // increased from (cellSize - 14) / 2
        0, 2 * Math.PI
    );
    ctx.fill();
}

function startGame(difficulty) {
    mainMenu.style.display = 'none';
    menuOverlay.style.display = 'none'; 

    switch (difficulty) {
        case 'easy':
            cols = 16;
            rows = 16;
            cellSize = 40;
            break;
        case 'medium':
            cols = 28;
            rows = 28;
            cellSize = 24;
            break;
        case 'hard':
            cols = 40;
            rows = 40;
            cellSize = 16;
            break;
    }

    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    setup();
}

function restartGame() {
    menuOverlay.style.display = 'none';
    mainMenu.style.display = 'flex';
    clearInterval(timerInterval); 
    giveUpButton.style.display = 'none'; 
    timerElement.style.display = 'none';
    canvas.style.display = 'none';
    gameInProgress = false; 
}

giveUpButton.addEventListener('click', () => {
    if (!gameInProgress) return;
    clearInterval(timerInterval);
    menuOverlay.style.display = 'flex'; 
    menuTitle.textContent = "Game Over!";
    menuMessage.textContent = "You gave up. Try again!";
    finalTimeElement.textContent = `You gave up! Time: ${formatTime(timeElapsed)}`;
    gameInProgress = false;
});

document.addEventListener('keydown', (e) => {
    if (!gameInProgress) return; 

    let { row, col } = player.cell;
    let moved = false;

    switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            if (!player.cell.walls[0]) { row -= 1; moved = true; }
            break;
        case 'd':
        case 'arrowright':
            if (!player.cell.walls[1]) { col += 1; moved = true; }
            break;
        case 's':
        case 'arrowdown':
            if (!player.cell.walls[2]) { row += 1; moved = true; }
            break;
        case 'a':
        case 'arrowleft':
            if (!player.cell.walls[3]) { col -= 1; moved = true; }
            break;
    }

    if (moved && grid[row] && grid[row][col]) {
        player.cell = grid[row][col];
        draw();
    }

    if (player.cell === endCell) {
        clearInterval(timerInterval);
        menuOverlay.style.display = 'flex'; 
        menuTitle.textContent = "Congratulations!";
        menuMessage.textContent = "You reached the end of the maze.";
        finalTimeElement.textContent = `Your time: ${formatTime(timeElapsed)}`;
        gameInProgress = false;
    }
});

window.onload = () => {
    menuOverlay.style.display = 'none';
    loadingOverlay.style.display = 'none';
    canvas.style.display = 'none';
    timerElement.style.display = 'none';
    giveUpButton.style.display = 'none';
    mainMenu.style.display = 'flex';
};
