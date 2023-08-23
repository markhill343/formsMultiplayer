import { Canvas } from "./Canvas.js";
import {AddShapeEvent, EventStore, RemoveShapeEvent, SelectShapeEvent, UnselectShapeEvent} from "./Events.js";
import {ShapeFactory, ShapeManager} from "./types.js";
import {CircleFactory, LineFactory, RectangleFactory, TriangleFactory} from "./Shapes.js";
import { ToolArea } from "./ToolArea.js";

export let clientId: string;

class DrawArea extends HTMLElement {
    private canvasId: string;
    private webSocket: WebSocket;
    private eventStore: EventStore;
    private menu;
    private canvasDomElm

    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.hasAttribute('id')) {
            console.error('Attribute id is missing!');
            return;
        }
        this.canvasId = this.getAttribute('id');
        this.initDOM();
        this.initCanvasAndTools();
        this.initWebSocket();
    }

    disconnectedCallback() {
        this.closeWebSocket();
    }

    private initDOM() {
        const shadow = this.attachShadow({mode: 'open'});
        const container = document.createElement('div');
        container.setAttribute('class', 'container');
        const description = document.createElement('p');
        description.textContent = 'Wählen Sie auf der linken Seite Ihr Zeichwerkzeug aus. ' +
            'Haben Sie eines ausgewählt, können Sie mit der Maus ' +
            'die entsprechenden Figuren zeichen. Typischerweise, indem' +
            'Sie die Maus drücken, dann mit gedrückter Maustaste die' +
            'Form bestimmen, und dann anschließend die Maustaste loslassen.'
        this.menu = document.createElement('ul');
        this.menu.setAttribute('class', 'tools');
        const canvasContainer = document.createElement('div');
        canvasContainer.setAttribute('id', 'canvasContainer')
        this.canvasDomElm = document.createElement('canvas');
        this.canvasDomElm.setAttribute('id', 'drawArea');
        this.canvasDomElm.setAttribute('class', 'canvasStyle');
        this.canvasDomElm.width = 900;
        this.canvasDomElm.height = 800;
        const backBtn = document.createElement('button');
        backBtn.textContent = 'Back';
        backBtn.addEventListener('click', () => {
            //canvas.clear();
            history.back();
        });
        const style = document.createElement('style');
        style.textContent = `
            .tools {
                width: 100px;
                float: left;
                padding: 5px;
            }
            .tools li {
                padding: 5px;
                list-style: none;
            }
            .tools li:hover {
                color: cornflowerblue;
                cursor: pointer;
            }
            .tools li.marked {
                background-color: cornflowerblue;
                color: white;
            }
            #canvasContainer {
                position: relative;
                float: left;
                width: 902px;
                height: 802px;
            }
            .canvasStyle {
                position: absolute;
                border:1px solid #000000;
                background-color: lightgrey;
            }
            .container button {
                height: 30px;
                padding: 2px 4px 2px 4px;
                color: white;
                background-color: cornflowerblue;
                border: solid 2px cornflowerblue;
                border-radius: 4px;
            }
            .container button:hover{
                background-color: #4c7ace;
                cursor: pointer;
            }
        `;
        shadow.appendChild(style);
        shadow.appendChild(container);
        container.appendChild(backBtn);
        container.appendChild(description);
        container.appendChild(this.menu);
        canvasContainer.appendChild(this.canvasDomElm);
        container.appendChild(canvasContainer);
    }

    private initCanvasAndTools() {
        // Initialize Canvas, EventStore, tools, and shapes for drawing
        let canvas: Canvas;
        this.webSocket = new WebSocket('ws://localhost:8080/channel');
        const ws = this.webSocket;
        this.eventStore = new EventStore(this.canvasId, this.webSocket);

        const sm: ShapeManager = {
            addShape(s, rd, f) {
                this.eventStore.storeEvent(new AddShapeEvent(s,rd,f));
                return this;
            },
            removeShape(s, rd) {
                this.eventStore.storeEvent(new RemoveShapeEvent(s.id,rd,false));
                return this;
            },
            removeShapeWithId(id, rd,f) {
                this.eventStore.storeEvent(new RemoveShapeEvent(id,true,f));
                return this;
            },
            markShape(id, rd) {
                this.eventStore.storeEvent(new SelectShapeEvent(id,rd));
                return this;
            },
            markShapes(id, rd) {
                this.eventStore.storeEvent(new SelectShapeEvent(id,rd));
                return this;
            },
            unMarkShape(cid, id, rd) {
                this.eventStore.storeEvent(new UnselectShapeEvent(id,rd));
                return this;
            },
            /*
            moveToBackg(s, rd) {
                this.eventStore.storeEvent(new RemoveShapeEvent(s.id,rd,true));
                s.order = 0;
                this.eventStore.storeEvent(new AddShapeEvent(s,rd,true));
                return this;
            },
            moveToFront(s, rd) {
                this.eventStore.storeEvent(new RemoveShapeEvent(s.id,rd,true));
                s.order = -1;
                this.eventStore.storeEvent(new AddShapeEvent(s,rd,true));
                return this;
            },

             */
            isShapeOnClickedPoint(x, y) {
                return canvas.isShapeOnClickedPoint(x,y);
            },

            getMarkedShapes() {
                return canvas.getMarkedShapes();
            }


        };

        const shapesSelector: ShapeFactory[] = [
            new LineFactory(sm),
            new CircleFactory(sm),
            new RectangleFactory(sm),
            new TriangleFactory(sm)
        ];

        const toolArea = new ToolArea(shapesSelector, this.menu);
        canvas = new Canvas(this.canvasDomElm, toolArea);
        this.eventStore.subscribe(canvas);
        canvas.draw();
    }

    private initWebSocket() {
        this.webSocket = new WebSocket('ws://localhost:8080/channel');
        this.webSocket.onopen = this.handleWebSocketOpen.bind(this);
        this.webSocket.onmessage = this.handleWebSocketMessage.bind(this);
        this.webSocket.onclose = this.handleWebSocketClose.bind(this);
    }

    private closeWebSocket() {
        if (this.webSocket.readyState === WebSocket.OPEN) {
            const unregisterJson = {
                'command': 'unregisterForCanvas',
                'canvasId': this.canvasId
            };
            this.webSocket.send(JSON.stringify(unregisterJson));
            this.webSocket.close();
        }
    }

    private handleWebSocketOpen() {
        const registerJson = {
            'command': 'registerForCanvas',
            'canvasId': this.canvasId
        };
        this.webSocket.send(JSON.stringify(registerJson));
    }

    private handleWebSocketMessage(event: MessageEvent) {
        const json = JSON.parse(event.data);
        if (json.canvasId && json.eventsCanvas) {
            json.eventsCanvas.forEach((event: any) => {
                this.eventStore.executeEvent(event);
            });
        } else if (json.clientId) {
            clientId = json.clientId;
            console.log(`(Client ${clientId}) Connected to Canvas-${this.canvasId}`);
        }
    }

    private handleWebSocketClose() {
        console.log(`(Client ${clientId}) Disconnected from Canvas-${this.canvasId}.`);
    }
}

customElements.define('draw-area', DrawArea);
