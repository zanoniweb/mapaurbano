const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let startX, startY;
let history = [], redoStack = [];
const toolSelector = document.getElementById("toolSelector");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
let textInput = null;

function saveState() {
    history.push(canvas.toDataURL());
    redoStack = [];
}

function undo() {
    if (history.length > 0) {
        redoStack.push(canvas.toDataURL());
        let img = new Image();
        img.src = history.pop();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

function redo() {
    if (redoStack.length > 0) {
        let img = new Image();
        img.src = redoStack.pop();
        img.onload = () => ctx.drawImage(img, 0, 0);
    }
}

function startDrawing(e) {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    saveState();
    if (toolSelector.value === "pencil" || toolSelector.value === "brush") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

function draw(e) {
    if (!drawing) return;
    const tool = toolSelector.value;
    const x = e.offsetX, y = e.offsetY;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;

    if (tool === "pencil" || tool === "brush") {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else {
        // Para formas geométricas, restauramos o estado anterior para evitar "riscos"
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let img = new Image();
        img.src = history[history.length - 1];
        img.onload = () => {
            ctx.drawImage(img, 0, 0);

            if (tool === "line") {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (tool === "rectangle") {
                ctx.strokeRect(startX, startY, x - startX, y - startY);
            } else if (tool === "circle") {
                ctx.beginPath();
                let radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (tool === "point") {
                ctx.beginPath();
                ctx.arc(x, y, brushSize.value / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (tool === "pentagon") {
                drawPentagon(ctx, startX, startY, 50);
            } else if (tool === "hexagon") {
                drawHexagon(ctx, startX, startY, 50);
            } else if (tool === "ellipse") {
                drawEllipse(ctx, startX, startY, 60, 40);
            } else if (tool === "star") {
                drawStar(ctx, startX, startY, 50);
            } else if (tool === "triangle") {
                drawTriangle(ctx, startX, startY, x, y);
            } else if (tool === "curve") {
                drawCurve(ctx, startX, startY, x, y);
            } else if (tool === "diamond") {
                drawDiamond(ctx, startX, startY, x, y);
            } else if (tool === "parallelogram") {
                drawParallelogram(ctx, startX, startY, x, y);
            } else if (tool === "heart") {
                drawHeart(ctx, startX, startY, x, y);
            }
        };
    }
}
function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function addText(e) {
    if (toolSelector.value === "text") {
        let text = prompt("Digite o texto:");
        if (text) {
            ctx.fillStyle = colorPicker.value;
            ctx.font = `${brushSize.value * 5}px Arial`;
            ctx.fillText(text, e.offsetX, e.offsetY);
            saveState();
        }
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history = [];
    redoStack = [];
}

function savePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 180, 120);
    pdf.save("mapa_urbano.pdf");
}

function printCanvas() {
    let w = window.open();
    w.document.write('<img src="' + canvas.toDataURL() + '"/>');
    w.print();
    w.close();
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("click", addText);

function drawPentagon(context, x, y, size) {
    const sides = 5;
    const step = 2 * Math.PI / sides;
    const shift = (Math.PI / 180.0) * -18;

    context.beginPath();
    for (let i = 0; i <= sides; i++) {
        const curStep = i * step + shift;
        context.lineTo(x + size * Math.cos(curStep), y + size * Math.sin(curStep));
    }
    context.closePath();
    context.stroke();
}

function drawHexagon(context, x, y, size) {
    const sides = 6;
    const step = 2 * Math.PI / sides;
    const shift = (Math.PI / 180.0) * -30;

    context.beginPath();
    for (let i = 0; i <= sides; i++) {
        const curStep = i * step + shift;
        context.lineTo(x + size * Math.cos(curStep), y + size * Math.sin(curStep));
    }
    context.closePath();
    context.stroke();
}

function drawEllipse(context, x, y, radiusX, radiusY) {
    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.stroke();
}

function drawStar(context, x, y, size) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;
    const step = Math.PI / spikes;
    const shift = (Math.PI / 180.0) * -18;


// Funções para desenhar as formas geométricas agregadas

function drawTriangle(ctx, startX, startY, x, y) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.lineTo(startX - (x - startX), y);
    ctx.closePath();
    ctx.stroke();
}

function drawCurve(ctx, startX, startY, x, y) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo((startX + x) / 2, (startY + y) / 2 - 50, x, y);
    ctx.stroke();
}

function drawDiamond(ctx, startX, startY, x, y) {
    const midX = (startX + x) / 2;
    const midY = (startY + y) / 2;
    ctx.beginPath();
    ctx.moveTo(midX, startY);
    ctx.lineTo(x, midY);
    ctx.lineTo(midX, y);
    ctx.lineTo(startX, midY);
    ctx.closePath();
    ctx.stroke();
}

function drawParallelogram(ctx, startX, startY, x, y) {
    const offsetX = (x - startX) / 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, startY);
    ctx.lineTo(x - offsetX, y);
    ctx.lineTo(startX - offsetX, y);
    ctx.closePath();
    ctx.stroke();
}

function drawHeart(ctx, startX, startY, x, y) {
    const width = x - startX;
    const height = y - startY;
    ctx.beginPath();
    ctx.moveTo(startX + width / 2, startY + height / 2);
    ctx.bezierCurveTo(startX + width / 2, startY, startX, startY, startX, startY + height / 2);
    ctx.bezierCurveTo(startX, y, startX + width / 2, y, startX + width / 2, y);
    ctx.bezierCurveTo(startX + width, y, startX + width, startY + height / 2, startX + width / 2, startY + height / 2);
    ctx.bezierCurveTo(startX + width, startY, startX + width / 2, startY, startX + width / 2, startY + height / 2);
    ctx.stroke();
}
// Final das funções para desenhar as formas geométricas agregadas

    context.beginPath();
    for (let i = 0; i < 2 * spikes; i++) {
        const curStep = i * step + shift;
        const radius = (i % 2 === 0) ? outerRadius : innerRadius;
        context.lineTo(x + radius * Math.cos(curStep), y + radius * Math.sin(curStep));
    }
    context.closePath();
    context.stroke();
}

// Função do comando para apagar texto.
function eraseText() {
    document.getElementById('notes').value = '';
}