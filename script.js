// let context = null
let canvas = document.getElementById('canvas')
let context = canvas.getContext('2d')

let tileWidth = 40
let tileHeight = 40

let mapWidth = 10
let mapHeight = 10

let currentSecond = 0
let frameCount = 0
let framesLastSecond = 0
let lastFrameTime = 0

let keysDown = {
    37: false,
    38: false,
    39: false,
    40: false
}

let gameMap = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 0, 1, 1, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 1, 1, 1, 1, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

let player = new Character()

function Character(){
    this.tileFrom   = [1,1]
    this.tileTo     = [1,1]
    this.timeMoved  = 0
    this.dimensions = [30,30]
    this.position  = [45,45]
    this.delayMove  = 700
}

// Place Character at the destination tile and take two arguments the x,y coordinate of ttile which to place the character
Character.prototype.placeAt = function(x, y){
    // We begin by updating the tileTo & tileFrom properties of the Character
    // Updating them to the target x,y values
    this.tileFrom   = [x,y]
    this.tileTo     = [x,y]
    // We will then calculate the x,y pixel posisiton of the Character
    this.position   = [((tileWidth * x) + 
                        ((tileWidth - this.dimensions[0])/2)),
                        ((tileHeight * y) + 
                        ((tileHeight - this.dimensions[0])/2))
                    ]
}

// Process Movement will take one argument.. the time elapsed in the game "t"
// It will return true or false depending on wheatehr or not it had to do any processeing
// if moving.. return true else return false
Character.prototype.processMovement = function(t){
    // To begin with we check and see if the current tile is different to the destination tile 
    // If the value of the two tile are different we know the character is moving
    // Otherwise we know the character is standing still
    if(this.tileFrom[0] == this.tileTo[0] && 
        this.tileFrom[1] == this.tileTo[1]){
        return false
    }

    //Otherwise if we have determined that the Charater is currently moving then
    // we first check to see if the time elapsed scine the character began their movement
    // is grater than or equal to time it takes the charater to move one tile AKA charDelay 
    if((t - this.timeMoved) >= this.delayMove){
        //If this is true we know the character has had long enough to reach the destination tile
        // Call the placeAt function and hand x,y values
        this.placeAt(this.tileTo[0], this.tileTo[1])

        //Otherwise we are going to need to calculate the current posisiton of the character on the map
    } else {
        // First calculate the current tile for the charater in the same way we do for the placeAt function
        this.position[0] = (this.tileFrom[0] * tileWidth) + ((tileWidth - this.dimensions[0])/2)
        this.position[1] = (this.tileFrom[1] * tileHeight) + ((tileHeight - this.dimensions[1])/2)
        // We then want to modify these positions depening on which direction the character is moving in
        // First we will see if the character is moving horizontally
        if(this.tileTo[0] != this.tileFrom[0]){
            // If true we know the char is moving horz.
            // If so we will calc the difference between current and destination
            let diff = (tileWidth / this.delayMove) * (t - this.timeMoved)
            // Do we need to add or subtract this value from the current x position
            // Then we determine if the char is moving left or right by getting a grater to or less than respose
            // The ternary operator then either subtracts or adds
            this.position[0] += (this.tileTo[0] < this.tileFrom[0] ?
                                  0 - diff : diff )
        }
    // Same thing for the y axis
        if(this.tileTo[1] != this.tileFrom[1]){
            let diff = (tileHeight / this.delayMove) * (t - this.timeMoved)
            this.position[1] += (this.tileTo[1] < this.tileFrom[1] ?
                                  0 - diff : diff )
        }
    // After doing these calculations we will round these values 
        this.position[0] = Math.round(this.position[0])
        this.position[1] = Math.round(this.position[1])
    }
    // If we've got this far we can return true from this function to say that yes processing has happend
    return true
}

// We will add a helper function that will take two arguments x,y on the map
// It will return the corosponding game map array index
function toIndex(x ,y){
    return ((y * mapWidth) + x)
}

window.onload = function() {
    window.requestAnimationFrame(drawGame)
    context.font = "bold 10pt san-serif"

    //Add Event Listerens inside the window.onload function
    //Listen for any key being pressed on the keyboard
    window.addEventListener("keydown", function(e){
        //If one of the keys between 37 and 40 was pressed we know it was one of the arrow keys
        if(e.keyCode >= 37 && e.keyCode <= 40){
            keysDown[e.keyCode] = true;
            console.log(e.keyCode)
        }
    })
    //Same again for keyup to stop the movement
    window.addEventListener("keyup", function(e){
        //If one of the keys between 37 and 40 was pressed we know it was one of the arrow keys
        if(e.keyCode >= 37 && e.keyCode <= 40){
            keysDown[e.keyCode] = false;
        }
    })

}

function drawGame(){
    if(context == null){
        console.log("null")
        return
    }

    // Framerate Calculations
    let currentFrameTime = Date.now()
    let timeElapsed = currentFrameTime - lastFrameTime
    let sec = Math.floor(Date.now()/1000)

    if(sec != currentSecond){
        currentSecond = sec
        framesLastSecond = frameCount
        frameCount = 1;
    } else {
        frameCount ++
    }

    //After the calculations for the framerate
    //We will check and see whether or not the player is processing any movement
    if(!player.processMovement(currentFrameTime)){
        // If the processMovement function returns FALSE we know that
        // the player is NOT processing any movement
        // so we will now check and see if any of the arrow keys are pressed down
        // and also see if the character can move in the corrosponding direction
        // and is the destination tile within map bounds
        // and if the value of the corrosponding gameMap value is 1 or 0
        // 0 being a non-movable tile
        // 1 being a movable tile

        // Up Key
        if(keysDown[38] && player.tileFrom[1] > 0 && 
           gameMap[toIndex(player.tileFrom[0], player.tileFrom[1]-1)] == 1){
               player.tileTo[1] -= 1
        // Down Key
        } else if(keysDown[40] && player.tileFrom[1] < (mapHeight-1) &&
                  gameMap[toIndex(player.tileFrom[0], player.tileFrom[1]+1)] == 1){
                      player.tileTo[1] += 1
        // Left Key
        } else if(keysDown[37] && player.tileFrom[0] > 0 && 
            gameMap[toIndex(player.tileFrom[0]-1, player.tileFrom[1])] == 1){
                player.tileTo[0] -= 1
        // Right Key
        } else if(keysDown[39] && player.tileFrom[0] < (mapWidth-1) &&
                gameMap[toIndex(player.tileFrom[0]+1, player.tileFrom[1])] == 1){
                    player.tileTo[0] += 1
        }

        //Ater checking for arrowkeys being pressed
        //If the tileFrom x value does not match the tileTo x value or y doesnt match
        if(player.tileFrom[0] != player.tileTo[0] || player.tileFrom[1] != player.tileTo[1]){
            //We now know that the char is actually finally moving
            //In which case we update the player.timeMove value to the currentFrameTime value
            // As this is the time at which the movement has begun
            player.timeMoved = currentFrameTime
        }
    }

    // Nested Drawing Loops for drawing Map Tiles
    // Starts at 0,0 top/left of grid and works its way across then down
    for(var y = 0; y < mapHeight; y++){
        for(let x = 0; x < mapWidth; x++){
            //Using a switch statment we choose which tile to draw the color to
            //We find the value of the corisponding gameMap index by y * mapWidth + x
            switch(gameMap[((y*mapWidth)+x)]){
                // If a wall is present we will draw with a dark gray
                case 0: 
                        context.fillStyle = "#999999"
                        break
                // Otherwise we will consider teh tile a path and draw wtih light green
                default:
                        context.fillStyle = "#eeeeee"
            }
            // We will then draw a rectangle at the corisponding position for this tile
            // This is calculated be the x * tileWidth adn the the y * tileHeight
            context.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight) 

        }
    }

    // After our nested drawing loop 
    // Draw Character on the Map
    context.fillStyle = "#0000ff"
    context.fillRect(player.position[0], player.position[1], player.dimensions[0], player.dimensions[1])

    // Draw FPS on the Map
    // Finally we will set FPS Text to red
    context.fillStyle = "#ff0000"
    // Then with this we will draw the current frame rate
    context.fillText("FPS: " + framesLastSecond, 10, 20)

    // Before requesting the next animation frame for the game
    // We update the lastFrameTime global to the current frame time
    lastFrameTime = currentFrameTime

    // We will also tell the window when its ready for us to draw antother animation frame to the canvas that it should call .this function again
    window.requestAnimationFrame(drawGame)
}