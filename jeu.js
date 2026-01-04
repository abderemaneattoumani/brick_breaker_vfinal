const cnv = document.getElementById("game");
const ctx = cnv.getContext("2d");
const info = document.getElementById("info");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("reset");

// taille du canvas
cnv.width = 800;
cnv.height = 500;

// joueur
let player = {
    x: 350,
    y: 460,
    w: 100,
    h: 15,
    speed: 8
};

// balle
let ball = {
    x: 400,
    y: 300,
    r: 8,
    dx: 4, // vitesse horizontale
    dy: -4, // vitesse verticale
    speed: 4
};

// briques
let bricks = [];
let brickRows = 5;
let brickCols = 10;
let brickWidth = 70;
let brickHeight = 25;
let brickPadding = 5;
let brickOffsetTop = 50;
let brickOffsetLeft = 28;

// couleurs des briques
let brickColors = ["#ff6b6b", "#feca57", "#48dbfb", "#1dd1a1", "#ee5a6f"];

// touches
let keys = {
    left: false,
    right: false
};

let gameRunning = false;
let score = 0;
let lives = 3;

// fonction pour créer toutes les briques
function createBricks() {
    bricks = [];
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            bricks.push({
                x: brickOffsetLeft + col * (brickWidth + brickPadding),
                y: brickOffsetTop + row * (brickHeight + brickPadding),
                w: brickWidth,
                h: brickHeight,
                color: brickColors[row], // couleur selon la ligne
                visible: true // la brique est encore là
            });
        }
    }
}

// fonction pour dessiner les briques
function drawBricks() {
    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        if (brick.visible) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
            // effet de bordure
            ctx.strokeStyle = "#222";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
        }
    }
}

// fonction pour dessiner le joueur
function drawPlayer() {
    ctx.fillStyle = "#dfe6e9";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    // dégradé de couleur pour le style
    ctx.fillStyle = "#b2bec3";
    ctx.fillRect(player.x, player.y, player.w, 3);
}

// fonction pour dessiner la balle
function drawBall() {
    ctx.fillStyle = "#74b9ff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    // effet de brillance
    ctx.fillStyle = "#a29bfe";
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, ball.r / 2, 0, Math.PI * 2);
    ctx.fill();
}

// fonction pour afficher le score et les vies
function drawUI() {
    ctx.fillStyle = "#dfe6e9";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Vies: " + lives, cnv.width - 100, 30);
}

// fonction pour déplacer le joueur
function updatePlayer() {
    if (keys.left) {
        player.x -= player.speed;
    }
    if (keys.right) {
        player.x += player.speed;
    }
    
    // empêcher de sortir
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.w > cnv.width) {
        player.x = cnv.width - player.w;
    }
}

// fonction pour déplacer la balle
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // rebond sur les murs gauche et droit
    if (ball.x - ball.r < 0 || ball.x + ball.r > cnv.width) {
        ball.dx = -ball.dx;
    }
    
    // rebond sur le plafond
    if (ball.y - ball.r < 0) {
        ball.dy = -ball.dy;
    }
    
    // collision avec le joueur - vérifier que la balle vient du dessus
    if (ball.y + ball.r >= player.y && // la balle touche le dessus de le joueur
        ball.y + ball.r <= player.y + player.h && // mais pas trop bas
        ball.x > player.x && // la balle est dans la zone horizontale
        ball.x < player.x + player.w &&
        ball.dy > 0) { // et la balle descend
        
        ball.dy = -ball.dy;
        // effet : angle selon où on tape la balle
        let hitPos = (ball.x - player.x) / player.w;
        ball.dx = (hitPos - 0.5) * 8;
    }
    
    // si la balle tombe en bas
    if (ball.y - ball.r > cnv.height) {
        lives--;
        if (lives <= 0) {
            gameRunning = false;
            info.textContent = "Game Over ! Score : " + score;
        } else {
            // remettre la balle au centre
            ball.x = 400;
            ball.y = 300;
            ball.dx = 4;
            ball.dy = -4;
            info.textContent = "Vie perdue ! Il reste " + lives + " vies";
        }
    }
}

// fonction pour vérifier les collisions avec les briques
function checkBrickCollisions() {
    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        if (brick.visible) {
            // vérifier si la balle touche la brique
            if (ball.x + ball.r > brick.x && 
                ball.x - ball.r < brick.x + brick.w &&
                ball.y + ball.r > brick.y && 
                ball.y - ball.r < brick.y + brick.h) {
                
                ball.dy = -ball.dy; // inverser la direction
                brick.visible = false; // casser la brique
                score += 10;
                
                // vérifier si toutes les briques sont cassées
                let allBroken = true;
                for (let j = 0; j < bricks.length; j++) {
                    if (bricks[j].visible) {
                        allBroken = false;
                        break;
                    }
                }
                
                if (allBroken) {
                    gameRunning = false;
                    info.textContent = "Bravo ! Tu as tout cassé ! Score: " + score;
                }
            }
        }
    }
}

// boucle principale du jeu
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    
    updatePlayer();
    updateBall();
    checkBrickCollisions();
    
    drawBricks();
    drawPlayer();
    drawBall();
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

// écouter les touches
document.addEventListener("keydown", function(e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keys.left = true;
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keys.right = true;
    }
});

document.addEventListener("keyup", function(e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keys.left = false;
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keys.right = false;
    }
});

// bouton start
startBtn.addEventListener("click", function() {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop();
        info.textContent = "Casse toutes les briques !";
    }
});

// bouton pause
pauseBtn.addEventListener("click", function() {
    gameRunning = !gameRunning;
    if (gameRunning) {
        gameLoop();
        info.textContent = "Jeu en cours";
    } else {
        info.textContent = "Jeu en pause";
    }
});

// bouton reset
resetBtn.addEventListener("click", function() {
    gameRunning = false;
    score = 0;
    lives = 3;
    player.x = 350;
    ball.x = 400;
    ball.y = 300;
    ball.dx = 4;
    ball.dy = -4;
    createBricks();
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    drawBricks();
    drawPlayer();
    drawBall();
    drawUI();
    info.textContent = "Prêt à jouer !";
});

// initialisation au démarrage
createBricks();
drawBricks();
drawPlayer();
drawBall();
drawUI();
info.textContent = "Appuie sur Start pour commencer";

// utilisation de l'IA partielle
// fait par Abdérémane, Mouffak, Stilian et Hovnan