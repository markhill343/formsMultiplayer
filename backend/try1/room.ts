// External Libraries
import * as WebSocket from "ws";
import { v4 } from "uuid";

// Custom Modules and Types
import { EventTypes } from "./frontend/static/enums/EventTypes.js";
import { Shape } from "./frontend/static/canvas/types.js";
import { RoomEvent } from "./frontend/static/models/RoomEvent.js";

export class CanvasRoom {
    public id: string;
    private clients: Map<number, WebSocket> = new Map();
    private _shapesInCanvas: Map<string, Shape> = new Map();
    private _selectedShapes: Map<string, number> = new Map();
    private eventsInCanvas: Map<string, RoomEvent> = new Map();

    constructor(public name: string) {
        // Generate a random UUID for the room
        this.id = v4();
    }

    get shapesInCanvas(): Map<string, Shape> {
        return this._shapesInCanvas;
    }

    get selectedShapes(): Map<string, number> {
        return this._selectedShapes;
    }

    addSession(id: number, session: WebSocket) {
        this.clients.set(id, session);
    }

    removeSession(clientId: number) {
        this.clients.delete(clientId);
    }

    addEvent(roomEvent: RoomEvent) {
        const { canvasEvent, clientId } = roomEvent;
        const { shape } = canvasEvent;

        switch (canvasEvent.type) {
            case EventTypes.ShapeAdded:
                this._shapesInCanvas.set(shape.id, shape);
                this.eventsInCanvas.set(shape.id, roomEvent);
                break;

            case EventTypes.ShapeRemoved:
                this._shapesInCanvas.delete(shape.id);
                this.eventsInCanvas.delete(shape.id);
                this._selectedShapes.delete(shape.id);
                break;

            case EventTypes.MovedToBackground:
                // Move the shape to the beginning of the map
                this._shapesInCanvas = new Map([[shape.id, shape], ...this._shapesInCanvas.entries()]);
                this.eventsInCanvas = new Map([[shape.id, roomEvent], ...this.eventsInCanvas.entries()]);
                break;

            case EventTypes.ShapeSelected:
                this._selectedShapes.set(shape.id, clientId);
                break;

            case EventTypes.ShapeUnselected:
                this._selectedShapes.delete(shape.id);
                break;
        }
    }

    getCurrentEvents(): RoomEvent[] {
        return Array.from(this.eventsInCanvas.values());
    }

    getClientsExcept(clientId: number): WebSocket[] {
        return Array.from(this.clients.entries())
            .filter(([id]) => id !== clientId)
            .map(([, websocket]) => websocket);
    }

    getSelectedShapes() {
        return this._selectedShapes;
    }

    updateClientSession(clientId: number, session: WebSocket) {
        if (this.clients.has(clientId)) {
            this.addSession(clientId, session);
        }
    }
}
