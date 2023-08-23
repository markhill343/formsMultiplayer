import {CanvasEventInterface, CanvasObserverInterface, ShapeEventInterface, Shape} from "./types";

export class CanvasEvent implements CanvasEventInterface {
    canvasId: string;
    eventsCanvas: ShapeEventInterface[];

    constructor(canvasId: string, eventsCanvas: ShapeEventInterface[] = []) {
        this.canvasId = canvasId;
        this.eventsCanvas = eventsCanvas;
    }
}

export class ShapeEvent implements ShapeEventInterface {
    readonly type: string;
    readonly clientId: string | undefined;
    readonly shapeId: string;
    readonly shape: Shape | undefined;
    readonly redraw: boolean;
    readonly Final: boolean;


    constructor(type: string, clientId: string, shapeId: string, shape: Shape, redraw: boolean = true, Final: boolean = false) {
        this.type = type;
        this.clientId = clientId;
        this.shapeId = shapeId;
        this.shape = shape;
        this.redraw = redraw;
        this.Final = Final;
    }
}

export class AddShapeEvent extends ShapeEvent {
    constructor(shape: Shape, redraw: boolean, isFinal: boolean) {
        super('addShape', undefined, shape.id, shape, redraw, isFinal);
    }
}

export class RemoveShapeEvent extends ShapeEvent {
    constructor(id: string, redraw: boolean, Final: boolean) {
        super('removeShape', undefined, id, undefined, redraw, Final);
    }
}

export class SelectShapeEvent extends ShapeEvent {
    constructor(id: string, color: string, redraw: boolean) {
        super('selectShape', color, id, undefined, redraw);
    }
}

export class UnselectShapeEvent extends ShapeEvent {
    constructor(id: string, clientId: string, redraw: boolean) {
        super('unselectShape', clientId, id, undefined, redraw);
    }
}

export class EventStore {
    private observers: CanvasObserverInterface[] = [];
    private readonly canvasEvent: CanvasEventInterface;

    constructor(private canvasId: string, private ws: WebSocket) {
        this.canvasEvent = new CanvasEvent(this.canvasId);
    }

    private notify(event: ShapeEventInterface): void {
        this.observers.forEach((observer) => {
            observer.update(event);
        });
    }

    public subscribe(observer: CanvasObserverInterface) {
        this.observers.push(observer);
    }

    public storeEvent(event: ShapeEventInterface) {
        this.canvasEvent.eventsCanvas.push(event);
        const message = {
            command: 'event',
            ...this.canvasEvent
        };
        this.ws.send(JSON.stringify(message, undefined, 4));
    }

    public executeEvent(event: ShapeEventInterface) {
        this.notify(event);
    }
}