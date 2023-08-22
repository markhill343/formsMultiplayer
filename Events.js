import { clientId } from "./init.js";
export class CanvasEvent {
    constructor(canvasId, eventsCanvas = []) {
        this.canvasId = canvasId;
        this.eventsCanvas = eventsCanvas;
    }
}
export class ShapeEvent {
    constructor(type, clientId, shapeId, shape, redraw = true, Final = false) {
        this.type = type;
        this.clientId = clientId;
        this.shapeId = shapeId;
        this.shape = shape;
        this.redraw = redraw;
        this.Final = Final;
    }
}
export class AddShapeEvent extends ShapeEvent {
    constructor(shape, redraw, isFinal) {
        super('addShape', undefined, shape.id, shape, redraw, isFinal);
    }
}
export class RemoveShapeEvent extends ShapeEvent {
    constructor(id, redraw, Final) {
        super('removeShape', undefined, id, undefined, redraw, Final);
    }
}
export class SelectShapeEvent extends ShapeEvent {
    constructor(id, redraw) {
        super('selectShape', clientId, id, undefined, redraw);
    }
}
export class UnselectShapeEvent extends ShapeEvent {
    constructor(id, redraw) {
        super('unselectShape', clientId, id, undefined, redraw);
    }
}
export class EventStore {
    constructor(canvasId, textArea) {
        this.canvasId = canvasId;
        this.textArea = textArea;
        this.observers = [];
        this.canvasEvent = new CanvasEvent(this.canvasId);
    }
    notify(event) {
        this.observers.forEach((observer) => {
            observer.update(event);
        });
    }
    subscribe(observer) {
        this.observers.push(observer);
    }
    storeEvent(event) {
        this.canvasEvent.eventsCanvas.push(event);
        this.textArea.value = JSON.stringify(this.canvasEvent, undefined, 4);
    }
    executeEvent(event) {
        this.notify(event);
    }
}
//# sourceMappingURL=events.js.map