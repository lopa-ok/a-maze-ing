const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const finalTimeElement = document.getElementById('finalTime');

let cols, rows, cellSize;
let grid = [];
let stack = [];
let current;
let player;
let endCell;
let timerInterval;
let timeElapsed = 0;

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

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        if (this.walls[0]) ctx.strokeRect(x, y, cellSize, 0); 
        if (this.walls[1]) ctx.strokeRect(x + cellSize, y, 0, cellSize); 
        if (this.walls[2]) ctx.strokeRect(x, y + cellSize, cellSize, 0); 
        if (this.walls[3]) ctx.strokeRect(x, y, 0, cellSize); 

        if (this.visited) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x, y, cellSize, cellSize);
        }
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

function setup() {
    grid = [];
    stack = [];

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

    
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'none';

    
    canvas.style.display = 'block';
    timerElement.style.display = 'block';

    
    timeElapsed = 0;
    timerElement.textContent = `Time: ${timeElapsed}`;
    clearInterval(timerInterval); 
    timerInterval = setInterval(() => {
        timeElapsed += 1;
        timerElement.textContent = `Time: ${timeElapsed}`;
    }, 1000);

    
    draw();
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

    
    ctx.fillStyle = 'green';
    ctx.fillRect(grid[0][0].col * cellSize + 5, grid[0][0].row * cellSize + 5, cellSize - 10, cellSize - 10);

    
    ctx.fillStyle = 'red';
    ctx.fillRect(endCell.col * cellSize + 5, endCell.row * cellSize + 5, cellSize - 10, cellSize - 10);

    
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.cell.col * cellSize + 5, player.cell.row * cellSize + 5, cellSize - 10, cellSize - 10);

    
    requestAnimationFrame(draw);
}

function startGame(difficulty) {
    const mainMenu = document.getElementById('mainMenu');
    mainMenu.style.display = 'none';

    switch (difficulty) {
        case 'easy':
            cols = 10;
            rows = 10;
            cellSize = 40;
            break;
        case 'medium':
            cols = 20;
            rows = 20;
            cellSize = 20;
            break;
        case 'hard':
            cols = 30;
            rows = 30;
            cellSize = 15;
            break;
    }

    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';

    setup();
}

function restartGame() {
    clearInterval(timerInterval); 
    const menuOverlay = document.getElementById('menuOverlay');
    menuOverlay.style.display = 'none';
    const mainMenu = document.getElementById('mainMenu');
    mainMenu.style.display = 'flex';
}

document.addEventListener('keydown', (e) => {
    let { row, col } = player.cell;

    switch (e.key) {
        case 'w':
            if (!player.cell.walls[0]) row -= 1;
            break;
        case 'd':
            if (!player.cell.walls[1]) col += 1;
            break;
        case 's':
            if (!player.cell.walls[2]) row += 1;
            break;
        case 'a':
            if (!player.cell.walls[3]) col -= 1;
            break;
    }

    if (grid[row] && grid[row][col]) {
        player.cell = grid[row][col];
    }

    if (player.cell === endCell) {
        clearInterval(timerInterval);
        const menuOverlay = document.getElementById('menuOverlay');
        menuOverlay.style.display = 'flex';
        finalTimeElement.textContent = `Your time: ${timeElapsed} seconds`;
    }
});
