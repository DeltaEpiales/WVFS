2D Schrödinger Equation Simulation in a Fractal Potential
This project is a scientifically grounded, interactive simulation of a quantum particle's wavefunction evolving according to the 2D time-dependent Schrödinger equation. It uses the Finite-Difference Time-Domain (FDTD) numerical method to model the wavefunction's behavior within a procedurally generated fractal potential energy landscape.

The Scientific Model
This simulation steps beyond metaphor to model the fundamental equation of quantum mechanics for a single, non-relativistic particle.

The Wavefunction (Ψ): The state of the particle is described by a complex-valued wavefunction, Ψ(x,y,t), which has both a magnitude and a phase. What we can observe is the probability density, ∣Ψ∣ 
2
 , which gives the probability of finding the particle at a given point in space. In this simulation:

Brightness of a pixel corresponds to the probability density.

Hue (color) of a pixel corresponds to the phase of the wavefunction.

The Time-Dependent Schrödinger Equation: The simulation numerically solves the foundational equation:
iℏ 
∂t
∂
​
 Ψ= 
H
^
 Ψ=[− 
2m
ℏ 
2
 
​
 ∇ 
2
 +V(x,y)]Ψ
This is achieved using the Finite-Difference Time-Domain (FDTD) method, which discretizes space and time to iteratively calculate the wavefunction's evolution.

The Fractal Potential (V(x,y)): The environment is defined by a potential energy field, V(x,y). We use a procedurally generated fractal to create a complex landscape.

Low Potential Regions (darker in potential view): Act as channels or "quantum wells" where the particle can exist and travel freely.

High Potential Regions (brighter in potential view): Act as barriers that the wavefunction will tunnel through or reflect off of.

The simulation demonstrates core quantum phenomena like superposition, interference, quantum tunneling, and the wave-particle duality in a dynamic and visually intuitive way.

How to Run
Save the index.html and simulation.js files in the same directory.

Open the index.html file in any modern web browser.

The simulation will initialize and run automatically.

Controls & Parameters
Potential Barrier Height: Controls the energy height of the fractal barriers. Higher values will increase reflection and make it harder for the particle to tunnel.

Fractal Complexity: Adjusts the detail of the potential energy landscape. More complex fractals create more intricate quantum behavior.

Initial Wave Packet Width: Sets the initial size of the particle's wavefunction. A narrower packet has a wider spread of initial momenta.

View Mode: Toggles the visualization between the Wavefunction (probability and phase) and the Potential Field (the fractal energy landscape).

Restart Simulation: Re-initializes the wavefunction and generates a new fractal potential.

Technology Stack
HTML5 Canvas: For rendering the 2D visualization.

JavaScript (ES6+): Implements the FDTD algorithm for the Schrödinger equation, fractal generation, and UI.

No external libraries are required.