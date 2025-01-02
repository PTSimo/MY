// Crea un canvas
const canvas = document.createElement('canvas');
canvas.width = 48;
canvas.height = 48;
const ctx = canvas.getContext('2d');

// Disegna un pin rosso
ctx.fillStyle = '#FF0000';
ctx.beginPath();
ctx.arc(24, 20, 12, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.moveTo(24, 20);
ctx.lineTo(24, 40);
ctx.lineWidth = 8;
ctx.strokeStyle = '#FF0000';
ctx.stroke();

// Salva come PNG
const link = document.createElement('a');
link.download = 'icon.png';
link.href = canvas.toDataURL('image/png');
link.click(); 