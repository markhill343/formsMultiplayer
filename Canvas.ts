import {Shape, ShapeManager} from "./types.js";
import {ToolArea} from "./ToolArea.js";
import {MenuApi} from "./menuApi.js"

export class Canvas implements ShapeManager {
    private ctx: CanvasRenderingContext2D;
    private readonly canvasDomElement: HTMLCanvasElement;
    private readonly width: number;
    private readonly height: number;
    //Hold the shapes depending on the state of the shape
    private shapes: Map<number, Shape> = new Map();
    private markedShapes: Shape[] = [];
    private clickedShapesOnPoint: Shape[] = [];
    private markedColour: 'rgb(0,255,115)';
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

    draw() {
        // TODO: it there a better way to reset the canvas?
        this.setContext()
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

    iterateShapes() {
        if (this.clickedShapesOnPoint.length > 0) {
            let helper = this.markedShapes.length;
            let index = this.clickedShapesOnPoint.indexOf(this.markedShapes[helper-1]);

            if (this.clickedShapesOnPoint.length - 1 > index) {
                if (this.markedShapes[helper-1]) {
                    this.unMarkShape(this.markedShapes[helper-1]);
                }
                this.addMarkShape(this.clickedShapesOnPoint[0]);
            }
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

        /*
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
        */

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

        //menu.addItems(deleteItem, sep1, radioColorOption, sep2, radioLineOption, sep3, moveForeGroundItem, sep4, moveToBackGroundItem);
        menu.addItems(deleteItem, sep1, radioColorOption, sep2, radioLineOption, sep3, sep4);

        return menu;
    }

}
