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

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = [true, true, true, true]; 
        this.visited = false;
        this.isStart = false;
        this.isEnd = false;
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
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            grid[row][col] = new Cell(row, col);
        }
    }

    // Set start and end points
    startCell = grid[0][0];
    startCell.isStart = true;
    endCell = grid[rows - 1][cols - 1];
    endCell.isEnd = true;

    startCell.visited = true;
    stack.push(startCell);
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

    let next = stack[stack.length - 1].checkNeighbors();
    if (next) {
        next.visited = true;
        stack.push(next);
        removeWalls(stack[stack.length - 2], next);
    } else {
        stack.pop();
    }

    if (stack.length > 0) {
        requestAnimationFrame(draw);
    }
}

setup();
draw();
