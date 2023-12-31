import { MenuApi } from "./menuApi.js";
import { Line, Rectangle, Circle, Triangle } from "./Shapes";
export class Canvas {
    constructor(canvasDomElement, toolArea) {
        //Hold the shapes depending on the state of the shape
        this.shapes = new Map();
        this.markedShapes = [];
        this.clickedShapesOnPoint = [];
        this.markedColour = 'rgb(0,255,115)';
        this.fillColour = 'transparent';
        this.lineColour = 'black';
        this.canvasDomElement = canvasDomElement;
        this.ctx = this.canvasDomElement.getContext("2d");
        const { width, height } = canvasDomElement.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.canvasDomElement.addEventListener("mousemove", this.createMouseHandler("handleMouseMove", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener("mousedown", this.createMouseHandler("handleMouseDown", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener("mouseup", this.createMouseHandler("handleMouseUp", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener('click', this.createMouseHandler('handleMouseClick', this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener("contextmenu", ev => {
            ev.preventDefault();
            const toolSelection = toolArea.getSelectedShape();
            if (toolSelection !== undefined) {
                if (toolSelection.label === "Selektion") {
                    let contextMenu = this.setupContextMenu();
                    contextMenu.show(ev.clientX, ev.clientY);
                }
            }
        });
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
    update(event) {
        switch (event.type) {
            case "addShape":
                const shape = this.deserializeShape(event.shape);
                if (shape.order === -1) {
                    // new Shape
                    this.addShape(shape, event.redraw, event.Final);
                }
                else {
                    this.addShape(shape, event.redraw, event.Final, shape.order);
                }
                break;
            case "removeShape":
                this.removeShapeWithId(event.shapeId, event.redraw, event.Final);
                break;
            case 'markShape':
                this.markShape();
                break;
            case 'unmarkShape':
                this.unMarkShape(event.shape);
                break;
            default:
                console.warn(`Unknown event type: ${event.type}`);
                break;
        }
    }
    draw() {
        this.setContext();
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, this.width, this.height);
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
            this.setCtxStandardState();
            shape.draw(this.ctx, isMarked, colour);
        });
    }
    drawClicked() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let id in this.clickedShapesOnPoint) {
            this.clickedShapesOnPoint[id].draw(this.ctx, false, this.fillColour);
        }
        return this;
    }
    addShape(shape, redraw = true, Final = false, index = this.shapes.size) {
        if (Final) {
            this.shapes.set(shape.id, shape);
            this.clickedShapesOnPoint = [];
            this.draw();
            return redraw ? this.drawClicked() : this;
        }
        this.shapes.set(shape.id, shape);
        this.draw();
    }
    removeShape(shape, redraw) {
        this.shapes.delete(shape.id);
        this.markedShapes = this.markedShapes.filter(markedShape => markedShape.id !== shape.id);
        redraw ? this.draw() : this;
    }
    removeShapeWithId(id, redraw = true, isFinal = false) {
        if (isFinal) {
            if (this.shapes.has(id)) {
                this.shapes.delete(id);
                // Check if the number of shapes is less than 60% of the map size and if the map size is greater than 16
                if (this.shapes.size * 0.6 > this.shapes.size && this.shapes.size > 16) {
                    // Here you can resize the map or perform other operations if needed
                }
                if (redraw) {
                    this.draw();
                }
            }
        }
        else {
            if (this.shapes.has(id)) {
                this.shapes.delete(id);
                if (redraw) {
                    this.draw();
                }
            }
        }
        return this;
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
    markShape(id = null, redraw = true) {
        this.markedShapes.forEach(shape => {
            this.unMarkShape(shape);
        });
        if (this.clickedShapesOnPoint.length > 0) {
            this.addMarkShape(this.clickedShapesOnPoint[0]);
        }
    }
    markShapes(id = null, redraw = true) {
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
    unMarkShape(shape2UnMark, id = null, redraw = true) {
        const shape = this.shapes.get(shape2UnMark.id);
        if (shape !== undefined) {
            this.markedShapes = this.markedShapes.filter(shape => shape.id !== shape2UnMark.id);
            this.draw();
        }
    }
    getMarkedShapes() {
        return this.markedShapes;
    }
    changeShapeOrder(toForeGround) {
        const shapeToMove = this.markedShapes[0];
        // Remove the selected shape from its current position
        this.removeShape(shapeToMove, false); // setting redraw to false
        if (toForeGround) {
            // If moving to the foreground, add the shape back to the end of the shapes map
            this.addShape(shapeToMove);
        }
        else {
            // If moving to the background, use doMoveToBackground to move it to the beginning of the shapes map
            this.doMoveToBackground(shapeToMove);
        }
        // Add shape to selected shapes again
        this.addMarkShape(shapeToMove);
    }
    doMoveToBackground(shapeToMove) {
        // Create a new map that starts with the shape that should be at the start
        const helperMap = new Map();
        helperMap.set(shapeToMove.id, shapeToMove);
        // Combine the new map with the existing shapes map
        this.shapes = new Map([...helperMap, ...this.shapes]);
        // Redraw the canvas
        this.draw();
    }
    iterateShapes() {
        if (this.clickedShapesOnPoint.length > 0) {
            let helper = this.markedShapes.length;
            let index = this.clickedShapesOnPoint.indexOf(this.markedShapes[helper - 1]);
            // Unmark the currently marked shape
            if (this.markedShapes[helper - 1]) {
                this.unMarkShape(this.markedShapes[helper - 1]);
            }
            // Determine the next shape to mark
            let nextShapeToMark;
            if (index < this.clickedShapesOnPoint.length - 1) {
                // If we haven't reached the end of the array, mark the next shape
                nextShapeToMark = this.clickedShapesOnPoint[index + 1];
            }
            else {
                // If we've reached the end of the array, mark the first shape
                nextShapeToMark = this.clickedShapesOnPoint[0];
            }
            // Mark the next shape
            this.addMarkShape(nextShapeToMark);
        }
    }
    setupContextMenu() {
        let currentFillColour = this.fillColour;
        let currentLineColour = this.lineColour;
        if (this.markedShapes.length < 2 && this.markedShapes[0] != undefined) {
            if (this.markedShapes[0].fillColour != undefined)
                currentFillColour = this.markedShapes[0].fillColour;
            if (this.markedShapes[0].lineColour != undefined)
                currentLineColour = this.markedShapes[0].lineColour;
        }
        let menu = MenuApi.createMenu();
        let deleteItem = MenuApi.createItem("Delete", () => {
            this.markedShapes.forEach((shape) => {
                this.removeShape(shape, true);
            });
        });
        const moveForeGroundItem = MenuApi.createItem("To Foreground", () => {
            if (this.markedShapes.length == 1) {
                this.changeShapeOrder(true);
            }
        });
        const moveToBackGroundItem = MenuApi.createItem("To Background", () => {
            if (this.markedShapes.length == 1) {
                this.changeShapeOrder(false);
            }
        });
        let radioColorOption = MenuApi.createRadioOption("Background color", { "transparent": "transparent", "red": "rot", "green": "grün", "blue": "blau", "black": "schwarz" }, currentFillColour, this, true);
        let radioLineOption = MenuApi.createRadioOption("Outline color", { "red": "rot", "green": "grün", "blue": "blau", "black": "schwarz" }, currentLineColour, this, false);
        let sep1 = MenuApi.createSeparator();
        let sep2 = MenuApi.createSeparator();
        let sep3 = MenuApi.createSeparator();
        let sep4 = MenuApi.createSeparator();
        menu.addItems(deleteItem, sep1, radioColorOption, sep2, radioLineOption, sep3, moveForeGroundItem, sep4, moveToBackGroundItem);
        return menu;
    }
    setCtxStandardState() {
        this.ctx.fillStyle = this.fillColour;
        this.ctx.strokeStyle = this.lineColour;
        this.ctx.save();
    }
    deserializeShape(shape) {
        switch (shape.type) {
            case 'Line':
                let line = shape;
                return new Line(line.from, line.to, line.id, line.fillColour, line.lineColour, line.order);
            case 'Circle':
                let circle = shape;
                return new Circle(circle.center, circle.radius, circle.id, circle.fillColour, circle.lineColour, circle.order);
            case 'Rectangle':
                let rectangle = shape;
                return new Rectangle(rectangle.from, rectangle.to, rectangle.id, rectangle.fillColour, rectangle.lineColour, rectangle.order);
            case 'Triangle':
                let triangle = shape;
                return new Triangle(triangle.p1, triangle.p2, triangle.p3, triangle.id, triangle.fillColour, triangle.lineColour, triangle.order);
            default:
                throw new Error(`Unknown shape type: ${shape.type}`);
        }
    }
}
//quellen:
//https://stackoverflow.com/questions/14979753/how-do-you-add-radio-buttons-to-menu-items
//https://www.javascripttutorial.net/javascript-dom/javascript-appendchild/
//https://www.w3schools.com/jsref/met_node_insertbefore.asph
//https://www.w3schools.com/js/js_function_definition.asp
//https://www.javascripttutorial.net/javascript-immediately-invoked-function-expression-iife/
//https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/
//https://www.w3schools.com/jsref/event_oncontextmenu.asp
//https://help.syncfusion.com/typescript/radiobutton/getting-started
//https://github.com/vpysaran/react-typescript-radiobutton
//# sourceMappingURL=Canvas.js.map