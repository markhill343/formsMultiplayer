import {Shape, ShapeFactory, ShapeManager} from "./types.js";

const MARKER_SIZE = 10;  // size of the marker rectangle
const MARKER_COLOR = 'blue';  // color of the marker

export class Point2D {
    constructor(readonly x: number, readonly y: number) {}
}
export class AbstractShape {
    private static counter: number = 0;
    readonly id: number;
    fillColour: string;
    lineColour: string;

    order: number;

    constructor() {
        this.id = AbstractShape.counter++;
    }

    setFillColour(colour: string) {
        this.fillColour = colour;
        console.log("set fillll colour!!!!!!!!");
    }

    setLineColour(colour: string) {
        this.lineColour = colour;
        console.log("setline colour!!!!!!!!");
    }
}

abstract class AbstractFactory<T extends Shape> {
    private from: Point2D;
    private tmpTo: Point2D;
    private tmpShape: T;

    constructor(readonly shapeManager: ShapeManager) {}

    abstract createShape(from: Point2D, to: Point2D): T;

    handleMouseDown(x: number, y: number) {
        this.from = new Point2D(x, y);
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShape(this.tmpShape, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x,y)));
        this.from = undefined;

    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x,y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShape(this.tmpShape, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x,y));
            this.shapeManager.addShape(this.tmpShape);
        }
    }

}
export class Line extends AbstractShape implements Shape {

    public readonly type = 'line';

    constructor(readonly from: Point2D, readonly to: Point2D){
        super();
    }

    draw(ctx: CanvasRenderingContext2D, IsMarked?: boolean) {
        ctx.strokeStyle = this.lineColour;
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();

        if (IsMarked) {
            ctx.fillStyle = MARKER_COLOR;
            ctx.fillRect(this.from.x - MARKER_SIZE/2, this.from.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.to.x - MARKER_SIZE/2, this.to.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
        }
    }

    isMarked(x, y): boolean {
        // calculate th distance from point to point
        const d1 = Math.sqrt(Math.pow(this.from.x - x, 2) + Math.pow(this.from.y - y, 2));
        const d2 = Math.sqrt(Math.pow(this.to.x - x, 2) + Math.pow(this.to.y - y, 2));

        // CAlculate the lenght of the line
        const lineLength = Math.sqrt(Math.pow(this.from.x - this.to.x, 2) + Math.pow(this.from.y - this.to.y, 2));

        const tolerance = 0.1;

        return Math.abs(d1 + d2 - lineLength) < tolerance
    }




}
export class LineFactory extends  AbstractFactory<Line> implements ShapeFactory {

    public label: string = "Linie";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Line {
        return new Line(from, to);
    }

    handleMouseClick(x: number, y: number, e: MouseEvent) {
    }

}
export class Circle extends AbstractShape implements Shape {

    public readonly type = 'Circle';

    constructor(readonly center: Point2D, readonly radius: number){
        super();
    }
    draw(ctx: CanvasRenderingContext2D, IsMarked?: boolean) {
        ctx.strokeStyle = this.lineColour;
        ctx.fillStyle = this.fillColour;

        ctx.beginPath();
        ctx.arc(this.center.x,this.center.y,this.radius,0,2*Math.PI);
        ctx.stroke();
        ctx.fill();

        if (IsMarked) {
            ctx.fillStyle = MARKER_COLOR;
            ctx.fillRect(this.center.x - this.radius - MARKER_SIZE/2, this.center.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.center.x + this.radius - MARKER_SIZE/2, this.center.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
        }
    }

    isMarked(x, y): boolean {
        const dx = this.center.x - x;
        const dy = this.center.y - y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= this.radius;
    }

}
export class CircleFactory extends AbstractFactory<Circle> implements ShapeFactory {
    public label: string = "Kreis";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Circle {
        return new Circle(from, CircleFactory.computeRadius(from, to.x, to.y));
    }

    private static computeRadius(from: Point2D, x: number, y: number): number {
        const xDiff = (from.x - x),
            yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

    handleMouseClick(x: number, y: number, e: MouseEvent) {
    }
}
export class Rectangle extends AbstractShape implements Shape {

    public readonly type = 'Rectangle';

    constructor(readonly from: Point2D, readonly to: Point2D) {
        super();
    }

    draw(ctx: CanvasRenderingContext2D, IsMarked?: boolean) {
        ctx.fillStyle = this.fillColour;
        ctx.strokeStyle = this.lineColour;
        console.log("fill colour inside rect");
        console.log(this.fillColour);
        console.log(this.lineColour);
        ctx.beginPath();
        ctx.fillRect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.strokeRect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);

        if (IsMarked) {
            ctx.fillStyle = MARKER_COLOR;
            ctx.fillRect(this.from.x - MARKER_SIZE/2, this.from.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.to.x - MARKER_SIZE/2, this.to.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
        }
    }

    isMarked(x, y): boolean {
        return x >= this.from.x && x <= this.to.x &&
            y >= this.from.y && y <= this.to.y;
    }
}
export class RectangleFactory extends AbstractFactory<Rectangle> implements ShapeFactory{
    public label: string = "Rechteck";
    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Rectangle {
        return new Rectangle(from, to);
    }

    handleMouseClick(x: number, y: number, e: MouseEvent) {
    }
}
export class Triangle extends AbstractShape implements Shape {

    public readonly type = 'Triangle';

    constructor(readonly p1: Point2D, readonly p2: Point2D, readonly p3: Point2D) {
        super();
    }
    draw(ctx: CanvasRenderingContext2D, IsMarked?: boolean) {
        ctx.strokeStyle = this.lineColour;
        ctx.fillStyle = this.fillColour;
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.fill();
        ctx.stroke();

        if (IsMarked) {
            ctx.fillStyle = MARKER_COLOR;
            ctx.fillRect(this.p1.x - MARKER_SIZE/2, this.p1.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.p2.x - MARKER_SIZE/2, this.p2.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.p3.x - MARKER_SIZE/2, this.p3.y - MARKER_SIZE/2, MARKER_SIZE, MARKER_SIZE);
        }
    }

    isMarked(x: number, y: number): boolean {
        let v1, v2, v3;
        let negative, positive;

        v1 = check(x, y, this.p1, this.p2);
        v2 = check(x, y, this.p2, this.p3);
        v3 = check(x, y, this.p3, this.p1);

        negative = (v1 < 0) || (v2 < 0) || (v3 < 0);
        positive = (v1 > 0) || (v2 > 0) || (v3 > 0);

        return !(negative && positive);

        function check(x, y, p2, p3) {
            return (x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (y - p3.y);
        }
    }

}
export class TriangleFactory implements ShapeFactory {
    public label: string = "Dreieck";

    private from: Point2D;
    private tmpTo: Point2D;
    private tmpLine: Line;
    private thirdPoint: Point2D;
    private tmpShape: Triangle;

    constructor(readonly shapeManager: ShapeManager) {
    }

    handleMouseDown(x: number, y: number) {
        if (this.tmpShape) {
            this.shapeManager.removeShape(this.tmpShape, false);
            this.shapeManager.addShape(
                new Triangle(this.from, this.tmpTo, new Point2D(x, y)));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        } else {
            this.from = new Point2D(x, y);
        }
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShape(this.tmpLine, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x, y);
            this.thirdPoint = new Point2D(x, y);
            this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(this.tmpShape);
        }
    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }

        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x, y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShape(this.tmpShape, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(this.tmpShape);
            }
        } else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x, y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShape(this.tmpLine, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(this.from, this.tmpTo);
                this.shapeManager.addShape(this.tmpLine);
            }
        }
    }

    handleMouseClick(x: number, y: number, e: MouseEvent) {
    }
}
    export class SelectionFactory implements ShapeFactory {
    public label: string = "Selektion";

    constructor(readonly shapeManager: ShapeManager) {
    }

    handleMouseDown(x: number, y: number, e: MouseEvent) {}

    handleMouseMove(x: number, y: number) {}

    handleMouseUp(x: number, y: number, e: MouseEvent) {}

    handleMouseClick(x: number, y: number, e: MouseEvent) {
        this.shapeManager.isShapeOnClickedPoint(x,y);
        if (e.ctrlKey) {
            this.shapeManager.markShapes();
        } else if (e.altKey) {
            this.shapeManager.iterateShapes();
        } else {
            this.shapeManager.markShape()
        }
    }
}

