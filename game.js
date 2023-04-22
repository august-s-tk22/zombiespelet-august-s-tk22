var zombies = [];
var i = 0;

// Radius = hitbox
var player = {
    x: totalWidth / 2,
    y: totalHeight / 2,
    speed: 15,
    radius: 35,
    width: 32 * 3,
    height: 32 * 3
};
var playerHealth = 100;
var healthBarWidth = 200;
var healthBarHeight = 20;
var healthBarX = (totalWidth - healthBarWidth) / 2;
var healthBarY = 20;

var keys = {};
document.addEventListener("keydown", function(event) {
    keys[event.key] = true;
});
document.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});

function keyDown(key) {
    return keys[key] === true;
}

var medkit = {
    x: 0,
    y: 0,
    size: 100,
    image: "./media/medkit.png",
    active: false,
    respawnTime: 5,
    lastPickedUpRound: -1
};

// Zombies amount
// Radius = hitbox
var i = 0;
while (i < 5) {
    zombies.push({
        x: random(totalWidth),
        y: random(totalHeight),
        speed: random(3, 7),
        radius: 35,
        width: 32 * 3,
        height: 32 * 3
    });

    i++;
}

// Radius = hitbox
// Size of zombie
var zombie = {
    x: random(totalWidth),
    y: random(totalHeight),
    speed: random(1, 5),
    radius: 35,
    width: 32 * 3,
    height: 32 * 3
};

var weapon = {
    x: random(totalWidth),
    y: random(totalHeight),
    active: false
};

var lastUsedTime = 0;

let themeMusic;

var points = 0;

function update() {
    if (!themeMusic) {
        themeMusic = new Audio("./media/zombiesong.mp3");
        themeMusic.loop = true;
        themeMusic.play();
    }

    clearScreen();

    text(10, 40, 25, "Points: " + points, "white")

    // Draw health bar
    rectangle(healthBarX, healthBarY, healthBarWidth, healthBarHeight, "gray");
    var healthBarFillWidth = healthBarWidth * (playerHealth / 100);
    rectangle(healthBarX, healthBarY, healthBarFillWidth, healthBarHeight, "red");

    // Update player position via keyboard
    if (keyDown("w")) {
        player.y -= player.speed;
    }
    if (keyDown("s")) {
        player.y += player.speed;
    }
    if (keyDown("a")) {
        player.x -= player.speed;
    }
    if (keyDown("d")) {
        player.x += player.speed;
    }

    if (distance(player, weapon) <= player.radius + 16) {
        weapon.active = true;
    }

    if (weapon.active) {
        picture(player.x + 80, player.y + 30, "./media/bat.png", 70, 70);
    }

    // Player image
    picture(player.x, player.y, "./media/player.png", player.width, player.height);

    if (!weapon.active) {
        picture(weapon.x, weapon.y, "./media/bat.png", 70, 70);
    }

    // Spawn medkit if it's not active and it's time to respawn
    if (!medkit.active && roundNumber() > medkit.lastPickedUpRound + medkit.respawnTime) {
        medkit.x = random(totalWidth - medkit.size);
        medkit.y = random(totalHeight - medkit.size);
        medkit.active = true;
    }

    // Draw medkit if it's active
    if (medkit.active) {
        picture(medkit.x, medkit.y, medkit.image, medkit.size, medkit.size);

        // Check for collision with player
        if (distance(player, medkit) <= player.radius + medkit.size / 2) {
            medkit.active = false;
            medkit.lastPickedUpRound = roundNumber();
            playerHealth = 100;
        }
    }

    // Update zombie positions
    for (var i = 0; i < zombies.length; i++) {
        var zombie = zombies[i];
        picture(zombie.x, zombie.y, "./media/zombie.png", zombie.width, zombie.height);

        // Update zombie position -> player
        if (zombie.x < player.x)
            zombie.x += zombie.speed;
        else zombie.x -= zombie.speed;
        if (zombie.y < player.y)
            zombie.y += zombie.speed;
        else zombie.y -= zombie.speed;

        // Check for collision with player
        if (playerHealth <= 0) {
            alert("Game Over");
            stopUpdate();
        }
    }
    for (let i = 0; i < zombies.length; i++) {
        zombie = zombies[i];
        if (distance(player, zombie) <= player.radius + zombie.radius) {
            playerHealth -= 3;
        }
    }


    // Check if space key is pressed and weapon is ready to be used
    if (weapon.active && keyDown(" ") && Date.now() - lastUsedTime > 500) {
        // Set last used time to current time
        lastUsedTime = Date.now();

        // Check for collision with zombies
        for (var i = 0; i < zombies.length; i++) {
            var zombie = zombies[i];
            if (distance(player, zombie) <= player.radius + zombie.radius + 120) { // 120 is the radius for killing zombies

                // Remove the zombie from the array
                zombies.splice(i, 1);
                i--;

                // Play the sound effect
                var splatSound = new Audio("./media/splat.mp3");
                splatSound.play();

                // Add 10 points
                points += 10;

                // Display bloodsplat image
                picture(zombie.x, zombie.y, "./media/bloodsplat.png", 120, 120);

                // Get the bloodsplat image element and fade it in
                var bloodsplatImg = document.querySelector("img[src='./media/bloodsplat.png']");
                if (bloodsplatImg) {
                    bloodsplatImg.style.transition = "opacity 1s ease-in-out";
                    bloodsplatImg.style.opacity = 1;

                    playerHealth -= 1;
                }

                if (zombies.length == 0) {
                    // Play the sound effect
                    var waveCompleteSound = new Audio("./media/wavecomplete.mp3");
                    waveCompleteSound.play();

                    // Add 100 points
                    points += 100;

                    // Spawn 5 more zombies
                    for (var i = 0; i < 5; i++) {
                        zombies.push({
                            x: random(totalWidth),
                            y: random(totalHeight),
                            speed: random(3, 7),
                            radius: 35,
                            width: 32 * 3,
                            height: 32 * 3
                        });
                    }
                }
                if (medkit.active) {
                    picture(medkit.x, medkit.y, medkit.image, medkit.size, medkit.size);
                }
            }
        }
    }

}

// Taken from internet
function distance(obj1, obj2) {
    var dx = obj1.x - obj2.x;
    var dy = obj1.y - obj2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

function roundNumber() {
    return Math.floor(points / 10);
}