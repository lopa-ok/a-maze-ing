const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

const cols = 20;
const rows = 20;
const cellSize = 20;

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = [];
let stack = [];
let startCell, endCell;
let player;

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = [true, true, true, true]; 
        this.visited = false;
        this.isStart = false;
        this.isEnd = false;
        this.hasPlayer = false;
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

        if (this.isStart) {
            ctx.fillStyle = 'green';
            ctx.fillRect(x, y, cellSize, cellSize);
        }

        if (this.isEnd) {
            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, cellSize, cellSize);
        }

        if (this.hasPlayer) {
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
            ctx.fill();
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

class Player {
    constructor() {
        this.row = 0;
        this.col = 0;
        this.cell = grid[this.row][this.col];
        this.cell.hasPlayer = true;
    }

    moveUp() {
        if (this.row > 0 && !grid[this.row - 1][this.col].walls[2]) {
            this.cell.hasPlayer = false;
            this.row--;
            this.cell = grid[this.row][this.col];
            this.cell.hasPlayer = true;
        }
    }

    moveRight() {
        if (this.col < cols - 1 && !grid[this.row][this.col].walls[1]) {
            this.cell.hasPlayer = false;
            this.col++;
            this.cell = grid[this.row][this.col];
            this.cell.hasPlayer = true;
        }
    }

    moveDown() {
        if (this.row < rows - 1 && !grid[this.row][this.col].walls[2]) {
            this.cell.hasPlayer = false;
            this.row++;
            this.cell = grid[this.row][this.col];
            this.cell.hasPlayer = true;
        }
    }

    moveLeft() {
        if (this.col > 0 && !grid[this.row][this.col - 1].walls[1]) {
            this.cell.hasPlayer = false;
            this.col--;
            this.cell = grid[this.row][this.col];
            this.cell.hasPlayer = true;
        }
    }
}

function setup() {
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            grid[row][col] = new Cell(row, col);
        }
    }


    startCell = grid[0][0];
    startCell.isStart = true;
    endCell = grid[rows - 1][cols - 1];
    endCell.isEnd = true;

    startCell.visited = true;
    stack.push(startCell);


    player = new Player();


    document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            player.moveUp();
            break;
        case 'ArrowRight':
            player.moveRight();
            break;
        case 'ArrowDown':
            player.moveDown();
            break;
        case 'ArrowLeft':
            player.moveLeft();
            break;
        default:
            return;
    }


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


    if (player.cell === endCell) {
        alert('Congratulations! You reached the end of the maze.');
        return;
    }

    let next = stack[stack.length - 1].checkNeighbors();
    if (next) {
        next.visited = true;
        stack.push(next);
        removeWalls(stack[stack.length - 2], next);
    } else {
        stack.pop();
    }


    requestAnimationFrame(draw);
}

setup();
draw();
