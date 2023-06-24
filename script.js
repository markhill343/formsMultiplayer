function showCoordinates(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    document.getElementById("coordinates").innerHTML = "X: " + x + ", Y: " + y;
}

function add2List(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    var list = document.getElementById("coordinateList");
    var item = document.createElement("li");
    item.textContent = "X: " + x + ", Y: " + y;
    list.appendChild(item);
}

window.onload = function() {
    var drawArea = document.getElementById("drawArea");
    drawArea.onmousemove = showCoordinates;
    drawArea.onclick = add2List;
}
