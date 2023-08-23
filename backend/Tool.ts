import { ShapeFactory } from "./types.js";

export class ToolArea {
    private selectedShape: ShapeFactory | undefined;
    private domElms: HTMLElement[] = [];

    constructor(shapesSelector: ShapeFactory[], private menu: HTMLElement) {
        this.initTools(shapesSelector);
    }

    private initTools(shapesSelector: ShapeFactory[]): void {
        shapesSelector.forEach(shape => {
            const domSelElement = document.createElement("li");
            domSelElement.innerText = shape.label;
            domSelElement.addEventListener("click", () => this.selectFactory(shape, domSelElement));
            this.menu.appendChild(domSelElement);
            this.domElms.push(domSelElement);
        });
    }

    private selectFactory(selectedShape: ShapeFactory, selectedElm: HTMLElement): void {
        this.domElms.forEach(domElm => domElm.classList.remove("marked"));
        selectedElm.classList.add("marked");
        this.selectedShape = selectedShape;
    }

    public getSelectedShape(): ShapeFactory | undefined {
        return this.selectedShape;
    }
}
