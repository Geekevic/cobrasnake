const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 30; // taille d'une case
let snake = [];
let direction;
let food;
let score = 0;
let gameInterval;
let isPaused = false;

const scoreDisplay = document.getElementById("score");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const nameInput = document.getElementById("nameInput");
const playerNameInput = document.getElementById("playerName");
const submitScoreBtn = document.getElementById("submitScore");
const scoreTable = document.getElementById("scoreTable");
const saveScore = document.getElementById("save-score");

playBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", restartGame);
submitScoreBtn.addEventListener("click", submitScore);
document.addEventListener("keydown", directionControl);

function startGame() {
    snake = [{ x: 9 * box, y: 9 * box }];
    direction = null;
    food = spawnFood();
    score = 0;
    scoreDisplay.innerText = 'score:'+ `${score}`;
    
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'inline';
    restartBtn.style.display = 'none';
    
    gameInterval = setInterval(draw, 240); //vitesse (decroissante)
}

function togglePause() {
    if (isPaused) {
        resumeGame();
        document.getElementById('damso').play();
    } else {
        pauseGame();
        document.getElementById('damso').pause();
    }
}

function pauseGame() {
    clearInterval(gameInterval);
    isPaused = true;
}

function resumeGame() {
    gameInterval = setInterval(draw, 240);
    isPaused = false;
    document.getElementById('damso').play();
}

//controler la direstion du serpent

/*37, 38, 39 et 40 sont comme les adresses des bouton
de direction DROITE, BAS, GAUCHE, HAUT*/

function directionControl(event) {
    document.getElementById('deplass').play();
    if (event.keyCode == 37 && direction != "RIGHT") direction = "LEFT";
    else if (event.keyCode == 38 && direction != "DOWN") direction = "UP";
    else if (event.keyCode == 39 && direction != "LEFT") direction = "RIGHT";
    else if (event.keyCode == 40 && direction != "UP") direction = "DOWN";
}

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    document.getElementById('deplass').play();
});

canvas.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleGesture();
});

function handleGesture() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) { // Mouvement horizontal
        if (dx > 0 && direction !== "LEFT") {
            direction = "RIGHT";
        } else if (direction !== "RIGHT") {
            direction = "LEFT";
        }
    } else { // Mouvement vertical
        if (dy > 0 && direction !== "UP") {
            direction = "DOWN";
        } else if (direction !== "DOWN") {
            direction = "UP";
        }
    }
}

//_____________dessinner le serpent____________
function draw() {
    if (snake[0].x > canvas.width - box || snake[0].x < 0 || snake[0].y > canvas.height - box || snake[0].y < 0 || collision(snake[0], snake)) {
        clearInterval(gameInterval);
        showNameInput();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = (i === 0) ? "green" : "#022c3d"; // tete verte et corps abrico
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
      ctx.strokeStyle = "yellow"; //raillure verte
      ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  //___________dessinner la nourriture__________
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction == "LEFT") snakeX -= box; 
  if (direction == "UP") snakeY -= box;
  if (direction == "RIGHT") snakeX += box;
  if (direction == "DOWN") snakeY += box;


  //verifier s'il mange
  if (snakeX === food.x && snakeY === food.y) {
    document.getElementById('tchop').play();  
    score++;
      food = spawnFood();
  } else {
      snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };
  snake.unshift(newHead);
  
  scoreDisplay.innerText = 'score: ' +`${score}`;
  
}

//________faire apparaitre la nourriture__________
function spawnFood() {
  return {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

function collision(head, array) {
  for (let i = 1; i < array.length; i++) {
      if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}

function showNameInput() {
  nameInput.style.display = 'block';
  saveScore.style.display = 'block';
  pauseBtn.style.display = 'none';
  restartBtn.style.display = 'inline';
  //arreter la musique sur Game Over !
  document.getElementById('damso').pause();
  document.getElementById('gamover').play();
  document.getElementById('deplass').pause();
}

function restartGame() {
  nameInput.style.display = 'none';
  saveScore.style.display = 'none';
  
  startGame();
}

// Enregistrer le score
function submitScore() {
  const playerName = playerNameInput.value.trim();
  
  if (!playerName) return alert('Veuillez entrer un nom valide.');

  const scores = JSON.parse(localStorage.getItem('scores')) || [];
  
  scores.push({ name: playerName, score });
  
  // Trier et garder les 10 meilleurs scores
  scores.sort((a, b) => b.score - a.score);
  
  if (scores.length > 10 ) {
      scores.splice(10);
  }

  localStorage.setItem('scores', JSON.stringify(scores));
  
  updateScoreTable();
  //le champ de sauvegarde
  nameInput.style.display = 'none';
  saveScore.style.display = 'none';
}

function updateScoreTable() {
  const scores = JSON.parse(localStorage.getItem('scores')) || [];
  
  // Vider le tableau
  while (scoreTable.rows.length > 1) {
      scoreTable.deleteRow(1);
  }
  
  // Ajouter les scores
  for (const { name, score } of scores) {
      const row = scoreTable.insertRow();
      const cellName = row.insertCell(0);
      const cellScore = row.insertCell(1);
      
      cellName.innerText = name;
      cellScore.innerText = score;
  }
}

// Initialiser le tableau des meilleurs scores
updateScoreTable();




// naviguer sur les champs de score
const bestScore = document.getElementById("best-score");
const close2 = document.getElementById("closeScore");
const close1 = document.getElementById("closeOver");
const burger = document.getElementById("burger");
 
close2.addEventListener("click", () => {
    bestScore.style.display = 'none';
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    bestScore.style.display = 'none';
  }
});
close1.addEventListener("click", () => {
    saveScore.style.display = 'none';
});
burger.addEventListener("click", () => {
    bestScore.style.display = 'block';
});
