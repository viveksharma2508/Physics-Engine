document.addEventListener("DOMContentLoaded", function() {
    var canvas = document.getElementById('canvas1');
    var ctx = canvas.getContext('2d');
    var height = canvas.height;
    var width = canvas.width;
    var x = 200;   // Ball's initial x position
    var y;         // Ball's initial y position (to be set in initialize)
    var vy;        // Ball's initial velocity in y (to be set in initialize)
    var ay;        // Ball's initial acceleration in y (to be set in initialize)
    var m = 0.1;   // Ball mass in Kg
    var r = 10;    // Ball radius in pixels
    var dt = 0.02; // Time step
    var e = -0.5;  // Coefficient of restitution
    var rho = 1.2; // Density of air
    var C_d = 0.47; // Coefficient of drag for a ball
    var A = Math.PI * r * r / 10000; // Frontal area of the ball
    var intervalId; // Variable to store the interval ID

    ctx.fillStyle = 'red';

    function initializeSimulation() {
        // Reset initial conditions
        y = 0;      // Reset y position to the top of the canvas
        vy = 0;     // Reset velocity to 0
        ay = 0;     // Reset acceleration to 0
    }

    function loop() {
        var fy = 0;

        // Weight force
        fy += m * 9.81;

        // Air resistance force
        fy += -0.5 * rho * C_d * A * vy * Math.abs(vy); // Use Math.abs for correct drag direction

        // Verlet integration for the y-direction
        var dy = vy * dt + (0.5 * ay * dt * dt);

        // Scale results assuming 1 cm per pixel
        y += dy * 100;
        var new_ay = fy / m;
        var avg_ay = 0.5 * (new_ay + ay);
        vy += avg_ay * dt;
        ay = new_ay; // Update acceleration for next step

        // Simple collision detection
        if (y + r > height && vy > 0) {
            vy *= e; // Apply restitution coefficient to velocity
            y = height - r; // Set y to be on the ground
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height); // Clear the canvas
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true); // Draw the ball
        ctx.fill();
        ctx.closePath();
    }

    function startSimulation() {
        initializeSimulation(); // Initialize the simulation
        clearInterval(intervalId); // Clear any existing interval
        intervalId = setInterval(function() {
            loop();
            draw();
        }, dt * 1000);
    }

    document.getElementById('resetBtn1').addEventListener('click', function() {
        startSimulation(); // Restart the simulation on reset
    });

    startSimulation(); // Start the simulation when the page loads
});
