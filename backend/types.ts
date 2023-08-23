export interface Shape {
    readonly id: number;
    readonly type: string;
    fillColour: string;
    lineColour: string;
    draw(ctx: CanvasRenderingContext2D, IsMarked: boolean, selectionColor: string);
    isMarked(x: number, y: number ): boolean;
    setFillColour(colour: string);
    setLineColour(colour: string);
    order: number;
}

export interface ShapeManager {
    addShape(shape: Shape, redraw?: boolean, Final?: boolean, index?: number);
    removeShape(shape: Shape, redraw: boolean);
    removeShapeWithId(id?: number, redraw?: boolean, Final?: boolean);
    markShape(id?: number, redraw?: boolean);
    markShapes(id?: number, redraw?: boolean);
    unMarkShape(shape: Shape, id?: number, redraw?: boolean);
    isShapeOnClickedPoint(x,y);
    iterateShapes?();
    getMarkedShapes(): Shape[];
}

export interface ShapeFactory {
    label: string;
    handleMouseDown(x: number, y: number, e: MouseEvent);
    handleMouseUp(x: number, y: number, e: MouseEvent);
    handleMouseMove(x: number, y: number);
    handleMouseClick(x: number, y:number, e: MouseEvent);
}

export interface CanvasObserverInterface {
    update(event: ShapeEventInterface);
}

export interface CanvasEventInterface {
    canvasId: string;
    eventsCanvas: ShapeEventInterface[];
}

export interface ShapeEventInterface {
    readonly type: string;
    readonly clientId?: string;
    readonly shapeId?: number;
    readonly shape?: Shape;
    readonly redraw?: boolean;
    readonly Final?: boolean;
}

export class ShapeArray {
    public length: number = 0;
    private array: (Shape | null)[] = [];
    private lookUp: { [id: number]: number } = {}
    private numOfShapesWithGaps: number = 0;

    constructor(private readonly gap: number = 8) {
    }

    public forEach(callback: (shape: Shape, index: number) => void): void {
        this.array.forEach((shape, index) => {
            if (shape) callback(shape, index);
        });
    }

    public getById(id: number): Shape | undefined {
        const index = this.lookUp[id];
        return this.array[index] || undefined;
    }

    public moveTo(id: number, to: number): void {
        const from = this.lookUp[id];
        if (from === to) return;

        const shape = this.array[from];
        this.array[from] = null;
        this.shiftShape(to, shape!, to > from);
    }

    public push(shape: Shape): number {
        if (this.length !== 0 && this.length % this.gap === 0) {
            this.array.push(null);
            this.length++;
            this.numOfShapesWithGaps++;
        }
        shape.order = this.length;
        this.array.push(shape);
        this.lookUp[shape.id] = this.length;
        this.length++;
        this.numOfShapesWithGaps++;

        return this.length - 1;
    }

    public removeWithId(id: number): this | undefined {
        const index = this.lookUp[id];
        if (index === undefined) return;

        if (index === this.length - 1) this.length--;
        this.array[index] = null;
        delete this.lookUp[id];
        this.numOfShapesWithGaps--;

        return this;
    }

    public removeShapes(shapes: Shape[]): this {
        shapes.forEach(shape => this.removeWithId(shape.id));
        return this;
    }

    public reshape(callback: (arrayLen: number, numOfShapes: number) => boolean): void {
        if (!callback(this.length, this.numOfShapesWithGaps)) return;

        this.array = this.array.filter(shape => shape !== null);
        this.length = this.array.length;
        this.numOfShapesWithGaps = this.length;
    }

    private shiftShape(idx: number, shape: Shape, shiftLeft: boolean): void {
        if (!this.array[idx]) {
            shape.order = idx;
            this.array[idx] = shape;
            this.lookUp[shape.id] = idx;
            return;
        }

        const moveShape = this.array[idx];
        if (shiftLeft) {
            shape.order = idx;
            this.array[idx] = shape;
            this.lookUp[shape.id] = idx;
            this.shiftShape(idx - 1, moveShape!, true);
        } else {
            shape.order = idx;
            this.array[idx] = shape;
            this.lookUp[shape.id] = idx;
            this.shiftShape(idx + 1, moveShape!, false);
        }
    }
}