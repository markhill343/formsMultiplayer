export class ShapeArray {
    constructor(gap = 8) {
        this.gap = gap;
        this.length = 0;
        this.array = [];
        this.lookUp = {};
        this.numOfShapesWithGaps = 0;
    }
    forEach(callback) {
        this.array.forEach((shape, index) => {
            if (shape)
                callback(shape, index);
        });
    }
    getById(id) {
        const index = this.lookUp[id];
        return this.array[index] || undefined;
    }
    moveTo(id, to) {
        const from = this.lookUp[id];
        if (from === to)
            return;
        const shape = this.array[from];
        this.array[from] = null;
        this.shiftShape(to, shape, to > from);
    }
    push(shape) {
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
    removeWithId(id) {
        const index = this.lookUp[id];
        if (index === undefined)
            return;
        if (index === this.length - 1)
            this.length--;
        this.array[index] = null;
        delete this.lookUp[id];
        this.numOfShapesWithGaps--;
        return this;
    }
    removeShapes(shapes) {
        shapes.forEach(shape => this.removeWithId(shape.id));
        return this;
    }
    reshape(callback) {
        if (!callback(this.length, this.numOfShapesWithGaps))
            return;
        this.array = this.array.filter(shape => shape !== null);
        this.length = this.array.length;
        this.numOfShapesWithGaps = this.length;
    }
    shiftShape(idx, shape, shiftLeft) {
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
            this.shiftShape(idx - 1, moveShape, true);
        }
        else {
            shape.order = idx;
            this.array[idx] = shape;
            this.lookUp[shape.id] = idx;
            this.shiftShape(idx + 1, moveShape, false);
        }
    }
}
//# sourceMappingURL=types.js.map