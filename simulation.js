document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    // --- Simulation Parameters & UI Binding ---
    const params = {
        potentialHeight: 5.0,
        fractalComplexity: 5,
        packetWidth: 20,
        viewMode: 'wave' // 'wave' or 'potential'
    };

    const ui = {
        potentialHeight: document.getElementById('potentialHeight'),
        potentialHeightValue: document.getElementById('potentialHeightValue'),
        fractalComplexity: document.getElementById('fractalComplexity'),
        fractalComplexityValue: document.getElementById('fractalComplexityValue'),
        packetWidth: document.getElementById('packetWidth'),
        packetWidthValue: document.getElementById('packetWidthValue'),
        toggleViewButton: document.getElementById('toggleViewButton'),
        resetButton: document.getElementById('resetButton'),
    };

    function updateParam(id, value) {
        params[id] = Number(value);
        const fixed = id === 'fractalComplexity' || id === 'packetWidth' ? 0 : 1;
        ui[`${id}Value`].textContent = Number(value).toFixed(fixed);
    }

    Object.keys(params).forEach(key => {
        if (ui[key]) {
            ui[key].value = params[key];
            updateParam(key, params[key]);
        }
    });

    ui.potentialHeight.addEventListener('input', (e) => {
        updateParam('potentialHeight', e.target.value);
        generateFractalPotential(); // Regenerate potential without resetting the wave
    });
    ui.fractalComplexity.addEventListener('input', (e) => {
        updateParam('fractalComplexity', e.target.value);
        setup(false); // Only regenerate potential
    });
    ui.packetWidth.addEventListener('input', (e) => updateParam('packetWidth', e.target.value));
    ui.resetButton.addEventListener('click', () => setup(true));
    ui.toggleViewButton.addEventListener('click', () => {
        params.viewMode = params.viewMode === 'wave' ? 'potential' : 'wave';
        ui.toggleViewButton.textContent = `View: ${params.viewMode === 'wave' ? 'Wavefunction' : 'Potential'}`;
    });

    // --- Simulation Core ---
    const DT = 0.005; // Time step
    const H_BAR = 1; // Planck's constant (normalized)
    const M = 20; // Mass (normalized)
    
    const RESOLUTION = 4;
    let cols, rows;
    let psi_re, psi_im; // Real and imaginary parts of the wavefunction
    let potential;
    let imageData, data;

    function setup(resetWave = true) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / RESOLUTION);
        rows = Math.floor(canvas.height / RESOLUTION);

        if (resetWave) {
            psi_re = new Float32Array(cols * rows).fill(0);
            psi_im = new Float32Array(cols * rows).fill(0);
            initializeWavePacket();
        }
        
        potential = new Float32Array(cols * rows);
        generateFractalPotential();
        
        imageData = ctx.createImageData(cols, rows);
        data = imageData.data;
    }

    /**
     * **FIXED** Robust non-recursive Diamond-Square algorithm.
     * This version correctly handles power-of-two grid sizes and avoids indexing errors.
     */
    function generateFractalPotential() {
        // Find the smallest power of 2 that is larger than the screen dimensions
        let size = 1;
        while (size < Math.max(cols, rows)) {
            size *= 2;
        }

        const fractalGrid = Array(size + 1).fill(0).map(() => Array(size + 1).fill(0));

        // Seed the four corners
        fractalGrid[0][0] = Math.random();
        fractalGrid[size][0] = Math.random();
        fractalGrid[0][size] = Math.random();
        fractalGrid[size][size] = Math.random();

        let step = size;
        let magnitude = 1;
        const roughness = 2.0 + params.fractalComplexity / 4.0; 

        while (step > 1) {
            const half = step / 2;

            // Diamond Step
            for (let y = half; y < size; y += step) {
                for (let x = half; x < size; x += step) {
                    const avg = (
                        fractalGrid[x - half][y - half] +
                        fractalGrid[x + half][y - half] +
                        fractalGrid[x - half][y + half] +
                        fractalGrid[x + half][y + half]
                    ) / 4.0;
                    fractalGrid[x][y] = avg + (Math.random() - 0.5) * magnitude;
                }
            }

            // Square Step
            for (let y = 0; y <= size; y += half) {
                for (let x = (y + half) % step; x <= size; x += step) {
                    const p1 = fractalGrid[(x - half + size) % size][y];
                    const p2 = fractalGrid[(x + half) % size][y];
                    const p3 = fractalGrid[x][(y - half + size) % size];
                    const p4 = fractalGrid[x][(y + half) % size];
                    const avg = (p1 + p2 + p3 + p4) / 4.0;
                    
                    if (fractalGrid[x][y] === 0) {
                        fractalGrid[x][y] = avg + (Math.random() - 0.5) * magnitude;
                    }
                }
            }

            step /= 2;
            magnitude /= roughness;
        }
        
        // Normalize and copy the relevant part of the fractal to the potential grid
        let min = Infinity, max = -Infinity;
        for(let x=0; x<cols; x++) for(let y=0; y<rows; y++) {
            if (fractalGrid[x][y] < min) min = fractalGrid[x][y];
            if (fractalGrid[x][y] > max) max = fractalGrid[x][y];
        }

        for (let i = 0; i < cols * rows; i++) {
            const x = i % cols;
            const y = Math.floor(i / cols);
            const normalized = (max > min) ? (fractalGrid[x][y] - min) / (max - min) : 0;
            potential[i] = normalized * params.potentialHeight;
        }
    }

    function initializeWavePacket() {
        const cx = Math.floor(cols / 2);
        const cy = Math.floor(rows / 2);
        const sig_x = params.packetWidth;
        const sig_y = params.packetWidth;
        const kx = 1.5; // Initial momentum in x
        const ky = 0;   // Initial momentum in y

        let norm = 0;
        for (let i = 0; i < cols * rows; i++) {
            const x = i % cols, y = Math.floor(i / cols);
            const dx = x - cx, dy = y - cy;
            const exp_arg = -((dx * dx) / (2 * sig_x * sig_x) + (dy * dy) / (2 * sig_y * sig_y));
            const real_part = Math.exp(exp_arg) * Math.cos(kx * dx + ky * dy);
            const imag_part = Math.exp(exp_arg) * Math.sin(kx * dx + ky * dy);
            psi_re[i] = real_part;
            psi_im[i] = imag_part;
            norm += real_part * real_part + imag_part * imag_part;
        }

        norm = Math.sqrt(norm);
        if (norm > 0) {
            for (let i = 0; i < cols * rows; i++) {
                psi_re[i] /= norm;
                psi_im[i] /= norm;
            }
        }
    }
    
    function update() {
        const C1 = H_BAR / (2 * M);
        const C2 = 1 / H_BAR;

        // Leapfrog method (numerically stable FDTD)
        // 1. Update imaginary part using real part at time t
        for (let x = 1; x < cols - 1; x++) {
            for (let y = 1; y < rows - 1; y++) {
                const i = y * cols + x;
                const laplacian_re = (psi_re[i + 1] + psi_re[i - 1] + psi_re[i + cols] + psi_re[i - cols] - 4 * psi_re[i]);
                psi_im[i] += DT * (C1 * laplacian_re - C2 * potential[i] * psi_re[i]);
            }
        }

        // 2. Update real part using the new imaginary part at time t+1/2
        for (let x = 1; x < cols - 1; x++) {
            for (let y = 1; y < rows - 1; y++) {
                const i = y * cols + x;
                const laplacian_im = (psi_im[i + 1] + psi_im[i - 1] + psi_im[i + cols] + psi_im[i - cols] - 4 * psi_im[i]);
                psi_re[i] -= DT * (C1 * laplacian_im - C2 * potential[i] * psi_im[i]);
            }
        }
    }

    function draw() {
        for (let i = 0; i < cols * rows; i++) {
            const re = psi_re[i];
            const im = psi_im[i];
            const idx = i * 4;
            
            let r,g,b;

            if(params.viewMode === 'wave') {
                const prob = re * re + im * im;
                const phase = Math.atan2(im, re);

                const hue = (phase + Math.PI) / (2 * Math.PI); // 0 to 1
                const lightness = Math.min(prob * 5000, 1.0); // Amplified for visibility
                
                const rgb = hslToRgb(hue, 1.0, lightness * 0.5);
                r = rgb[0]; g = rgb[1]; b = rgb[2];
            } else { // Potential view
                const p = potential[i] / params.potentialHeight;
                r = g = b = (p > 0) ? p * 255 : 0;
            }

            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        ctx.drawImage(canvas, 0, 0, cols, rows, 0, 0, canvas.width, canvas.height);
    }
    
    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) { r = g = b = l; } 
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [r * 255, g * 255, b * 255];
    }

    function animate() {
        // Run multiple simulation steps per frame for stability
        for (let i=0; i<3; i++) {
            update();
        }
        draw();
        requestAnimationFrame(animate);
    }

    setup(true);
    animate();
});
