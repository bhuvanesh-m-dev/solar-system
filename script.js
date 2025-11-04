class SolarSystemExplorer {
    constructor() {
        this.currentView = '2D';
        this.setupViews();
        this.init2D();
        this.init3D();
        this.setupEventListeners();
        this.createStars();
        this.resetView();
        this.animate();
    }

    setupViews() {
        this.container3D = document.getElementById('container3D');
        this.canvas2D = document.getElementById('gameCanvas');
        this.canvas3D = document.createElement('canvas');
        this.canvas3D.id = 'threeCanvas';
        this.container3D.appendChild(this.canvas3D);
        
        this.canvas2D.classList.add('active');
    }

    init2D() {
        this.ctx = this.canvas2D.getContext('2d');
        this.setupCanvas2D();

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
    }

    init3D() {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3D, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000011, 1);

        // Orbit controls
        this.controls = new THREE.OrbitControls(this.camera3D, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
        this.scene.add(sunLight);

        // Stars background
        this.create3DStars();

        // Create solar system
        this.create3DSolarSystem();

        // Initial camera position
        this.camera3D.position.set(0, 300, 500);
        this.controls.update();
    }

    create3DStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: true
        });

        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    create3DSolarSystem() {
        // Sun
        const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);

        // Create planets
        this.planetMeshes = {};
        Object.entries(this.planetData).forEach(([key, planet]) => {
            const geometry = new THREE.SphereGeometry(planet.radius / 2, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: planet.color,
                shininess: 30
            });
            
            const planetMesh = new THREE.Mesh(geometry, material);
            
            // Create orbit path
            const orbitGeometry = new THREE.RingGeometry(planet.orbitRadius - 0.5, planet.orbitRadius + 0.5, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.1
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            this.scene.add(orbit);

            // Saturn rings
            if (key === 'saturn') {
                const ringGeometry = new THREE.RingGeometry(planet.radius + 5, planet.radius + 15, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xfad0c4,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                rings.rotation.x = Math.PI / 2;
                planetMesh.add(rings);
            }

            this.planetMeshes[key] = planetMesh;
            this.scene.add(planetMesh);
        });
    }

    setupCanvas2D() {
        this.canvas2D.width = window.innerWidth;
        this.canvas2D.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.canvas2D.width = window.innerWidth;
            this.canvas2D.height = window.innerHeight;
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera3D.aspect = window.innerWidth / window.innerHeight;
            this.camera3D.updateProjectionMatrix();
        });
    }

    setupEventListeners() {
        // View toggle
        document.getElementById('view2D').addEventListener('click', () => this.switchView('2D'));
        document.getElementById('view3D').addEventListener('click', () => this.switchView('3D'));

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

        // Canvas interactions for 2D
        this.setup2DInteractions();
    }

    setup2DInteractions() {
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        this.canvas2D.addEventListener('mousedown', (e) => {
            if (this.currentView !== '2D') return;
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        this.canvas2D.addEventListener('mousemove', (e) => {
            if (this.currentView !== '2D') return;
            if (isDragging && !this.selectedPlanet) {
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                this.camera.x -= deltaX / this.camera.zoom;
                this.camera.y -= deltaY / this.camera.zoom;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            }
        });

        this.canvas2D.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas2D.addEventListener('wheel', (e) => {
            if (this.currentView !== '2D') return;
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.camera.zoom = Math.max(0.1, Math.min(10, this.camera.zoom * zoomFactor));
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update UI
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view${view}`).classList.add('active');
        
        // Show/hide canvases
        this.canvas2D.classList.toggle('active', view === '2D');
        this.canvas3D.classList.toggle('active', view === '3D');
        
        // Show/hide 3D controls info
        document.getElementById('controls3DInfo').style.display = view === '3D' ? 'block' : 'none';
        
        if (view === '3D') {
            this.reset3DView();
        } else {
            this.reset2DView();
        }
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

        // Animate to planet based on current view
        if (this.currentView === '2D') {
            this.animateCameraTo(planetKey);
        } else {
            this.animate3DToPlanet(planetKey);
        }

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
        if (this.isAnimating || this.currentView !== '2D') return;
        
        this.isAnimating = true;
        const planet = this.planetData[planetKey];
        const angle = (this.time / planet.orbitPeriod) * 2 * Math.PI;
        const targetX = Math.cos(angle) * planet.orbitRadius;
        const targetY = Math.sin(angle) * planet.orbitRadius;
        const targetZoom = 3;

        const startX = this.camera.x;
        const startY = this.camera.y;
        const startZoom = this.camera.zoom;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

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

    animate3DToPlanet(planetKey) {
        const planet = this.planetData[planetKey];
        const planetMesh = this.planetMeshes[planetKey];
        
        if (!planetMesh) return;

        // Calculate target position (current position in orbit)
        const angle = (this.time / planet.orbitPeriod) * 2 * Math.PI;
        const targetPosition = new THREE.Vector3(
            Math.cos(angle) * planet.orbitRadius,
            0,
            Math.sin(angle) * planet.orbitRadius
        );

        // Animate camera to look at planet
        const startPosition = this.camera3D.position.clone();
        const targetCameraPosition = targetPosition.clone().multiplyScalar(2);
        targetCameraPosition.y = 50;

        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.camera3D.position.lerpVectors(startPosition, targetCameraPosition, easeProgress);
            this.controls.target.lerpVectors(this.controls.target, targetPosition, easeProgress);
            this.controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    resetView() {
        this.selectedPlanet = null;
        document.querySelectorAll('.planet-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('infoPanel').classList.remove('show');
        document.getElementById('moonPanel').classList.remove('show');

        if (this.currentView === '2D') {
            this.reset2DView();
        } else {
            this.reset3DView();
        }
    }

    reset2DView() {
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

    reset3DView() {
        const startPosition = this.camera3D.position.clone();
        const startTarget = this.controls.target.clone();
        const targetPosition = new THREE.Vector3(0, 300, 500);
        const targetTarget = new THREE.Vector3(0, 0, 0);

        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.camera3D.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.controls.target.lerpVectors(startTarget, targetTarget, easeProgress);
            this.controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
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

        if (this.currentView === '2D') {
            this.animate2D();
        } else {
            this.animate3D();
        }

        requestAnimationFrame(() => this.animate());
    }

    animate2D() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas2D.width, this.canvas2D.height);

        // Apply camera transform
        this.ctx.save();
        this.ctx.translate(
            this.canvas2D.width / 2 - this.camera.x * this.camera.zoom,
            this.canvas2D.height / 2 - this.camera.y * this.camera.zoom
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
        });

        this.ctx.restore();
    }

    animate3D() {
        // Update planet positions in 3D
        Object.entries(this.planetData).forEach(([key, planet]) => {
            const planetMesh = this.planetMeshes[key];
            if (planetMesh) {
                const angle = (this.time / planet.orbitPeriod) * 2 * Math.PI;
                planetMesh.position.x = Math.cos(angle) * planet.orbitRadius;
                planetMesh.position.z = Math.sin(angle) * planet.orbitRadius;
                
                // Rotate planets for visual interest
                planetMesh.rotation.y += 0.01;
            }
        });

        // Update controls
        this.controls.update();

        // Render 3D scene
        this.renderer.render(this.scene, this.camera3D);
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
