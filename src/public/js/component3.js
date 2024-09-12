document.addEventListener("DOMContentLoaded", function() {
    /*
    The following is not free software. You may use it for educational purposes, but you may not redistribute or use it commercially.
    (C) Burak Kanber 2012
    */

    var canvas, ctx;
    var height = 400, width = 400;
    var stiffness = 0.5, b = -1, angularB = -1, dt = 0.02;
    
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };
    
    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };
    
    var V = function(x, y) {
        this.x = x;
        this.y = y;
    };
    
    V.prototype.length = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    
    V.prototype.add = function(v) {
        return new V(v.x + this.x, v.y + this.y);
    };
    
    V.prototype.subtract = function(v) {
        return new V(this.x - v.x, this.y - v.y);
    };
    
    V.prototype.scale = function(s) {
        return new V(this.x * s, this.y * s);
    };
    
    V.prototype.dot = function(v) {
        return (this.x * v.x + this.y * v.y);
    };
    
    V.prototype.cross = function(v) {
        return (this.x * v.y - this.y * v.x);
    };
    
    V.prototype.toString = function() {
        return '[' + this.x + ',' + this.y + ']';
    };
    
    V.prototype.rotate = function(angle, vector) {
        var x = this.x - vector.x;
        var y = this.y - vector.y;
    
        var x_prime = vector.x + ((x * Math.cos(angle)) - (y * Math.sin(angle)));
        var y_prime = vector.y + ((x * Math.sin(angle)) + (y * Math.cos(angle)));
    
        return new V(x_prime, y_prime);
    };
    
    var Rect = function(x, y, w, h, m) {
        if (typeof(m) === 'undefined') {
            this.m = 1;
        }
    
        this.width = w;
        this.height = h;
    
        this.active = true;
    
        this.topLeft = new V(x, y);
        this.topRight = new V(x + w, y);
        this.bottomRight = new V(x + w, y + h);
        this.bottomLeft = new V(x, y + h);
    
        this.v = new V(0, 0);
        this.a = new V(0, 0);
        this.theta = 0;
        this.omega = 0;
        this.alpha = 0;
        this.J = this.m * (this.height * this.height + this.width * this.width) / 12000;
    };
    
    Rect.prototype.center = function() {
        var diagonal = this.bottomRight.subtract(this.topLeft);
        var midpoint = this.topLeft.add(diagonal.scale(0.5));
        return midpoint;
    };
    
    Rect.prototype.rotate = function(angle) {
        this.theta += angle;
        var center = this.center();
    
        this.topLeft = this.topLeft.rotate(angle, center);
        this.topRight = this.topRight.rotate(angle, center);
        this.bottomRight = this.bottomRight.rotate(angle, center);
        this.bottomLeft = this.bottomLeft.rotate(angle, center);
    
        return this;
    };
    
    Rect.prototype.move = function(v) {
        this.topLeft = this.topLeft.add(v);
        this.topRight = this.topRight.add(v);
        this.bottomRight = this.bottomRight.add(v);
        this.bottomLeft = this.bottomLeft.add(v);
    
        return this;
    };
    
    Rect.prototype.draw = function(ctx) {
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.save();
        ctx.translate(this.topLeft.x, this.topLeft.y);
        ctx.rotate(this.theta);
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.restore();
    };
    
    Rect.prototype.vertex = function(id) {
        if (id == 0) {
            return this.topLeft;
        } else if (id == 1) {
            return this.topRight;
        } else if (id == 2) {
            return this.bottomRight;
        } else if (id == 3) {
            return this.bottomLeft;
        }
    };
    
    function intersect_safe(a, b) {
        var result = new Array();
    
        var as = a.map(function(x) {
            return x.toString();
        });
        var bs = b.map(function(x) {
            return x.toString();
        });
    
        for (var i in as) {
            if (bs.indexOf(as[i]) !== -1) {
                result.push(a[i]);
            }
        }
    
        return result;
    }
    
    satTest = function(a, b) {
        var testVectors = [
            a.topRight.subtract(a.topLeft),
            a.bottomRight.subtract(a.topRight),
            b.topRight.subtract(b.topLeft),
            b.bottomRight.subtract(b.topRight),
        ];
        var ainvolvedVertices = [];
        var binvolvedVertices = [];
    
        /*
        * Look at each test vector (shadows)
        */
        for (var i = 0; i < 4; i++) {
            ainvolvedVertices[i] = []; // Our container for involved vertices
            binvolvedVertices[i] = []; // Our container for involved vertices
            var myProjections = [];
            var foreignProjections = [];
    
            for (var j = 0; j < 4; j++) {
                myProjections.push(testVectors[i].dot(a.vertex(j)));
                foreignProjections.push(testVectors[i].dot(b.vertex(j)));
            }
    
            // Loop through foreignProjections, and test if each point is x < my.min AND x > my.max
            // If it's in the range, add this vertex to a list
            for (var j in foreignProjections) {
                if (foreignProjections[j] > myProjections.min() && foreignProjections[j] < myProjections.max()) {
                    binvolvedVertices[i].push(b.vertex(j));
                }
            }
    
            // Loop through myProjections and test if each point is x > foreign.min and x < foreign.max
            // If it's in the range, add the vertex to the list
            for (var j in myProjections) {
                if (myProjections[j] > foreignProjections.min() && myProjections[j] < foreignProjections.max()) {
                    ainvolvedVertices[i].push(a.vertex(j));
                }
            }
        }
    
        ainvolvedVertices = intersect_safe(intersect_safe(ainvolvedVertices[0], ainvolvedVertices[1]), intersect_safe(ainvolvedVertices[2], ainvolvedVertices[3]));
        binvolvedVertices = intersect_safe(intersect_safe(binvolvedVertices[0], binvolvedVertices[1]), intersect_safe(binvolvedVertices[2], binvolvedVertices[3]));
    
        if (ainvolvedVertices.length === 1 && binvolvedVertices.length === 2) {
            return ainvolvedVertices[0];
        } else if (binvolvedVertices.length === 1 && ainvolvedVertices.length === 2) {
            return binvolvedVertices[0];
        } else if (ainvolvedVertices.length === 1 && binvolvedVertices.length === 1) {
            return ainvolvedVertices[0];
        } else if (ainvolvedVertices.length === 1 && binvolvedVertices.length === 0) {
            return ainvolvedVertices[0];
        } else if (ainvolvedVertices.length === 0 && binvolvedVertices.length === 1) {
            return binvolvedVertices[0];
        } else if (ainvolvedVertices.length === 0 && binvolvedVertices.length === 0) {
            return false;
        } else {
            console.log("Unknown collision profile");
            console.log(ainvolvedVertices);
            console.log(binvolvedVertices);
            clearInterval(timer);
        }
    
        return true;
    }
    
    var rect, wall, timer;

    function initialize() {
        rect = new Rect(200, 0, 100, 50);
        wall = new Rect(125, 200, 100, 50);
        rect.omega = -10;
    }
    
    function loop() {
        var f = new V(0, 0);
        var torque = 0;
    
        /* Start Velocity Verlet by performing the translation */
        var dr = rect.v.scale(dt).add(rect.a.scale(0.5 * dt * dt));
        rect.move(dr.scale(100));
    
        /* Add Gravity */
        f = f.add(new V(0, rect.m * 9.81));
    
        /* Add damping */
        f = f.add(rect.v.scale(b));
    
        /* Handle collision */
        var collision = satTest(rect, wall);
        if (collision) {
            var N = rect.center().subtract(collision);
            N = N.scale(1 / N.length());
            var Vr = rect.v;
            var I = N.scale(-1 * (1 + 0.3) * Vr.dot(N));
            rect.v = I
            rect.omega = -1 * 0.2 * (rect.omega / Math.abs(rect.omega)) * rect.center().subtract(collision).cross(Vr);
        }
    
        /* Finish Velocity Verlet */
        var new_a = f.scale(rect.m);
        var dv = rect.a.add(new_a).scale(0.5 * dt);
        rect.v = rect.v.add(dv);
    
        /* Do rotation; let's just use Euler for contrast */
        torque += rect.omega * angularB; // Angular damping
        rect.alpha = torque / rect.J;
        rect.omega += rect.alpha * dt;
        var deltaTheta = rect.omega * dt;
        rect.rotate(deltaTheta);
    
        draw();
    }
    
    function draw() {
        ctx.clearRect(0, 0, width, height);
        rect.draw(ctx);
        wall.draw(ctx);
    }

    // Initialize components
    initialize();

    // Set up animation loop
    canvas = document.getElementById('canvas3');
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    timer = setInterval(loop, dt * 1000);
    
    // Reset functionality
    document.getElementById('resetBtn3').addEventListener('click', function() {
        clearInterval(timer);
        initialize();
        timer = setInterval(loop, dt * 1000);
    });
});
