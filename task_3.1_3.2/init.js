import { CircleFactory, LineFactory, RectangleFactory, TriangleFactory, SelectionFactory } from "./Shapes";
import { ToolArea } from "./ToolArea";
import { Canvas } from "./Canvas";
import { AddShapeEvent, EventStore, RemoveShapeEvent, SelectShapeEvent, UnselectShapeEvent } from "./Events";
export let clientId;
function init() {
    const canvasDomElm = document.getElementById("drawArea");
    const menu = document.getElementsByClassName("tools");
    const events = document.getElementById('events');
    const loadBtn = document.getElementById('loadBtn');
    const clearBtn = document.getElementById('clearBtn');
    // Problem here: Factories needs a way to create new Shapes, so they
    // have to call a method of the canvas.
    // The canvas on the other side wants to call the event methods
    // on the toolbar, because the toolbar knows what tool is currently
    // selected.
    // Anyway, we do not want the two to have references on each other
    let canvas;
    const eventStore = new EventStore('1', events);
    const sm = {
        addShape(s, rd, f) {
            eventStore.storeEvent(new AddShapeEvent(s, rd, f));
            return canvas.addShape(s, rd, f);
        },
        removeShape(s, rd) {
            eventStore.storeEvent(new RemoveShapeEvent(s.id, rd, false));
            return canvas.removeShape(s, rd);
        },
        removeShapeWithId(id, rd, f) {
            eventStore.storeEvent(new RemoveShapeEvent(id, rd, f));
            return canvas.removeShapeWithId(id, rd, f);
        },
        markShapes(id, rd) {
            eventStore.storeEvent(new SelectShapeEvent(id, rd));
            return canvas.markShapes(id, rd);
        },
        markShape(id, rd) {
            eventStore.storeEvent(new SelectShapeEvent(id, rd));
            return canvas.markShape(id, rd);
        },
        isShapeOnClickedPoint(x, y) {
            return canvas.isShapeOnClickedPoint(x, y);
        },
        iterateShapes() {
            return canvas.iterateShapes();
        },
        unMarkShape(shape, id, rd) {
            eventStore.storeEvent(new UnselectShapeEvent(id, rd));
            return canvas.unMarkShape(shape, id, rd);
        },
        getMarkedShapes() {
            return canvas.getMarkedShapes();
        }
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
    eventStore.subscribe(canvas);
    canvas.draw();
    loadBtn.addEventListener('click', () => {
        const canvasEvent = JSON.parse(events.value);
        canvasEvent.eventsCanvas.forEach((event) => {
            eventStore.executeEvent(event);
        });
    });
    clearBtn.addEventListener('click', () => {
        events.value = '';
    });
}
init();
//# sourceMappingURL=init.js.map