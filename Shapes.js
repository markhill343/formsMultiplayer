const MARKER_SIZE = 10; // size of the marker rectangle
const MARKER_COLOR = 'blue'; // color of the marker
class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class AbstractShape {
    constructor() {
        this.id = AbstractShape.counter++;
    }
    setFillColour(colour) {
        this.fillColour = colour;
    }
    setLineColour(colour) {
        this.lineColour = colour;
    }
}
AbstractShape.counter = 0;
class AbstractFactory {
    constructor(shapeManager) {
        this.shapeManager = shapeManager;
    }
    handleMouseDown(x, y) {
        this.from = new Point2D(x, y);
    }
    handleMouseUp(x, y) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShape(this.tmpShape, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x, y)));
        this.from = undefined;
    }
    handleMouseMove(x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x, y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShape(this.tmpShape, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x, y));
            this.shapeManager.addShape(this.tmpShape);
        }
    }
}
export class Line extends AbstractShape {
    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
    }
    draw(ctx, IsMarked) {
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();
        if (IsMarked) {
            ctx.fillStyle = MARKER_COLOR;
            ctx.fillRect(this.from.x - MARKER_SIZE / 2, this.from.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.to.x - MARKER_SIZE / 2, this.to.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
        }
    }
    isMarked(x, y) {
        // calculate th distance from point to point
        const d1 = Math.sqrt(Math.pow(this.from.x - x, 2) + Math.pow(this.from.y - y, 2));
        const d2 = Math.sqrt(Math.pow(this.to.x - x, 2) + Math.pow(this.to.y - y, 2));
        // CAlculate the lenght of the line
        const lineLength = Math.sqrt(Math.pow(this.from.x - this.to.x, 2) + Math.pow(this.from.y - this.to.y, 2));
        const tolerance = 0.1;
        return Math.abs(d1 + d2 - lineLength) < tolerance;
    }
}
export class LineFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Linie";
    }
    createShape(from, to) {
        return new Line(from, to);
    }
    handleMouseClick(x, y, e) {
    }
}
class Circle extends AbstractShape {
    constructor(center, radius) {
        super();
        this.center = center;
        this.radius = radius;
    }
    draw(ctx, IsMarked) {
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        if (IsMarked) {
            ctx.fillStyle = MARKER_COLOR;
            ctx.fillRect(this.center.x - this.radius - MARKER_SIZE / 2, this.center.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.center.x + this.radius - MARKER_SIZE / 2, this.center.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
        }
    }
    isMarked(x, y) {
        const dx = this.center.x - x;
        const dy = this.center.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }
}
export class CircleFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Kreis";
    }
    createShape(from, to) {
        return new Circle(from, CircleFactory.computeRadius(from, to.x, to.y));
    }
    static computeRadius(from, x, y) {
        const xDiff = (from.x - x), yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
    handleMouseClick(x, y, e) {
    }
}
class Rectangle extends AbstractShape {
    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
    }
    draw(ctx, IsMarked) {
        ctx.beginPath();
        ctx.strokeRect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.stroke();
        if (IsMarked) {
            ctx.fillStyle = MARKER_COLOR;
            ctx.fillRect(this.from.x - MARKER_SIZE / 2, this.from.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.to.x - MARKER_SIZE / 2, this.to.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
        }
    }
    isMarked(x, y) {
        return x >= this.from.x && x <= this.to.x &&
            y >= this.from.y && y <= this.to.y;
    }
}
export class RectangleFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Rechteck";
    }
    createShape(from, to) {
        return new Rectangle(from, to);
    }
    handleMouseClick(x, y, e) {
    }
}
class Triangle extends AbstractShape {
    constructor(p1, p2, p3) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
    draw(ctx, IsMarked) {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
        if (IsMarked) {
            ctx.fillStyle = MARKER_COLOR;
            ctx.fillRect(this.p1.x - MARKER_SIZE / 2, this.p1.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.p2.x - MARKER_SIZE / 2, this.p2.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
            ctx.fillRect(this.p3.x - MARKER_SIZE / 2, this.p3.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
        }
    }
    isMarked(x, y) {
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
export class TriangleFactory {
    constructor(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = "Dreieck";
    }
    handleMouseDown(x, y) {
        if (this.tmpShape) {
            this.shapeManager.removeShape(this.tmpShape, false);
            this.shapeManager.addShape(new Triangle(this.from, this.tmpTo, new Point2D(x, y)));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        }
        else {
            this.from = new Point2D(x, y);
        }
    }
    handleMouseUp(x, y) {
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
    handleMouseMove(x, y) {
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
        }
        else { // no second point fixed, update tmp line
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
    handleMouseClick(x, y, e) {
    }
}
export class SelectionFactory {
    constructor(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = "Selektion";
    }
    handleMouseDown(x, y, e) { }
    handleMouseMove(x, y) { }
    handleMouseUp(x, y, e) { }
    handleMouseClick(x, y, e) {
        this.shapeManager.isShapeOnClickedPoint(x, y);
        if (e.ctrlKey) {
            this.shapeManager.markShapes();
        }
        else if (e.altKey) {
            this.shapeManager.iterateShapes();
        }
        else {
            this.shapeManager.markShape();
        }
    }
}
//# sourceMappingURL=Shapes.js.map