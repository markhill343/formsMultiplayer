import { CircleFactory, LineFactory, RectangleFactory, TriangleFactory, SelectionFactory } from "./Shapes.js";
import { ToolArea } from "./ToolArea.js";
import { Canvas } from "./Canvas.js";
function init() {
    const canvasDomElm = document.getElementById("drawArea");
    const menu = document.getElementsByClassName("tools");
    // Problem here: Factories needs a way to create new Shapes, so they
    // have to call a method of the canvas.
    // The canvas on the other side wants to call the event methods
    // on the toolbar, because the toolbar knows what tool is currently
    // selected.
    // Anyway, we do not want the two to have references on each other
    let canvas;
    const sm = {
        addShape(s) {
            return canvas.addShape(s);
        },
        removeShape(s, rd) {
            return canvas.removeShape(s, rd);
        },
        markShapes() {
            return canvas.markShapes();
        },
        markShape() {
            return canvas.markShape();
        },
        isShapeOnClickedPoint(x, y) {
            return canvas.isShapeOnClickedPoint(x, y);
        },
        iterateShapes() {
            return canvas.iterateShapes();
        },
    };
    const shapesSelector = [
        new LineFactory(sm),
        new CircleFactory(sm),
        new RectangleFactory(sm),
        new TriangleFactory(sm),
        new SelectionFactory(sm),
    ];
    const toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea);
    canvas.draw();
}
init();
//# sourceMappingURL=init.js.map