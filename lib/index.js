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

// Funções do quadro, limpar, restaurar, dowload..

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

//------------------------------------------------------------------------

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

// Funções relacionadas à imagem 

const imgAdded = (e) => {
    const inputElem = document.getElementById('myImg');
    const file = inputElem.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
            const desiredWidth = 200; 
            const desiredHeight = 200; 

            img.scaleToWidth(desiredWidth);
            img.scaleToHeight(desiredHeight);

            canvas.add(img);
            canvas.renderAll();
        });
    };

    reader.readAsDataURL(file);
};

document.getElementById('myImg').addEventListener('change', imgAdded);


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


document.addEventListener('paste', (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            const reader = new FileReader();

            reader.onload = (event) => {
                fabric.Image.fromURL(event.target.result, (img) => {
                    img.scaleToWidth(200); 
                    img.scaleToHeight(200);
                    canvas.add(img);
                    canvas.renderAll();
                });
            };

            reader.readAsDataURL(file);
        }
    }
});

//------------------------------------------------------------------------

// Funções para alteração de texto

const fonts = ["Pacifico", "VT323", "Quicksand", "Inconsolata"];

const textbox = new fabric.Textbox('Digite aqui', {
    left: 50,
    top: 50,
    width: 300,
    fontSize: 30
});
canvas.add(textbox).setActiveObject(textbox);

const select = document.getElementById("font-family");
fonts.forEach((font) => {
    const option = document.createElement('option');
    option.innerHTML = font;
    option.value = font;
    select.appendChild(option);
});

document.getElementById('font-family').addEventListener('change', function() {
    const selectedFont = this.value;
    if (selectedFont) {
        loadAndUse(selectedFont);
    }
});

function loadAndUse(font) {
    const fontUrlMap = {
        VT323: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
        Pacifico: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
        Quicksand: 'https://fonts.googleapis.com/css2?family=Quicksand&display=swap',
        Inconsolata: 'https://fonts.googleapis.com/css2?family=Inconsolata&display=swap'
    };

    if (fontUrlMap[font]) {
        const link = document.createElement('link');
        link.href = fontUrlMap[font];
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    const myFont = new FontFaceObserver(font);
    myFont.load()
        .then(() => {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'textbox') {
                activeObject.set("fontFamily", font);
                canvas.requestRenderAll();
            }
        })
        .catch((e) => {
            console.log(e);
            alert('Falha ao carregar a fonte ' + font);
        });
}

//------------------------------------------------------------------------
