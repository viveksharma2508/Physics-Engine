# Link to the blog site
https://physics-engine-r6d80i32e-viveksharma2508s-projects.vercel.app/


## Calculating Velocity and Position
Acceleration, velocity, and position are closely related through calculus. Concretely speaking, velocity is the “rate of change over time” of position – in calculus, this is called the “time derivative” or simply the “derivative” for short. Think of the way we measure velocity: in miles per hour, or meters per second. Velocity is just a measure of distance travelled in a measure of time. Similarly, acceleration is just a measure of velocity changed in a measure of time.
Every method of numerical integration for Newton’s laws involves some manner of maintaining a clock and doing calculations for tiny little snapshots in time. Game engines sometimes have the graphics engine running at 30 fps and the physics engine at 60 fps–in that case, the numerical integration is using a timestep of 1/60 seconds (16 milliseconds).

The simplest way to perform numerical integration is called Euler’s method. Here’s some pseudocode (assume that acceleration, velocity, and position all start at 0). In this example, force, acceleration, velocity, and position are all vectors–so this pseudocode handles 2D and 3D alike.

```
acceleration = force / mass
velocity += acceleration * time_step
position += velocity * time_step

```

Euler’s method is great to build a conceptual understanding from, but it’s not terribly accurate. In many situations, this technique becomes unstable and can yield some unpleasant results. So we’ll go a step further and use what’s called Velocity Verlet integration. Instead of the above, we can do the following:

### Velocity Verlet
```
last_acceleration = acceleration
position += velocity * time_step + ( 0.5 * last_acceleration * time_step^2 )
new_acceleration = force / mass 
avg_acceleration = ( last_acceleration + new_acceleration ) / 2
velocity += avg_acceleration * time_step
```
