    
    //todo: add actual layer with a start button

    //board details
    const boardWidth = 40;
    const boardHeight = 32;
    const sideLength = 25;
    const canvasWidth = 1000;
    const canvasHeight = 800;

    const boardColorA = "#9CA21A";
    const boardColorB = "#1AA220";
    const snakeColor = "#5E60D6";
    const snakeHeadColor = "#00008B";
    const deadHeadColor = "#800000";
    const fruitColor = "#FFFF33";
    //how fast the snake moves, in ms/tile

    const framerate = 100;
    
    //offsets and size specifications to ensure things appear properly on the canvas.  
    //If the size of the canvas or hexgrid is changed, adjust these accordingly
    //offsets to the entire hex grid
    const xOffset = 50;
    const yOffset = 70;
    

    let snakeHeadPosX;
    let snakeHeadPosY;
    
    //includes head
    let snakeLength = 5;

    let snakeQueueX = new Queue();
    let snakeQueueY = new Queue();

    let growCount = 0; //tracks how many squares left to grow after eating
    let growAmount = 3; //number of squares the snake will grow per eat
    let currentScore = 0;
    //initialize canvas
    var layer1 = document.getElementById("boardCanvas");

    ctxLayer1 = layer1.getContext("2d");
    layer1.width = canvasWidth;
    layer1.height = canvasHeight;
    ctxLayer1.strokeStyle = "transparent";
    ctxLayer1.lineWidth = 0  

    //track gamestate
    let gameOngoing = false;
    let gameEnded = false;
    let currentDirection = 39 // 38=up,  39=right, 40=down, 37=left
    let lastMove = -1;
    let preMove = -1;

    let grid = new Array(boardWidth); //0 is a board space, 1 is a snake space
    

    $(document).ready(function(response) {
        initializeGame();
    })
    function initializeGame() {
        createGrid();
        initializeBoard();
    }

    function createGrid() {
        for(let i=0;i<boardWidth;i++) {
            grid[i] = new Array(boardHeight);
        }
    }

    $(document).on("keydown", function(event) {
        
        
         //todo: replace this with a start button 
        
        
        if(gameOngoing && event.keyCode >= 37 && event.keyCode <= 40){ 
            
            let newDirection = event.keyCode;
            if(lastMove != -1 && ((newDirection + lastMove) % 2 == 1)){
                preMove = newDirection;
            }
            else if((newDirection + currentDirection) % 2 == 1){
                lastMove = newDirection;
            }
            else {
                console.log("invalid directional");
            }
            
        }
        else if(event.keyCode == 32) {
            if(gameEnded) {
                gameEnded = false;
                console.log(gameEnded);
                console.log(gameOngoing);
                initializeGame();
            }
            else {
                gameOngoing = true;
            }
            
        }
        
    }); 

    function loop() {
        if(gameOngoing) {
            if(lastMove != -1) { //allows for the queueing up of one direction change command to allow for sharp 180 degree turns
                currentDirection = lastMove;
                lastMove = -1;
            }
            updateSnake();
            if(preMove != -1) {  
                lastMove = preMove;
                preMove = -1;
            }
        }
        setTimeout(function() { window.requestAnimationFrame(loop) }, framerate);
        
    }
    window.requestAnimationFrame(loop)


    function initializeBoard() {
        
            
        var i, j;
        let fillColor;

        //draw the board
        for(i = 0; i < boardWidth; ++i) {
            for(j = 0; j < boardHeight; ++j) {
                drawBoardTile(i,j);  
            }
        }

        //reset conditions from previous game
        snakeQueueX.clear();
        snakeQueueY.clear();
        snakeHeadPosX = boardWidth / 2;
        snakeHeadPosY = boardHeight / 2
        currentDirection = 39;
        const snakeHeadColor = "#00008B";

        ctxLayer1.fillStyle = snakeColor; 

        for(let i=snakeLength-1;i>=0;i--) {
            drawSquare(snakeHeadPosX-i, snakeHeadPosY, snakeColor, 1);
            snakeQueueX.enqueue(snakeHeadPosX - i);
            snakeQueueY.enqueue(snakeHeadPosY); 
        }
        drawSquare(snakeHeadPosX, snakeHeadPosY, snakeHeadColor, 1);
        generateFruit();
    }

    function generateFruit() {
        
        let x;
        let y;
        let noValidPosition = true;
        while(noValidPosition) {
            x = getRandomInt(boardWidth - 0);
            y = getRandomInt(boardHeight - 0);

            if(grid[x][y] == 0) {
                noValidPosition = false;
            }
        }

        drawSquare(x, y, fruitColor, 2);
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function drawSquare(xPos, yPos, color, type) {
        
    
        grid[xPos][yPos] = type;

        ctxLayer1.fillStyle = color; 
        ctxLayer1.beginPath(); 
        ctxLayer1.moveTo(xPos * sideLength, yPos * sideLength);
        ctxLayer1.lineTo((xPos + 1) * sideLength, yPos * sideLength);
        ctxLayer1.lineTo((xPos + 1) * sideLength, (yPos + 1) * sideLength);
        ctxLayer1.lineTo(xPos * sideLength, (yPos + 1) * sideLength);
        ctxLayer1.closePath();
        ctxLayer1.fill();
        ctxLayer1.stroke();
    }

    function drawBoardTile(i, j) {


        
        if((i%2 == 0 && j%2 == 1) || (i%2 == 1 && j%2 == 0)) {
            fillColor = boardColorA;
        }
        else {
            fillColor = boardColorB;
        }

        ctxLayer1.fillStyle = fillColor;
        
        drawSquare(i, j, fillColor, 0);
        
    }

    function updateSnake() {
       
        let direction = currentDirection
        let oldHeadX = snakeHeadPosX;
        let oldHeadY = snakeHeadPosY;
        
        switch(direction) {
            case 37:
                snakeHeadPosX--;
                break;
            case 38:
                snakeHeadPosY--;
                break;
            case 39:
                snakeHeadPosX++;
                break;
            default:
                snakeHeadPosY++;
          }

        if(!checkCollision(snakeHeadPosX, snakeHeadPosY)) {
            snakeQueueX.enqueue(snakeHeadPosX);
            snakeQueueY.enqueue(snakeHeadPosY);
    
            drawSquare(snakeHeadPosX, snakeHeadPosY, snakeHeadColor, 1);
            drawSquare(oldHeadX, oldHeadY, snakeColor, 1);
            if(growCount == 0) {
                drawBoardTile(snakeQueueX.dequeue(), snakeQueueY.dequeue());
            }
            else {
                growCount--;
            }
        }
        else {
            drawSquare(oldHeadX, oldHeadY, deadHeadColor, 1);
        }    
    }

    function checkCollision(x, y) {
        
        if(x < 0 || y < 0 || x >= boardWidth || y >= boardWidth || grid[x][y] == 1) { //collision failed
            gameOngoing = false;
            gameEnded = true;
            
            return 1;
        }
        else if(grid[x][y] == 2) { //eat a fruit
            growCount += growAmount;
            currentScore++;
            console.log("Current Score: " + currentScore);
            generateFruit();
        }
        return 0; //no collision detected
    }
    
    

    


    window.addEventListener("keydown", function(e) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);

   function Queue() {
       this.elements = [];
   }                 

   Queue.prototype.enqueue = function (e) {
       this.elements.push(e);
   };

   Queue.prototype.dequeue = function () {
       return this.elements.shift();
   }

   Queue.prototype.isEmpty = function () {
       return this.elements.length == 0;
   }

   Queue.prototype.peek = function () {
       return !this.isEmpty() ? this.elements[0] : undefined;
   }

   Queue.prototype.length = function() {
       return this.elements.length;
   }

   Queue.prototype.clear = function() {
       this.elements = [];
   }

   function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
        currentDate = Date.now();
        } while (currentDate - date < milliseconds);
  }

