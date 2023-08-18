import {Shape, ShapeManager, ShapeEventInterface, CanvasObserverInterface, ShapeArray} from "./types.js";
import {ToolArea} from "./ToolArea.js";
import {MenuApi} from "./menuApi.js"
import{Line, Rectangle, Circle, Triangle} from "./Shapes.js";

export class Canvas implements ShapeManager, CanvasObserverInterface {
    private ctx: CanvasRenderingContext2D;
    private readonly canvasDomElement: HTMLCanvasElement;
    private readonly width: number;
    private readonly height: number;
    //Hold the shapes depending on the state of the shape
    private shapes: Map<number, Shape> = new Map();
    private markedShapes: Shape[] = [];
    private clickedShapesOnPoint: Shape[] = [];
    private markedColour: string = 'rgb(0,255,115)';
    private fillColour: string = 'transparent';
    private lineColour: string =  'black';

    constructor(canvasDomElement: HTMLCanvasElement,
                toolArea: ToolArea) {
        this.canvasDomElement = canvasDomElement;
        this.ctx = this.canvasDomElement.getContext("2d");

        const { width, height} = canvasDomElement.getBoundingClientRect();
        this.width = width;
        this.height = height;

        this.canvasDomElement.addEventListener("mousemove",
            this.createMouseHandler("handleMouseMove", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener("mousedown",
            this.createMouseHandler("handleMouseDown", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener("mouseup",
            this.createMouseHandler("handleMouseUp", this.canvasDomElement, toolArea));
        this.canvasDomElement.addEventListener('click',
            this.createMouseHandler('handleMouseClick', this.canvasDomElement, toolArea));


        this.canvasDomElement.addEventListener("contextmenu", ev => {
            ev.preventDefault();
            const toolSelection = toolArea.getSelectedShape();
            if (toolSelection !== undefined) {
                if (toolSelection.label === "Selektion") {
                    let contextMenu: MenuApi = this.setupContextMenu();
                    contextMenu.show(ev.clientX, ev.clientY);
                }
            }
        });


    }

    createMouseHandler(methodName: string, canvasDomElement, toolArea) {
        return function (e) {
            e = e || window.event;

            if ('object' === typeof e) {
                const btnCode = e.button,
                    x = e.pageX - canvasDomElement.offsetLeft,
                    y = e.pageY - canvasDomElement.offsetTop,
                    ss = toolArea.getSelectedShape();
                // if left mouse button is pressed,
                // and if a tool is selected, do something
                if (e.button === 0 && ss) {
                    const m = ss[methodName];
                    // This in the shapeFactory should be the factory itself.
                    m.call(ss, x, y, e);
                }
            }
        }
    }

    update(event: ShapeEventInterface) {
        switch (event.type) {
            case "addShape":
                const shape = this.deserializeShape(event.shape);
                if (shape.zOrder === -1) {
                    // new Shape
                    this.addShape(shape, event.redraw, event.isFinal);
                } else {
                    this.addShape(shape, event.redraw, event.isFinal, shape.zOrder);
                }
                break;
            case "removeShape":
                this.removeShapeWithId(event.shapeId, event.redraw, event.isFinal);
                break;
            case 'selectShape':
                this.selectShape(event.shapeId, event.redraw);
                break;
            case 'unselectShape':
                this.unselectShape(event.shapeId, event.redraw);
                break;
            default:
                console.warn(`Unknown event type: ${event.type}`);
                break;
        }
    }

    draw() {
        this.setContext();
        this.ctx.beginPath();
        this.ctx.clearRect(0,0, this.width ,this.height);
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
        })
    }

    addShape(shape: Shape){
        this.shapes.set(shape.id, shape);
        this.draw();
    }

    removeShape(shape: Shape, redraw: boolean) {
        this.shapes.delete(shape.id)
        this.markedShapes = this.markedShapes.filter(markedShape => markedShape.id !== shape.id)
        redraw ? this.draw() : this;
    }

    private setContext() {
        this.ctx = this.canvasDomElement.getContext("2d");
    }

    isShapeOnClickedPoint(x:number, y:number): boolean {
        this.clickedShapesOnPoint = [];
        let isShapeOnPoint: boolean = false;
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

    private addMarkShape(shape2Mark: Shape) {
        const shape = this.shapes.get(shape2Mark.id);
        if (shape !== undefined) {
            this.markedShapes.push(shape);
            this.draw();
        }
    }

    private unMarkShape(shape2UnMark: Shape) {
        const shape = this.shapes.get(shape2UnMark.id);
        if (shape !== undefined) {
            this.markedShapes = this.markedShapes.filter(shape => shape.id !== shape2UnMark.id);
            this.draw();
        }
    }

    private changeShapeOrder(toForeGround: boolean) {
        const shapeToMove: Shape = this.markedShapes[0];

        // Remove the selected shape from its current position
        this.removeShape(shapeToMove, false); // setting redraw to false

        if (toForeGround) {
            // If moving to the foreground, add the shape back to the end of the shapes map
            this.addShape(shapeToMove);
        } else {
            // If moving to the background, use doMoveToBackground to move it to the beginning of the shapes map
            this.doMoveToBackground(shapeToMove);
        }

        // Add shape to selected shapes again
        this.addMarkShape(shapeToMove);
    }

    private doMoveToBackground(shapeToMove: Shape) {
        // Create a new map that starts with the shape that should be at the start
        const helperMap: Map<number, Shape> = new Map();
        helperMap.set(shapeToMove.id, shapeToMove);

        // Combine the new map with the existing shapes map
        this.shapes = new Map([...helperMap, ...this.shapes]);

        // Redraw the canvas
        this.draw();
    }


    iterateShapes() {
        if (this.clickedShapesOnPoint.length > 0) {
            let helper = this.markedShapes.length;
            let index = this.clickedShapesOnPoint.indexOf(this.markedShapes[helper-1]);

            // Unmark the currently marked shape
            if (this.markedShapes[helper-1]) {
                this.unMarkShape(this.markedShapes[helper-1]);
            }

            // Determine the next shape to mark
            let nextShapeToMark;
            if (index < this.clickedShapesOnPoint.length - 1) {
                // If we haven't reached the end of the array, mark the next shape
                nextShapeToMark = this.clickedShapesOnPoint[index + 1];
            } else {
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


        let radioColorOption = MenuApi.createRadioOption(
            "Background color",
            {"transparent": "transparent", "red": "rot", "green": "grün", "blue": "blau", "black": "schwarz"},
            currentFillColour,
            this,
            true,
        );

        let radioLineOption = MenuApi.createRadioOption(
            "Outline color",
            {"red": "rot", "green": "grün", "blue": "blau", "black": "schwarz"},
            currentLineColour,
            this,
            false,
        );

        let sep1 = MenuApi.createSeparator();
        let sep2 = MenuApi.createSeparator();
        let sep3 = MenuApi.createSeparator();
        let sep4 = MenuApi.createSeparator();

        menu.addItems(deleteItem, sep1, radioColorOption, sep2, radioLineOption, sep3, moveForeGroundItem, sep4, moveToBackGroundItem);

        return menu;
    }

    private setCtxStandardState() {
        this.ctx.fillStyle = this.fillColour;
        this.ctx.strokeStyle = this.lineColour;
        this.ctx.save();
    }

    private deserializeShape(shape: Shape): Shape {
        switch (shape.type) {
            case 'Line':
                let line = shape as Line;
                return new Line(line.from, line.to, line.id, line.bgColor, line.borderColor, line.order);

            case 'Circle':
                let circle = shape as Circle;
                return new Circle(circle.center, circle.radius, circle.id, circle.bgColor, circle.borderColor, circle.order);

            case 'Rectangle':
                let rectangle = shape as Rectangle;
                return new Rectangle(rectangle.from, rectangle.to, rectangle.id, rectangle.bgColor, rectangle.borderColor, rectangle.order);

            case 'Triangle':
                let triangle = shape as Triangle;
                return new Triangle(triangle.p1, triangle.p2, triangle.p3, triangle.id, triangle.bgColor, triangle.borderColor, triangle.order);

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


