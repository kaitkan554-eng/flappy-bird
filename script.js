const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

const startScreen = document.getElementById("startScreen");
const endScreen = document.getElementById("endScreen");
const messageBox = document.getElementById("messageBox");
const startBtn = document.getElementById("startBtn");

const gameOverPopup = document.getElementById("gameOverPopup");

const finalScore = document.getElementById("finalScore");

const playerImg = new Image();
playerImg.src = "assets/ana.png";

const bgMusic = new Audio("assets/bg-music.mp3");

const tapSound = new Audio("assets/suara-tap2.mp3");

const scoreSound = new Audio("assets/suara-score.mp3");

const hitSound = new Audio("assets/suara-nabrak.mp3");

const gameOverSound = new Audio("assets/suara-game-over.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.4;

let gameStarted = false;
let score = 0;

const player = {
  x: 100,
  y: 250,
  width: 80,
  height: 80,
  velocity: 0,
  gravity: 0.5,
  jump: -9,
};

const pipeWidth = 80;
const pipeGap = window.innerWidth < 768 ? 180 : 220;
const pipeSpeed = 3;

let pipes = [];

startBtn.addEventListener("click", startGame);

function startGame() {
  startScreen.style.display = "none";

  canvas.style.display = "block";

  player.y = canvas.height / 2;

  bgMusic.currentTime = 0;
  bgMusic.play();

  gameStarted = true;

  gameLoop();
}

function flap() {
  if (!gameStarted) return;

  player.velocity = player.jump;

  tapSound.currentTime = 0;
  tapSound.play();
}

if (window.innerWidth < 768) {
  player.width = 60;
  player.height = 60;
}

document.addEventListener("click", flap);

document.addEventListener("touchstart", (e) => {
  e.preventDefault();
  flap();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    flap();
  }
});

function createPipe() {
  const topHeight = Math.random() * (canvas.height - pipeGap - 250) + 100;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + pipeGap,
    counted: false,
  });
}

setInterval(() => {
  if (gameStarted) {
    createPipe();
  }
}, 1500);

let clouds = [
  { x: 100, y: 100, size: 40 },
  { x: 400, y: 150, size: 50 },
  { x: 800, y: 120, size: 35 },
];

function drawClouds() {
  ctx.fillStyle = "white";

  clouds.forEach((cloud) => {
    ctx.beginPath();

    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.arc(cloud.x + 30, cloud.y - 15, cloud.size, 0, Math.PI * 2);
    ctx.arc(cloud.x + 60, cloud.y, cloud.size, 0, Math.PI * 2);

    ctx.fill();

    cloud.x -= 0.3;

    if (cloud.x < -100) {
      cloud.x = canvas.width + 100;
    }
  });
}

function drawGround() {
  ctx.fillStyle = "#DEB887";

  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  ctx.fillStyle = "#C19A6B";

  for (let i = 0; i < canvas.width; i += 40) {
    ctx.fillRect(i, canvas.height - 80, 20, 80);
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

  gradient.addColorStop(0, "#4EC0CA");
  gradient.addColorStop(1, "#B7F0FF");

  ctx.fillStyle = gradient;

  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function checkCollision() {
  for (let pipe of pipes) {
    if (player.x < pipe.x + pipeWidth && player.x + player.width > pipe.x && (player.y < pipe.top || player.y + player.height > pipe.bottom)) {
      hitSound.currentTime = 0;
      hitSound.play();
      endGame();
      return;
    }
  }

  if (player.y < 0) {
    endGame();
    return;
  }

  if (player.y + player.height > canvas.height - 80) {
    endGame();
    return;
  }
}

function drawPlayer() {
  ctx.save();

  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

  ctx.rotate(Math.max(-0.5, Math.min(player.velocity * 0.05, 1)));

  ctx.beginPath();

  ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);

  ctx.closePath();
  ctx.clip();

  ctx.drawImage(playerImg, -player.width / 2, -player.height / 2, player.width, player.height);

  ctx.restore();
}

function drawPipes() {
  pipes.forEach((pipe) => {
    // pipa utama
    ctx.fillStyle = "#75BE2F";

    // atas
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);

    // bawah
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height);

    // bibir pipa atas
    ctx.fillRect(pipe.x - 6, pipe.top - 30, pipeWidth + 12, 30);

    // bibir pipa bawah
    ctx.fillRect(pipe.x - 6, pipe.bottom, pipeWidth + 12, 30);

    // bayangan kanan
    ctx.fillStyle = "#5C9D25";

    ctx.fillRect(pipe.x + pipeWidth - 10, 0, 10, pipe.top);

    ctx.fillRect(pipe.x + pipeWidth - 10, pipe.bottom, 10, canvas.height);

    pipe.x -= pipeSpeed;

    if (!pipe.counted && pipe.x + pipeWidth < player.x) {
      pipe.counted = true;

      score++;

      scoreSound.currentTime = 0;
      scoreSound.play();

      checkMessages();
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + pipeWidth > 0);
}

function drawScore() {
  ctx.font = "bold 40px Arial";

  ctx.fillStyle = "white";

  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;

  ctx.strokeText("Score: " + score, 20, 50);

  ctx.fillText("Score: " + score, 20, 50);
}

function restartGame() {
  score = 0;

  pipes = [];

  player.x = 100;
  player.y = canvas.height / 2;

  player.velocity = 0;

  gameOverPopup.style.display = "none";

  bgMusic.currentTime = 0;
  bgMusic.play();

  gameStarted = true;

  gameLoop();
}

function showMessage(text) {
  messageBox.innerText = text;

  setTimeout(() => {
    messageBox.innerText = "";
  }, 3000);
}

function checkMessages() {
  if (score === 10) {
    showMessage("Masih ingat waktu pertama kali kita kenal?");
  }

  if (score === 20) {
    showMessage("Terima kasih untuk semua cerita.");
  }

  if (score === 30) {
    showMessage("Semoga sukses di perjalanan berikutnya.");
  }

  if (score === 40) {
    showMessage("Jangan lupakan teman-temanmu ya.");
  }

  if (score === 50) {
    showFarewell();
  }
}

function endGame() {
  gameStarted = false;

  bgMusic.pause();

  gameOverSound.currentTime = 0;
  gameOverSound.play();

  finalScore.textContent = "Score: " + score;

  gameOverPopup.style.display = "flex";
}

function restartGame() {
  score = 0;

  pipes = [];

  player.y = 250;
  player.velocity = 0;

  gameOverPopup.style.display = "none";

  bgMusic.currentTime = 0;
  bgMusic.play();

  gameStarted = true;

  gameLoop();
}

function closePopup() {
  gameOverPopup.style.display = "none";

  startScreen.style.display = "flex";

  canvas.style.display = "none";

  score = 0;

  pipes = [];

  player.y = 250;
  player.velocity = 0;
}

function showFarewell() {
  gameStarted = false;

  bgMusic.pause();

  canvas.style.display = "none";

  endScreen.style.display = "flex";

  endScreen.innerHTML = `
        <h1>Untuk Ana</h1>

        <p>
        Terima kasih untuk semua kenangan,
        cerita, tawa, dan kebersamaan
        selama ini.
        <br><br>
        Semoga sukses di perjalanan
        berikutnya.
        <br><br>
        Jangan lupakan kami.
        </p>

        <button onclick="location.reload()">
            Main Lagi
        </button>
    `;
}

function gameLoop() {
  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.velocity += player.gravity;
  player.y += player.velocity;

  drawBackground();

  drawClouds();

  drawPipes();

  drawGround();

  drawPlayer();

  drawScore();

  checkCollision();

  requestAnimationFrame(gameLoop);
}
