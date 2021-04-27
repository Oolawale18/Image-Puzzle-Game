var canvas = document.getElementById('puzzle'),
    context = canvas.getContext('2d'),
    img = new Image();

img.src = 'ImagePuzzleGame.jpg';
img.addEventListener('load', drawTiles, false);

canvas.addEventListener("dragenter", function(e){stopDefaults(e);}, true);
canvas.addEventListener("dragover", function(e){stopDefaults(e);}, true);
canvas.addEventListener("dragexit", function(e){stopDefaults(e);}, true);


function stopDefaults(e){

    e.stopPropagation();
    e.preventDefault();

}

canvas.addEventListener("drop", function (e) {
    stopDefaults(e);

    var newImage = e.dataTransfer.files[0],
        fileReader = new FileReader();

    fileReader.readAsDataURL(newImage);

    fileReader.onload = function (e) {
        console.log(e);
        console.log(e.target);
        img.src = e.target.result;
        img.width = img.height = 480;
        drawTiles();
    };

    return false;

}, true);


var boardSize = document.getElementById('puzzle').width;
var tileCount = document.getElementById('scale').value;

var tileSize = boardSize / tileCount;

var clickLoc = new Object;
clickLoc.x = 0;
clickLoc.y = 0;

var emptyLoc = new Object;
emptyLoc.x = 0;
emptyLoc.y = 0;

var solved = false;

var boardParts = new Object;
setBoard();

document.getElementById('scale').onchange = function() {
  tileCount = this.value;
  tileSize = boardSize / tileCount;
  setBoard();
  drawTiles();
};

document.getElementById('puzzle').onmousemove = function(e) {
  clickLoc.x = Math.floor((e.pageX - this.offsetLeft) / tileSize);
  clickLoc.y = Math.floor((e.pageY - this.offsetTop) / tileSize);
};

document.getElementById('puzzle').onclick = function() {
  if (distance(clickLoc.x, clickLoc.y, emptyLoc.x, emptyLoc.y) == 1) {
    slideTile(emptyLoc, clickLoc);
    drawTiles();
  }
  if (solved) {
    setTimeout(function() {alert("You solved it!");}, 500);
  }
};

function setBoard() {
  boardParts = new Array(tileCount);
  for (var i = 0; i < tileCount; ++i) {
    boardParts[i] = new Array(tileCount);
    for (var j = 0; j < tileCount; ++j) {
      boardParts[i][j] = new Object;
      boardParts[i][j].x = i;
      boardParts[i][j].y = j;
    }
  }
  initTiles();
  initEmpty();
  if (!isSolvable(tileCount, tileCount, emptyLoc.y + 1)) {
    if (emptyLoc.y == 0 && emptyLoc.x <= 1) {
      swapTiles(tileCount - 2, tileCount - 1, tileCount - 1, tileCount - 1);
    } else {
      swapTiles(0, 0, 1, 0);
    }
    initEmpty();
  }
  solved = false;
}

function initTiles() {
  var i = tileCount * tileCount - 1;
  while (i > 0) {
    var j = Math.floor(Math.random() * i);
    var xi = i % tileCount;
    var yi = Math.floor(i / tileCount);
    var xj = j % tileCount;
    var yj = Math.floor(j / tileCount);
    swapTiles(xi, yi, xj, yj);
    --i;
  }

}

function swapTiles(i, j, k, l) {
  var temp = new Object();
  temp = boardParts[i][j];
  boardParts[i][j] = boardParts[k][l];
  boardParts[k][l] = temp;
}

function isSolvable(width, height, emptyRow) {
  if (width % 2 == 1) {
    return (sumInversions() % 2 == 0)
  } else {
    return ((sumInversions() + height - emptyRow) % 2 == 0)
  }
}

function sumInversions() {
  var inversions = 0;
  for (var j = 0; j < tileCount; ++j) {
    for (var i = 0; i < tileCount; ++i) {
      inversions += countInversions(i, j);
    }
  }
  return inversions;
}

function countInversions(i, j) {
  var inversions = 0;
  var tileNum = j * tileCount + i;
  var lastTile = tileCount * tileCount;
  var tileValue = boardParts[i][j].y * tileCount + boardParts[i][j].x;
  for (var q = tileNum + 1; q < lastTile; ++q) {
    var k = q % tileCount;
    var l = Math.floor(q / tileCount);

    var compValue = boardParts[k][l].y * tileCount + boardParts[k][l].x;
    if (tileValue > compValue && tileValue != (lastTile - 1)) {
      ++inversions;
    }
  }
  return inversions;
}

function initEmpty() {
  for (var j = 0; j < tileCount; ++j) {
    for (var i = 0; i < tileCount; ++i) {
      if (boardParts[i][j].x == tileCount - 1 && boardParts[i][j].y == tileCount - 1) {
        emptyLoc.x = i;
        emptyLoc.y = j;
      }
    }
  }
}

function drawTiles() {
  context.clearRect ( 0 , 0 , boardSize , boardSize );
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      var x = boardParts[i][j].x;
      var y = boardParts[i][j].y;
      if(i != emptyLoc.x || j != emptyLoc.y || solved == true) {
        context.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize,
            i * tileSize, j * tileSize, tileSize, tileSize);
      }
    }
  }
}

function distance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function slideTile(toLoc, fromLoc) {
  if (!solved) {
    boardParts[toLoc.x][toLoc.y].x = boardParts[fromLoc.x][fromLoc.y].x;
    boardParts[toLoc.x][toLoc.y].y = boardParts[fromLoc.x][fromLoc.y].y;
    boardParts[fromLoc.x][fromLoc.y].x = tileCount - 1;
    boardParts[fromLoc.x][fromLoc.y].y = tileCount - 1;
    toLoc.x = fromLoc.x;
    toLoc.y = fromLoc.y;
    checkSolved();
  }
}

function checkSolved() {
  var flag = true;
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      if (boardParts[i][j].x != i || boardParts[i][j].y != j) {
        flag = false;
      }
    }
  }
  solved = flag;
}
