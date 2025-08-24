const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const toolSelector = document.getElementById("toolSelector");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const edificacaoSelector = document.getElementById("edificacaoSelector");
const textSize = document.getElementById("textSize");

let drawing = false;
let startX, startY;
let objects = [];
let history = [];
let redoStack = [];

let currentTool = "pencil";
let currentObject = null;

// Adiciona os event listeners
toolSelector.addEventListener("change", (e) => {
    currentTool = e.target.value;
    canvas.style.cursor = currentTool === "text" ? "text" : "crosshair";
    if (currentTool === "eraser") {
        colorPicker.disabled = true;
    } else {
        colorPicker.disabled = false;
    }
});

edificacaoSelector.addEventListener("change", (e) => {
    currentTool = "edificacao";
    toolSelector.value = "edificacao";
    canvas.style.cursor = "crosshair";
});

// Funções de salvamento e restauração de estado
function saveState() {
    redoStack = [];
    history.push(JSON.parse(JSON.stringify(objects)));
    if (history.length > 20) history.shift();
}

function restoreState(state) {
    objects = JSON.parse(JSON.stringify(state));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        drawObject(obj);
    });
}

// Eventos do mouse
canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    if (currentTool === "text") {
        currentObject = {
            tool: "text",
            color: colorPicker.value,
            size: textSize.value,
            points: [{ x: startX, y: startY }],
            text: null,
            rotation: 0
        };
    } else if (currentTool === "edificacao") {
        const type = edificacaoSelector.value;
        if (type) {
            objects.push({
                tool: "edificacao",
                type: type,
                points: [{ x: startX, y: startY }],
            });
            saveState();
            redrawAll();
            edificacaoSelector.value = "";
            currentTool = "pencil";
        }
    } else {
        saveState();
        currentObject = {
            tool: currentTool,
            color: currentTool === "eraser" ? "#fff" : colorPicker.value,
            size: brushSize.value,
            points: [{ x: startX, y: startY }]
        };
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing || currentTool === "edificacao") return;
    const x = e.offsetX, y = e.offsetY;

    if (currentObject) {
        if (currentTool === "pencil" || currentTool === "eraser") {
            currentObject.points.push({ x: x, y: y });
        } else {
            currentObject.points[1] = { x: x, y: y };
        }
        redrawAll();
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (!drawing) return;

    if (currentObject) {
        if (currentTool === "text") {
            const text = prompt("Digite o texto:");
            if (text) {
                currentObject.text = text;
                const rotation = prompt("Digite o ângulo de rotação (em graus, 0 para horizontal, 90 para vertical):");
                currentObject.rotation = rotation ? parseFloat(rotation) : 0;
            }
        }
        objects.push(currentObject);
        saveState();
        redrawAll();
    }

    drawing = false;
    currentObject = null;
});

canvas.addEventListener("mouseout", () => {
    drawing = false;
});

// Função para desenhar todas as formas no canvas
function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        drawObject(obj);
    });
    if (currentObject && currentTool !== "text") {
        drawObject(currentObject);
    }
}

function drawObject(obj) {
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = obj.size;
    ctx.fillStyle = obj.color;

    switch (obj.tool) {
        case "pencil":
        case "eraser":
            ctx.beginPath();
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.moveTo(obj.points[0].x, obj.points[0].y);
            obj.points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.stroke();
            break;
        case "line":
            drawLine(obj.points[0], obj.points[1]);
            break;
        case "rectangle":
            drawRect(obj.points[0], obj.points[1]);
            break;
        case "circle":
            drawCircle(obj.points[0], obj.points[1]);
            break;
        case "triangle":
            drawTriangle(obj.points[0], obj.points[1]);
            break;
        case "text":
            drawText(obj);
            break;
        case "edificacao":
            drawEdificacao(obj.type, obj.points[0].x, obj.points[0].y);
            break;
    }
}

// Funções de desenho
function drawLine(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function drawRect(p1, p2) {
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
}

function drawCircle(p1, p2) {
    const radius = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawTriangle(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p1.x - (p2.x - p1.x), p2.y);
    ctx.closePath();
    ctx.stroke();
}

function drawText(obj) {
    ctx.font = `${obj.size}px Arial`;
    ctx.fillStyle = obj.color;
    ctx.textAlign = 'center';

    ctx.save();
    ctx.translate(obj.points[0].x, obj.points[0].y);
    ctx.rotate(obj.rotation * Math.PI / 180);
    ctx.fillText(obj.text, 0, 0);
    ctx.restore();
}

// Funções de desenho de edificações
function drawEdificacao(type, x, y) {
    let size = 30;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';

    switch(type) {
        case 'postoSaude': ctx.fillText('🏥', x, y); break;
        case 'hospital': ctx.fillText('➕', x, y); break;
        case 'escolaPublica': ctx.fillText('🎓', x, y); break;
        case 'rodoviaria': ctx.fillText('🚌', x, y); break;
        case 'edificacaoPublica': ctx.fillText('🏢', x, y); break;
        case 'cemiterio': ctx.fillText('⚰️', x, y); break;
        case 'aeroporto': ctx.fillText('✈️', x, y); break;
        case 'igreja': ctx.fillText('⛪', x, y); break;
        case 'parque': ctx.fillText('🌳', x, y); break;
        case 'supermercado': ctx.fillText('🛒', x, y); break;
        case 'restaurante': ctx.fillText('🍽️', x, y); break;
        case 'bombeiros': ctx.fillText('🚒', x, y); break;
        case 'policia': ctx.fillText('🚓', x, y); break;
        case 'praca': ctx.fillText('⛲', x, y); break;
    }
}

// Funções de controle
function undo() {
    if (history.length > 1) {
        redoStack.push(history.pop());
        restoreState(history[history.length - 1]);
    } else if (history.length === 1) {
        redoStack.push(history.pop());
        clearCanvas();
    }
}

function redo() {
    if (redoStack.length > 0) {
        const nextState = redoStack.pop();
        history.push(nextState);
        restoreState(nextState);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects = [];
    history = [];
    redoStack = [];
}

function saveImage() {
    const link = document.createElement('a');
    link.download = 'mapa_urbano.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function savePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 277, 190);
    pdf.save("mapa_urbano.pdf");
}

function printCanvas() {
    const dataUrl = canvas.toDataURL();
    const windowContent = `<!DOCTYPE html>
<html>
<head><title>Imprimir Mapa</title></head>
<body>
    <img src="${dataUrl}" style="max-width: 100%;">
</body>
</html>`;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(windowContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

// Inicializa o canvas
clearCanvas();