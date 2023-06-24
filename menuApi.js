//Immediately-Invoked Function Expression (IIFE) runs as soon as defined
// used for creating a new scope
export var MenuApi = (function() {
    //function for creating a new menus ->
    //div element is for possible styling
    //returns methods for changing the menu and its items
    function createMenu() {
        var items = [];
        var menuElement = document.createElement('ul');
        var helperDiv = document.createElement("div");
        menuElement.className = 'menu'
        menuElement.style.display = 'none';
        console.log('none')

        // append the helper div to menuElement
        menuElement.appendChild(helperDiv);

        document.body.appendChild(menuElement);

        document.body.addEventListener('click', function(e) {
            // if the click event target is not part of the context menu
            if (!menuElement.contains(e.target)) {
                // hide the context menu
                menuElement.style.display = 'none';
                // turn off the background
                background.style.display = 'none';
            }
        });

        //add a element for the background
        var background = document.createElement('div');
        background.className = 'background';
        document.body.appendChild(background);

        return {
            show: function(x, y) {
                console.log('showed menu')
                menuElement.style.left = x + 'px';
                menuElement.style.top = y + 'px';
                menuElement.style.display = 'block';
                //turn on the background
                background.style.display = 'block';
                console.log('block')
                return menuElement
            },
            hide: function() {
                menuElement.style.display = 'none';
                //turn off the background
                background.style.display = 'none';
            },
            addItems: function() {
                for (var i = 0; i < arguments.length; i++) {
                    items.push(arguments[i]);
                    menuElement.appendChild(arguments[i].render());
                }
            },
            addItem: function(item) {
                items.push(item);
                menuElement.appendChild(item.render());
            },
            addItemAt: function(item, index) {
                items.splice(index, 0, item);
                menuElement.insertBefore(item.render(), menuElement.childNodes[index]);
            },
            removeItem: function(item) {
                var index = items.indexOf(item);
                if (index > -1) {
                    items.splice(index, 1);
                    menuElement.removeChild(menuElement.childNodes[index]);
                }
            },
            isVisible: function() {
                return menuElement.style.display === 'block';
            }
        };
    }

    //creates a new menu onClick will be called when the item is called
    function createItem(label, onClick) {
        return {
            render: function() {
                var itemElement = document.createElement('li');
                itemElement.textContent = label;
                itemElement.id = Math.random().toString(36).substring(2,15);
                itemElement.onclick = function() {
                    onClick()
                    console.log('item clicked');
                };
                itemElement.className = 'menu-item'
                return itemElement;
            }
        };
    }

    // for fast creation of a separator
    function createSeparator() {
        return {
            render: function() {
                var separatorElement = document.createElement('hr');
                return separatorElement;
            }
        };
    }

    function createRadioOption(label, optionList, preSelection, canvas, fill) {
        var radioSelectionDiv = document.createElement("div");
        radioSelectionDiv.className = 'menuItem';
        console.log("radio button");

        var radioSelectionLabel = document.createElement("label");
        radioSelectionLabel.textContent = label;

        radioSelectionDiv.appendChild(radioSelectionLabel);

        for (let id in optionList) {

            let radioButton = document.createElement("input");
            radioButton.type = "radio";
            radioButton.name = label;
            radioButton.id = optionList[id];

            if (preSelection === id) {
                radioButton.checked = true;
            }

            let radioButtonLabel = document.createElement("label");
            radioButtonLabel.textContent = optionList[id];

            let divRadioButton = document.createElement("div");

            divRadioButton.addEventListener("click", () => {
                console.log("button pressed!");
                console.log(id);
                let markedShapes = canvas.markedShapes;
                console.log(canvas.markedShapes);
                for (const shapesId in markedShapes) {
                    console.log("in loop");
                    console.log(shapesId);
                    const shape = markedShapes[shapesId];
                    if (fill) {
                        console.log("setting fill colour")
                        shape.setFillColour(id);
                    } else {
                        console.log("setting line color")
                        shape.setLineColour(id);
                    }
                    canvas.addShape(shape);
                }
            });
            divRadioButton.appendChild(radioButton);
            divRadioButton.appendChild(radioButtonLabel);

            radioSelectionDiv.appendChild(divRadioButton);
        }
        return {
            render: function() {
                return radioSelectionDiv;
            }
        };
    }

    //all return methods can be used by the menu
    return {
        createMenu: createMenu,
        createItem: createItem,
        createSeparator: createSeparator,
        createRadioOption: createRadioOption
    };

})();

export default MenuApi;
