document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById('canvas2'),
        ctx = canvas.getContext('2d'),
        height = 400,
        width = 400,
        stifness = 0.5,
        b = -1,
        angularB = -7,
        dt = 0.02, // Time step for simulation
        intervalId;

    // Function to reset simulation
    function resetSimulation() {
        initializeSimulation();
        clearInterval(intervalId);
        intervalId = setInterval(loop, dt * 1000);
    }

    // Vector class for 2D
    var V = function (x, y) {
        this.x = x;
        this.y = y;
    };
    V.prototype.add = function (v) {
        return new V(this.x + v.x, this.y + v.y);
    };
    V.prototype.substract = function (v) {
        return new V(this.x - v.x, this.y - v.y);
    };
    V.prototype.scale = function (s) {
        return new V(this.x * s, this.y * s);
    };
    V.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    V.prototype.cross = function (v) {
        return (this.x * v.y - this.y * v.x);
    };
    V.prototype.rotate = function (angle, vector) {
        var x = this.x - vector.x;
        var y = this.y - vector.y;
        var x_prime = vector.x + (x * Math.cos(angle) - y * Math.sin(angle));
        var y_prime = vector.y + (x * Math.sin(angle) + y * Math.cos(angle));
        return new V(x_prime, y_prime);
    };

    // Define Rect class and its methods
    var Rect = function (x, y, w, h, m) {
        this.m = m || 1; // Default mass
        this.width = w;
        this.height = h;

        this.topLeft = new V(x, y);
        this.topRight = new V(x + w, y);
        this.bottomRight = new V(x + w, y + h);
        this.bottomLeft = new V(x, y + h);

        this.v = new V(0, 0);
        this.a = new V(0, 0);
        this.theta = 0;
        this.omega = 0;
        this.alpha = 0;
        this.J = this.m * (this.height * this.height + this.width * this.width) / 12;
    };

    // Center calculation
    Rect.prototype.center = function () {
        var diagonal = this.bottomRight.substract(this.topLeft);
        var midpoint = this.topLeft.add(diagonal.scale(0.5));
        return midpoint;
    };

    // Rotate all corners of the rectangle
    Rect.prototype.rotate = function (angle) {
        this.theta += angle;
        var center = this.center();

        this.topLeft = this.topLeft.rotate(angle, center);
        this.topRight = this.topRight.rotate(angle, center);
        this.bottomRight = this.bottomRight.rotate(angle, center);
        this.bottomLeft = this.bottomLeft.rotate(angle, center);

        return this;
    };

    // Translate all corners
    Rect.prototype.move = function (v) {
        this.topLeft = this.topLeft.add(v);
        this.topRight = this.topRight.add(v);
        this.bottomRight = this.bottomRight.add(v);
        this.bottomLeft = this.bottomLeft.add(v);
    };

    var rect, spring;

    function initializeSimulation() {
        rect = new Rect(200, 0, 100, 50); // Initialize the rectangle with default position and size
        rect.v = new V(0, 2);             // Initialize the velocity
        spring = new V(200, 0);           // Initialize the spring position
    }

    initializeSimulation();

    ctx.strokeStyle = 'black';

    var loop = function () {
        var f = new V(0, 0);
        var torque = 0;

        // Velocity Verlet Integration
        var dr = rect.v.scale(dt).add(rect.a.scale(0.5 * dt * dt));
        rect.move(dr);

        // Add Gravity
        f = f.add(new V(0, rect.m * 9.81));

        // Add Damping
        f = f.add(rect.v.scale(b));

        // Add Spring Force
        var springForce = rect.topLeft.substract(spring).scale(-1 * stifness);
        var r = rect.center().substract(rect.topLeft);
        var rxf = r.cross(springForce);

        torque += -1 * rxf;
        f = f.add(springForce);

        // Update Acceleration and Velocity
        var new_a = f.scale(1 / rect.m);
        var dv = rect.a.add(new_a).scale(0.5 * dt);
        rect.v = rect.v.add(dv);
        rect.a = new_a;

        // Do Rotation
        torque += rect.omega * angularB;
        rect.alpha = torque / rect.J;
        rect.omega += rect.alpha * dt;
        var deltaTheta = rect.omega * dt;
        rect.rotate(deltaTheta);

        draw();
    };

    var draw = function () {
        ctx.clearRect(0, 0, width, height);

        // Draw Rectangle
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(rect.topLeft.x, rect.topLeft.y);
        ctx.lineTo(rect.topRight.x, rect.topRight.y);
        ctx.lineTo(rect.bottomRight.x, rect.bottomRight.y);
        ctx.lineTo(rect.bottomLeft.x, rect.bottomLeft.y);
        ctx.closePath();
        ctx.stroke();

        // Draw Spring
        ctx.strokeStyle = "#cccccc";
        ctx.beginPath();
        ctx.moveTo(spring.x, spring.y);
        ctx.lineTo(rect.topLeft.x, rect.topLeft.y);
        ctx.stroke();
    };

    // Start simulation loop
    intervalId = setInterval(loop, dt * 1000);

    // Reset button functionality
    document.getElementById('resetBtn2').addEventListener('click', resetSimulation);
});
