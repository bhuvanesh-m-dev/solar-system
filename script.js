class SolarSystemExplorer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        // Game state
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.animationSpeed = 1;
        this.selectedPlanet = null;
        this.exploredPlanets = new Set();
        this.isAnimating = false;

        // Time tracking
        this.time = 0;
        this.lastFrameTime = 0;

        // Planet data with realistic orbital periods (in Earth days)
        this.planetData = {
            mercury: {
                name: "Mercury",
                radius: 8,
                orbitRadius: 100,
                orbitPeriod: 88,
                color: "#8c7853",
                distance: "36 million miles",
                diameter: "3,032 miles",
                funFact: "Mercury has no atmosphere and temperatures can swing from 800°F to -300°F!",
                description: "The closest planet to the Sun and the fastest in our solar system!",
                moons: []
            },
            venus: {
                name: "Venus",
                radius: 12,
                orbitRadius: 140,
                orbitPeriod: 225,
                color: "#ffc649",
                distance: "67 million miles",
                diameter: "7,521 miles",
                funFact: "Venus spins backwards! A day on Venus is longer than its year!",
                description: "The hottest planet in our solar system, even hotter than Mercury!",
                moons: []
            },
            earth: {
                name: "Earth",
                radius: 13,
                orbitRadius: 180,
                orbitPeriod: 365,
                color: "#4facfe",
                distance: "93 million miles",
                diameter: "7,918 miles",
                funFact: "Earth is the only planet known to have life and liquid water on its surface!",
                description: "Our beautiful home planet with perfect conditions for life!",
                moons: [
                    {
                        name: "Moon",
                        distance: "238,855 miles",
                        discovered: "Ancient times",
                        fact: "The Moon controls Earth's tides!"
                    }
                ]
            },
            mars: {
                name: "Mars",
                radius: 10,
                orbitRadius: 220,
                orbitPeriod: 687,
                color: "#ff6b6b",
                distance: "142 million miles",
                diameter: "4,212 miles",
                funFact: "Mars has the largest volcano in the solar system - Olympus Mons!",
                description: "The Red Planet, where scientists are looking for signs of ancient life!",
                moons: [
                    {
                        name: "Phobos",
                        distance: "5,826 miles",
                        discovered: "1877",
                        fact: "Phobos orbits Mars 3 times per day!"
                    },
                    {
                        name: "Deimos",
                        distance: "14,573 miles",
                        discovered: "1877",
                        fact: "Deimos is shaped like a potato!"
                    }
                ]
            },
            jupiter: {
                name: "Jupiter",
                radius: 35,
                orbitRadius: 300,
                orbitPeriod: 4333,
                color: "#d2691e",
                distance: "484 million miles",
                diameter: "86,881 miles",
                funFact: "Jupiter is so big that all other planets could fit inside it!",
                description: "The giant protector of our solar system with a famous red spot!",
                moons: [
                    {
                        name: "Io",
                        distance: "262,000 miles",
                        discovered: "1610",
                        fact: "Io has active volcanoes!"
                    },
                    {
                        name: "Europa",
                        distance: "417,000 miles",
                        discovered: "1610",
                        fact: "Europa has an ocean under its ice!"
                    },
                    {
                        name: "Ganymede",
                        distance: "665,000 miles",
                        discovered: "1610",
                        fact: "Ganymede is the largest moon in our solar system!"
                    },
                    {
                        name: "Callisto",
                        distance: "1.17 million miles",
                        discovered: "1610",
                        fact: "Callisto is covered in craters!"
                    }
                ]
            },
            saturn: {
                name: "Saturn",
                radius: 30,
                orbitRadius: 380,
                orbitPeriod: 10759,
                color: "#fad0c4",
                distance: "886 million miles",
                diameter: "72,367 miles",
                funFact: "Saturn's rings are made of ice and rock particles!",
                description: "The beautiful ringed planet that would float in water!",
                moons: [
                    {
                        name: "Titan",
                        distance: "759,000 miles",
                        discovered: "1655",
                        fact: "Titan has lakes of liquid methane!"
                    },
                    {
                        name: "Enceladus",
                        distance: "148,000 miles",
                        discovered: "1789",
                        fact: "Enceladus shoots water geysers into space!"
                    },
                    {
                        name: "Mimas",
                        distance: "115,000 miles",
                        discovered: "1789",
                        fact: "Mimas looks like the Death Star!"
                    }
                ]
            },
            uranus: {
                name: "Uranus",
                radius: 25,
                orbitRadius: 460,
                orbitPeriod: 30687,
                color: "#4dd0e1",
                distance: "1.8 billion miles",
                diameter: "31,518 miles",
                funFact: "Uranus rotates on its side like a rolling ball!",
                description: "The tilted ice giant with faint rings and methane clouds!",
                moons: [
                    {
                        name: "Miranda",
                        distance: "80,000 miles",
                        discovered: "1948",
                        fact: "Miranda has cliffs 12 miles high!"
                    },
                    {
                        name: "Ariel",
                        distance: "118,000 miles",
                        discovered: "1851",
                        fact: "Ariel has the brightest surface!"
                    },
                    {
                        name: "Titania",
                        distance: "271,000 miles",
                        discovered: "1787",
                        fact: "Titania is Uranus's largest moon!"
                    }
                ]
            },
            neptune: {
                name: "Neptune",
                radius: 24,
                orbitRadius: 540,
                orbitPeriod: 60190,
                color: "#1e3c72",
                distance: "2.8 billion miles",
                diameter: "30,775 miles",
                funFact: "Neptune has the strongest winds in the solar system - up to 1,200 mph!",
                description: "The deep blue windy planet at the edge of our solar system!",
                moons: [
                    {
                        name: "Triton",
                        distance: "220,000 miles",
                        discovered: "1846",
                        fact: "Triton orbits backwards!"
                    },
                    {
                        name: "Nereid",
                        distance: "3.4 million miles",
                        discovered: "1949",
                        fact: "Nereid has a very oval orbit!"
                    }
                ]
            }
        };

        this.setupEventListeners();
        this.createStars();
        this.resetView();
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    setupEventListeners() {
        // Planet buttons
        document.querySelectorAll('.planet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planet = e.currentTarget.dataset.planet;
                this.selectPlanet(planet);
            });
        });

        // Speed controls
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.speed-btn.active').classList.remove('active');
                e.currentTarget.classList.add('active');
                this.animationSpeed = parseInt(e.currentTarget.dataset.speed);
            });
        });

        // Home button
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.resetView();
        });

        // Moon controls
        document.getElementById('viewMoonsBtn').addEventListener('click', () => {
            this.showMoons();
        });

        document.getElementById('closeMoonsBtn').addEventListener('click', () => {
            document.getElementById('moonPanel').classList.remove('show');
        });

        // Fun fact controls
        document.getElementById('closeFunFact').addEventListener('click', () => {
            document.getElementById('didYouKnow').classList.remove('show');
        });

        // Badge controls
        document.getElementById('closeBadge').addEventListener('click', () => {
            document.getElementById('badgePopup').classList.remove('show');
        });

        // Canvas interactions
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging && !this.selectedPlanet) {
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                this.camera.x -= deltaX / this.camera.zoom;
                this.camera.y -= deltaY / this.camera.zoom;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.camera.zoom = Math.max(0.1, Math.min(10, this.camera.zoom * zoomFactor));
        });
    }

    createStars() {
        const starsContainer = document.getElementById('starsContainer');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = star.style.height = (Math.random() * 3 + 1) + 'px';
            star.style.animationDelay = Math.random() * 2 + 's';
            starsContainer.appendChild(star);
        }
    }

    selectPlanet(planetKey) {
        this.selectedPlanet = planetKey;
        const planet = this.planetData[planetKey];

        // Update active button
        document.querySelectorAll('.planet-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-planet="${planetKey}"]`).classList.add('active');

        // Animate camera to planet
        this.animateCameraTo(planetKey);

        // Show planet info
        this.showPlanetInfo(planet);

        // Track exploration
        if (!this.exploredPlanets.has(planetKey)) {
            this.exploredPlanets.add(planetKey);
            this.updateProgress();
            this.showFunFact(planet.funFact);
            
            if (this.exploredPlanets.size === 8) {
                this.showBadge("Solar System Master!", "You've explored all 8 planets! You're now a true space explorer!");
            } else if (this.exploredPlanets.size === 4) {
                this.showBadge("Space Explorer!", "You've explored half the solar system!");
            }
        }
    }

    animateCameraTo(planetKey) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const planet = this.planetData[planetKey];
        const angle = (this.time / planet.orbitPeriod) * 2 * Math.PI;
        const targetX = Math.cos(angle) * planet.orbitRadius;
        const targetY = Math.sin(angle) * planet.orbitRadius;
        const targetZoom = 3;

        const startX = this.camera.x;
        const startY = this.camera.y;
        const startZoom = this.camera.zoom;
        const duration = 2000; // 2 seconds
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            this.camera.x = startX + (targetX - startX) * easeProgress;
            this.camera.y = startY + (targetY - startY) * easeProgress;
            this.camera.zoom = startZoom + (targetZoom - startZoom) * easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        animate();
    }

    resetView() {
        this.selectedPlanet = null;
        document.querySelectorAll('.planet-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('infoPanel').classList.remove('show');
        document.getElementById('moonPanel').classList.remove('show');

        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const startX = this.camera.x;
        const startY = this.camera.y;
        const startZoom = this.camera.zoom;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.camera.x = startX + (0 - startX) * easeProgress;
            this.camera.y = startY + (0 - startY) * easeProgress;
            this.camera.zoom = startZoom + (0.6 - startZoom) * easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        animate();
    }

    showPlanetInfo(planet) {
        document.getElementById('planetName').textContent = planet.name;
        document.getElementById('planetDetails').innerHTML = `
            <p><strong>Distance from Sun:</strong> ${planet.distance}</p>
            <p><strong>Size:</strong> ${planet.diameter} across</p>
            <p><strong>Time to orbit Sun:</strong> ${Math.round(planet.orbitPeriod)} Earth days</p>
            <p style="margin-top: 10px; font-style: italic;">${planet.description}</p>
        `;

        const viewMoonsBtn = document.getElementById('viewMoonsBtn');
        if (planet.moons.length > 0) {
            viewMoonsBtn.style.display = 'block';
            viewMoonsBtn.textContent = `View ${planet.moons.length} Moon${planet.moons.length > 1 ? 's' : ''}`;
        } else {
            viewMoonsBtn.style.display = 'none';
        }

        document.getElementById('infoPanel').classList.add('show');
    }

    showMoons() {
        if (!this.selectedPlanet) return;
        
        const planet = this.planetData[this.selectedPlanet];
        const moonsList = document.getElementById('moonsList');
        moonsList.innerHTML = planet.moons.map(moon => `
            <div class="moon-item">
                <h4>${moon.name}</h4>
                <p><strong>Distance:</strong> ${moon.distance}</p>
                <p><strong>Discovered:</strong> ${moon.discovered}</p>
                <p><em>${moon.fact}</em></p>
            </div>
        `).join('');

        document.getElementById('moonPanel').classList.add('show');
    }

    showFunFact(fact) {
        document.getElementById('funFactText').textContent = fact;
        document.getElementById('didYouKnow').classList.add('show');
        setTimeout(() => {
            document.getElementById('didYouKnow').classList.remove('show');
        }, 5000);
    }

    showBadge(title, text) {
        document.getElementById('badgePopup').querySelector('h2').textContent = title;
        document.getElementById('badgeText').textContent = text;
        document.getElementById('badgePopup').classList.add('show');
    }

    updateProgress() {
        const progress = (this.exploredPlanets.size / 8) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${this.exploredPlanets.size} / 8 planets explored`;
    }

    animate() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Update time based on animation speed
        this.time += (deltaTime / 1000) * this.animationSpeed;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera transform
        this.ctx.save();
        this.ctx.translate(
            this.canvas.width / 2 - this.camera.x * this.camera.zoom,
            this.canvas.height / 2 - this.camera.y * this.camera.zoom
        );
        this.ctx.scale(this.camera.zoom, this.camera.zoom);

        // Draw sun
        const sunGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
        sunGradient.addColorStop(0, '#ffff00');
        sunGradient.addColorStop(0.3, '#ffa500');
        sunGradient.addColorStop(1, '#ff6600');
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 40, 0, 2 * Math.PI);
        this.ctx.fill();

        // Draw sun corona
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 60, 0, 2 * Math.PI);
        this.ctx.fill();

        // Draw planets and orbits
        Object.entries(this.planetData).forEach(([key, planet]) => {
            // Draw orbit
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, planet.orbitRadius, 0, 2 * Math.PI);
            this.ctx.stroke();

            // Calculate planet position
            const angle = (this.time / planet.orbitPeriod) * 2 * Math.PI;
            const x = Math.cos(angle) * planet.orbitRadius;
            const y = Math.sin(angle) * planet.orbitRadius;

            // Draw planet
            const planetGradient = this.ctx.createRadialGradient(
                x - planet.radius/3, y - planet.radius/3, 0,
                x, y, planet.radius
            );
            planetGradient.addColorStop(0, this.lightenColor(planet.color, 40));
            planetGradient.addColorStop(1, planet.color);
            this.ctx.fillStyle = planetGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, planet.radius, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw planet name if zoomed in
            if (this.camera.zoom > 2) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '14px Comic Neue';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(planet.name, x, y + planet.radius + 20);
            }

            // Draw Saturn's rings
            if (key === 'saturn') {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, planet.radius + 8, planet.radius + 3, 0, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, planet.radius + 12, planet.radius + 5, 0, 0, 2 * Math.PI);
                this.ctx.stroke();
            }

            // Draw moons if planet is selected and camera is close
            if (this.selectedPlanet === key && this.camera.zoom > 2) {
                planet.moons.forEach((moon, index) => {
                    const moonAngle = (this.time * 2 + index * Math.PI / 2) % (2 * Math.PI);
                    const moonDistance = 30 + index * 10;
                    const moonX = x + Math.cos(moonAngle) * moonDistance;
                    const moonY = y + Math.sin(moonAngle) * moonDistance;

                    this.ctx.fillStyle = '#cccccc';
                    this.ctx.beginPath();
                    this.ctx.arc(moonX, moonY, 3, 0, 2 * Math.PI);
                    this.ctx.fill();

                    // Draw moon orbit
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, moonDistance, 0, 2 * Math.PI);
                    this.ctx.stroke();
                });
            }
        });

        this.ctx.restore();
        requestAnimationFrame(() => this.animate());
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

// Initialize the application when the page loads
window.addEventListener('load', () => {
    new SolarSystemExplorer();
});
