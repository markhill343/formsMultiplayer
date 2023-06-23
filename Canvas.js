export class Canvas {
    constructor(canvasDomElement, toolArea) {
        //Hold the shapes depending on the state of the shape
        this.shapes = new Map();
        this.markedShapes = [];
        this.clickedShapesOnPoint = [];
        this.canvasDomElement = canvasDomElement;
        this.ctx = this.canvasDomElement.getContext("2d");
        const { width, height } = canvasDomElement.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.canvasDomElement.addEventListener("mousemove", this.createMouseHandler("handleMouseMove", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener("mousedown", this.createMouseHandler("handleMouseDown", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener("mouseup", this.createMouseHandler("handleMouseUp", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener('click', this.createMouseHandler('handleMouseClick', this.canvasDomElement, toolArea));
        /*
        // event listener for the selection button
        document.getElementById("selectionButton").addEventListener('click', () => {
            this.selectionMode = !this.selectionMode;
            if (this.selectionMode == true) {
                console.log("selction mode activated")

            }else{
                console.log("selction mode deactivated")
            }
        });
        */
    }
    createMouseHandler(methodName, canvasDomElement, toolArea) {
        return function (e) {
            e = e || window.event;
            if ('object' === typeof e) {
                const btnCode = e.button, x = e.pageX - canvasDomElement.offsetLeft, y = e.pageY - canvasDomElement.offsetTop, ss = toolArea.getSelectedShape();
                // if left mouse button is pressed,
                // and if a tool is selected, do something
                if (e.button === 0 && ss) {
                    const m = ss[methodName];
                    // This in the shapeFactory should be the factory itself.
                    m.call(ss, x, y, e);
                }
            }
        };
    }
    draw() {
        // TODO: it there a better way to reset the canvas?
        this.setContext();
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.stroke();
        let colour;
        this.shapes.forEach((shape) => {
            let isMarked = false;
            for (let markedShape of this.markedShapes) {
                if (shape.id === markedShape.id) {
                    isMarked = true;
                    colour = this.markedColour;
                    break;
                }
            }
            //setting to standard here
            shape.draw(this.ctx, isMarked, colour);
        });
    }
    addShape(shape) {
        this.shapes.set(shape.id, shape);
        this.draw();
    }
    removeShape(shape, redraw) {
        this.shapes.delete(shape.id);
        this.markedShapes = this.markedShapes.filter(markedShape => markedShape.id !== shape.id);
        redraw ? this.draw() : this;
    }
    setContext() {
        this.ctx = this.canvasDomElement.getContext("2d");
    }
    isShapeOnClickedPoint(x, y) {
        this.clickedShapesOnPoint = [];
        let isShapeOnPoint = false;
        this.shapes.forEach((Shape) => {
            if (Shape.isMarked(x, y)) {
                this.clickedShapesOnPoint.push(Shape);
                isShapeOnPoint = true;
            }
        });
        return isShapeOnPoint;
    }
    markShape() {
        this.markedShapes.forEach(shape => {
            this.unMarkShape(shape);
        });
        if (this.clickedShapesOnPoint.length > 0) {
            this.addMarkShape(this.clickedShapesOnPoint[0]);
        }
    }
    markShapes() {
        if (this.clickedShapesOnPoint.length > 0) {
            this.addMarkShape(this.clickedShapesOnPoint[0]);
        }
    }
    addMarkShape(shape2Mark) {
        const shape = this.shapes.get(shape2Mark.id);
        if (shape !== undefined) {
            this.markedShapes.push(shape);
            this.draw();
        }
    }
    unMarkShape(shape2UnMark) {
        const shape = this.shapes.get(shape2UnMark.id);
        if (shape !== undefined) {
            this.markedShapes = this.markedShapes.filter(shape => shape.id !== shape2UnMark.id);
            this.draw();
        }
    }
}
//# sourceMappingURL=Canvas.js.map