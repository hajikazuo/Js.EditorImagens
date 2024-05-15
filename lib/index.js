function downloadImage() {
    var canvas = document.getElementById("canvas");
    var dataURL = canvas.toDataURL("image/png");
    var link = document.createElement("a");
    link.href = dataURL;
    link.download = "imagem_combinada.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const initCanvas = (id) => {
    const container = document.getElementById(id).parentElement;

    const canvas = new fabric.Canvas(id, {
        width: container.clientWidth,
        height: container.clientHeight * 2,
        selection: false
    });

    window.addEventListener('resize', () => {
        canvas.setDimensions({
            width: container.clientWidth,
            height: container.clientHeight * 2
        });
    });

    return canvas;
};

const setBackground = (url, canvas) => {
    fabric.Image.fromURL(url, (img) => {
        canvas.backgroundImage = img
        canvas.renderAll()
    });
};

const toggleMode = (mode) => {
    if (mode === modes.pan) {
        if (currentMode === modes.pan) {
            currentMode = '';
        } else {
            currentMode = modes.pan;
            canvas.isDrawingMode = false;
            canvas.renderAll();
        }
    } else if (mode === modes.drawing) {
        if (currentMode === modes.drawing) {
            currentMode = '';
            canvas.isDrawingMode = false;
            canvas.renderAll();
        } else {
            currentMode = modes.drawing;
            canvas.freeDrawingBrush.color = color;
            canvas.isDrawingMode = true;
            canvas.renderAll();
        }      
    }
};

const setPanEvents = (canvas) => {
    canvas.on('mouse:move', (event) => {
        if (mousePressed && currentMode === modes.pan) {
            canvas.setCursor('grab');
            canvas.renderAll();
            const mEvent = event.e;
            const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
            canvas.relativePan(delta);
        }
    });
    
    canvas.on('mouse:down', (event) => {
        mousePressed = true;
        if (currentMode === modes.pan) {
            canvas.setCursor('grab');
            canvas.renderAll();
        }
    });

    canvas.on('mouse:up', (event) => {
        mousePressed = false;
        canvas.setCursor('default');
        canvas.renderAll();
    });
};

const setColorListener = () => {
    const picker = document.getElementById('colorPicker');
    picker.addEventListener('change', (event) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            activeObject.set("fill", '#' + event.target.value);
            canvas.requestRenderAll();
        }
    });
};

const clearCanvas = (canvas, state) => {
    state.val = canvas.toSVG();
    canvas.getObjects().forEach((o) => {
        if(o !== canvas.backgroundImage) {
            canvas.remove(o);
        }
    });
};

const restoreCanvas = (canvas, state, bgUrl) => {
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects => {
            objects = objects.filter(o => o['xlink:href'] !== bgUrl);
            canvas.add(...objects);
            canvas.requestRenderAll();
        });
    }
};

const createRect = (canvas) => {
    const canvCenter = canvas.getCenter();
    const rect = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'green',
        left: canvCenter.left,
        top: -50,
        originX: 'center',
        originY: 'center',
        cornerColor: 'white'
    });
    canvas.add(rect);
    
    rect.animate('top', canvCenter.top, {
        onChange: canvas.renderAll.bind(canvas)
    });
    
    rect.on('selected', () => {
        rect.set('fill', 'white');
        canvas.renderAll();
    });
    
    rect.on('deselected', () => {
        rect.set('fill', 'green');
        canvas.renderAll();
    });
};

const createCirc = (canvas) => {
    const canvCenter = canvas.getCenter();
    const circle = new fabric.Circle({
        radius: 50,
        fill: 'orange',
        left: canvCenter.left,
        top: -50,
        originX: 'center',
        originY: 'center',
        cornerColor: 'white'
    });
    canvas.add(circle);
    canvas.renderAll();
    
    circle.animate('top', canvas.height - 50, {
        onChange: canvas.renderAll.bind(canvas),
        onComplete: () => {
            circle.animate('top', canvCenter.top, {
                onChange: canvas.renderAll.bind(canvas),
                easing: fabric.util.ease.easeOutBounce,
                duration: 200
            });
        }
    });
    
    circle.on('selected', () => {
        circle.set('fill', 'white');
        canvas.requestRenderAll();
    });
    
    circle.on('deselected', () => {
        circle.set('fill', 'orange');
        canvas.requestRenderAll();
    });
};

const groupObjects = (canvas, group, shouldGroup) => {
    if (shouldGroup) {
        const objects = canvas.getObjects();
        group.val = new fabric.Group(objects, {cornerColor: 'white'});
        clearCanvas(canvas, svgState);
        canvas.add(group.val);
        canvas.requestRenderAll();
    } else {
        group.val.destroy();
        let oldGroup = group.val.getObjects();
        clearCanvas(canvas, svgState);
        canvas.add(...oldGroup);
        group.val = null;
        canvas.requestRenderAll();
    }
};

const imgAdded = (e) => {
    const inputElem = document.getElementById('myImg');
    const file = inputElem.files[0];
    reader.readAsDataURL(file);
};

const canvas = initCanvas('canvas');
const svgState = {};
let mousePressed = false;
let color = '#000000';
const group = {};
const bgUrl = 'imagem_combinada.png';

let currentMode;

const modes = {
    pan: 'pan',
    drawing: 'drawing'
};

const reader = new FileReader();

setColorListener();
setBackground(bgUrl, canvas);
setPanEvents(canvas);

const inputFile = document.getElementById('myImg');
inputFile.addEventListener('change', imgAdded);

reader.addEventListener("load", () => {
    fabric.Image.fromURL(reader.result, img => {
        canvas.add(img);
        canvas.requestRenderAll();
    });
});

const urlMap = {
    VT323: 'url(https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJXUdVNF.woff2)',
    Pacifico: 'url(https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ-6H6MmBp0u-.woff2)',
    Lato100: 'url(https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHh30AXC-qNiXg7Q.woff2)',
    Lato900: 'url(https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50XSwiPGQ3q5d0.woff2)',
};
var fonts = ["Pacifico", "VT323", "Quicksand", "Inconsolata"];

var textbox = new fabric.Textbox('Digite aqui', {
    left: 50,
    top: 50,
    width: 300,
    fontSize: 30
});
canvas.add(textbox).setActiveObject(textbox);
fonts.unshift('Times New Roman');

var select = document.getElementById("font-family");
fonts.forEach(function(font) {
    var option = document.createElement('option');
    option.innerHTML = font;
    option.value = font;
    select.appendChild(option);
});

document.getElementById('font-family').addEventListener('change', function() {
    var selectedFont = this.value;
    if (selectedFont) {
        loadAndUse(selectedFont);
    }
});

function loadAndUse(font) {
    var myfont = new FontFaceObserver(font);
    myfont.load()
        .then(function() {
            var activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'textbox') {
                activeObject.set("fontFamily", font);
                canvas.requestRenderAll();
            }
        })
        .catch(function(e) {
            console.log(e);
            alert('Falha ao carregar a fonte ' + font);
        });
}
