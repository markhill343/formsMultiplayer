// main.js
import menuApi from './menuApi.js';

function setupContextMenu(menuApi) {
    const menu = menuApi.createMenu();
    const mItem1 = menuApi.createItem("I 1", (m) => {
        console.log("I 1"); // Imagine we would do something great here
        menu.hide(); // hide the menu , so m === menu
    });
    menu.addItem(mItem1)

    const mItem2 = menuApi.createItem('I 2', () => {
        console.log('I 2');
    });
    const mT1 = menuApi.createSeparator()
    const mItem3 = menuApi.createItem("I 3", (m) => {
        menu.hide();
    });
    menu.addItems(mItem1, mItem2);
    menu.addItem(mT1);
    menu.addItems(mItem3);

    return menu;
}

const menu = setupContextMenu(menuApi);

/*
document.addEventListener('contextmenu', (e) => {
    // do something to find the correct x,y values
    menu.show(e.clientX, e.clientY);
});
*/

document.addEventListener('click', (e) => {
    menu.hide();
});

document.addEventListener ('contextmenu', (e) => {
    e.preventDefault();
    // do something to find the correct x,y values
    // dynamicItem is only removed if clicked
    const dynamicItem = menuApi.createItem ("II 5", (m) => {
        menu.removeItem (dynamicItem);
    });
    // Order after the call : I 1 , I 2 , dynamicItem , Sep , I 3
    menu.addItemAt (dynamicItem , 2);
    menu.show(e.clientX,e.clientY);
    document.addEventListener('click', (e) => {
        if (menu.isVisible()) {
            menu.hide();
        }
    });
    
});

function showCoordinates(event) {
    if (!menu.isVisible()){
        var x = event.offsetX;
        var y = event.offsetY;
        document.getElementById("coordinates").innerHTML = "X: " + x + ", Y: " + y;
    }
}

function add2List(event) {
    if (!menu.isVisible()){
        var x = event.offsetX;
        var y = event.offsetY;
        var list = document.getElementById("coordinateList");
        var item = document.createElement("li");
        item.textContent = "X: " + x + ", Y: " + y;
        list.appendChild(item);
    }
}

window.onload = function() {
    var drawArea = document.getElementById("drawArea");
    drawArea.onmousemove = showCoordinates;
    drawArea.onclick = add2List;
}


/*
Quellen:
https://www.javascripttutorial.net/javascript-dom/javascript-appendchild/
https://www.w3schools.com/jsref/met_node_insertbefore.asp
https://www.w3schools.com/js/js_function_definition.asp
https://www.javascripttutorial.net/javascript-immediately-invoked-function-expression-iife/
https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/
https://www.w3schools.com/jsref/event_oncontextmenu.asp
*/