
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function gameLoop(){
ctx.clearRect(0,0,800,600);
ctx.fillStyle="white";
ctx.fillText("Godfather Running",300,300);
requestAnimationFrame(gameLoop);
}

gameLoop();
