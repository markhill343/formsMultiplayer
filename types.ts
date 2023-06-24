export interface Shape {
    readonly id: number;
    fillColour: string;
    lineColour: string;
    draw(ctx: CanvasRenderingContext2D, IsMarked: boolean, selectionColor: string);
    isMarked(x: number, y: number ): boolean
}

export interface ShapeManager {
    addShape(shape: Shape);
    removeShape(shape: Shape, redraw: boolean);
    markShape();
    markShapes();
    isShapeOnClickedPoint(x,y);
    iterateShapes();
}

export interface ShapeFactory {
    label: string;
    handleMouseDown(x: number, y: number, e: MouseEvent);
    handleMouseUp(x: number, y: number, e: MouseEvent);
    handleMouseMove(x: number, y: number);
    handleMouseClick(x: number, y:number, e: MouseEvent);
}
