class SolarSystem3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.animationSpeed = 1;
        this.time = 0;
        this.currentPlanet = null;
        
        this.planetData = {};
        this.planetMeshes = {};
        this.asteroidBelt = null;
        this.kuiperBelt = null;
        this.oortCloud = null;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
        this.camera.position.set(0, 500, 1000);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.getElementById('container3D').appendChild(this.renderer.domElement);

        // Orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50000;

        // Lighting
        this.setupLighting();
        
        // Create solar system components
        this.createStars();
        this.createSun();
        this.createPlanets();
        this.createAsteroidBelt();
        this.createKuiperBelt();
        this.createOortCloud();
        this.createOrbitPaths();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        // Sun light (point light at center)
        this.sunLight = new THREE.PointLight(0xffffff, 2, 100000);
        this.scene.add(this.sunLight);

        // Directional light from sun
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);
    }

    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: true
        });

        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 100000;
            const y = (Math.random() - 0.5) * 100000;
            const z = (Math.random() - 0.5) * 100000;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    createSun() {
        const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.8
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);

        // Sun glow effect
        const glowGeometry = new THREE.SphereGeometry(25, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.3
        });
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(sunGlow);
    }

    createPlanets() {
        // Planet data with realistic relative sizes and distances
        this.planetData = {
            sun: {
                name: "Sun",
                radius: 20,
                color: 0xffff00,
                funFact: "The Sun contains 99.86% of all the mass in our solar system!",
                description: "Our magnificent star at the center of the solar system, providing light and energy to all planets.",
                detailsUrl: "sun/index.html"
            },
            mercury: {
                name: "Mercury",
                radius: 3,
                orbitRadius: 100,
                orbitPeriod: 88,
                color: 0x8c7853,
                tilt: 0.034,
                rotationPeriod: 58.6,
                funFact: "Mercury has no atmosphere and temperatures swing from 800°F to -290°F!",
                description: "The closest planet to the Sun and the fastest in our solar system!",
                detailsUrl: "mercury/index.html",
                moons: 0
            },
            venus: {
                name: "Venus",
                radius: 7,
                orbitRadius: 150,
                orbitPeriod: 225,
                color: 0xffc649,
                tilt: 177.4,
                rotationPeriod: -243,
                funFact: "Venus spins backwards! A day on Venus is longer than its year!",
                description: "The hottest planet with a thick toxic atmosphere and volcanic landscape.",
                detailsUrl: "venus/index.html",
                moons: 0
            },
            earth: {
                name: "Earth",
                radius: 7.5,
                orbitRadius: 200,
                orbitPeriod: 365,
                color: 0x4facfe,
                tilt: 23.44,
                rotationPeriod: 1,
                funFact: "Earth is the only planet known to have liquid water and support life!",
                description: "Our beautiful home planet with perfect conditions for life as we know it.",
                detailsUrl: "earth/index.html",
                moons: [
                    { name: "Moon", distance: "384,400 km", fact: "Controls Earth's tides" }
                ]
            },
            mars: {
                name: "Mars",
                radius: 4,
                orbitRadius: 250,
                orbitPeriod: 687,
                color: 0xff6b6b,
                tilt: 25.19,
                rotationPeriod: 1.03,
                funFact: "Mars has the largest volcano in the solar system - Olympus Mons!",
                description: "The Red Planet where scientists search for signs of ancient life.",
                detailsUrl: "mars/index.html",
                moons: [
                    { name: "Phobos", distance: "9,377 km", fact: "Orbits Mars 3 times per day" },
                    { name: "Deimos", distance: "23,460 km", fact: "Shaped like a potato" }
                ]
            },
            jupiter: {
                name: "Jupiter",
                radius: 40,
                orbitRadius: 400,
                orbitPeriod: 4333,
                color: 0xd2691e,
                tilt: 3.13,
                rotationPeriod: 0.41,
                funFact: "Jupiter is so big that all other planets could fit inside it!",
                description: "The giant gas planet with a famous Great Red Spot storm.",
                detailsUrl: "jupiter/index.html",
                moons: [
                    { name: "Io", distance: "421,800 km", fact: "Most volcanic object in solar system" },
                    { name: "Europa", distance: "671,100 km", fact: "Has subsurface ocean" },
                    { name: "Ganymede", distance: "1,070,400 km", fact: "Largest moon in solar system" }
                ]
            },
            saturn: {
                name: "Saturn",
                radius: 35,
                orbitRadius: 600,
                orbitPeriod: 10759,
                color: 0xfad0c4,
                tilt: 26.73,
                rotationPeriod: 0.45,
                funFact: "Saturn would float in water - it's less dense than water!",
                description: "The beautiful ringed planet with spectacular icy rings.",
                detailsUrl: "saturn/index.html",
                rings: true,
                moons: [
                    { name: "Titan", distance: "1,221,870 km", fact: "Has liquid methane lakes" },
                    { name: "Enceladus", distance: "238,040 km", fact: "Shoots water geysers into space" }
                ]
            },
            uranus: {
                name: "Uranus",
                radius: 25,
                orbitRadius: 800,
                orbitPeriod: 30687,
                color: 0x4dd0e1,
                tilt: 97.77,
                rotationPeriod: -0.72,
                funFact: "Uranus rotates on its side like a rolling ball!",
                description: "The tilted ice giant with faint rings and methane atmosphere.",
                detailsUrl: "uranus/index.html",
                moons: [
                    { name: "Titania", distance: "435,910 km", fact: "Largest moon of Uranus" },
                    { name: "Miranda", distance: "129,900 km", fact: "Has giant ice cliffs" }
                ]
            },
            neptune: {
                name: "Neptune",
                radius: 24,
                orbitRadius: 1000,
                orbitPeriod: 60190,
                color: 0x1e3c72,
                tilt: 28.32,
                rotationPeriod: 0.67,
                funFact: "Neptune has the strongest winds in the solar system - up to 1,200 mph!",
                description: "The deep blue windy planet at the edge of our solar system.",
                detailsUrl: "neptune/index.html",
                moons: [
                    { name: "Triton", distance: "354,760 km", fact: "Orbits backwards around Neptune" }
                ]
            },
            asteroidBelt: {
                name: "Asteroid Belt",
                radius: 315,
                color: 0x888888,
                funFact: "The asteroid belt contains millions of asteroids, but they're very far apart!",
                description: "A region between Mars and Jupiter filled with rocky debris from the solar system's formation.",
                detailsUrl: "asteroid-belt/index.html"
            },
            kuiperBelt: {
                name: "Kuiper Belt",
                radius: 1500,
                color: 0x4466aa,
                funFact: "Pluto is the largest known object in the Kuiper Belt!",
                description: "A vast region beyond Neptune containing icy bodies and dwarf planets.",
                detailsUrl: "kuiper-belt/index.html"
            },
            oortCloud: {
                name: "Oort Cloud",
                radius: 3500,
                color: 0x6644aa,
                funFact: "The Oort Cloud may contain trillions of icy objects!",
                description: "A spherical shell of icy bodies surrounding our solar system nearly a light-year away.",
                detailsUrl: "oort-cloud/index.html"
            }
        };

        // Create planets
        Object.entries(this.planetData).forEach(([key, planet]) => {
            if (key === 'sun' || key === 'asteroidBelt' || key === 'kuiperBelt' || key === 'oortCloud') return;
            
            const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: planet.color,
                shininess: 30,
                specular: 0x222222
            });
            
            const planetMesh = new THREE.Mesh(geometry, material);
            
            // Set axial tilt
            planetMesh.rotation.z = planet.tilt * Math.PI / 180;
            
            this.planetMeshes[key] = planetMesh;
            this.scene.add(planetMesh);

            // Create Saturn's rings
            if (planet.rings) {
                const ringGeometry = new THREE.RingGeometry(planet.radius + 10, planet.radius + 25, 64);
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
        });
    }

    createAsteroidBelt() {
        const asteroidCount = 2000;
        const innerRadius = 280;
        const outerRadius = 350;
        
        const asteroidGeometry = new THREE.BufferGeometry();
        const asteroidMaterial = new THREE.PointsMaterial({
            color: 0x888888,
            size: 1,
            sizeAttenuation: true
        });

        const positions = [];
        for (let i = 0; i < asteroidCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
            const height = (Math.random() - 0.5) * 20;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = height;
            
            positions.push(x, y, z);
        }

        asteroidGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
        this.scene.add(this.asteroidBelt);
    }

    createKuiperBelt() {
        const kuiperCount = 3000;
        const innerRadius = 1200;
        const outerRadius = 1800;
        
        const kuiperGeometry = new THREE.BufferGeometry();
        const kuiperMaterial = new THREE.PointsMaterial({
            color: 0x4466aa,
            size: 1.5,
            sizeAttenuation: true
        });

        const positions = [];
        for (let i = 0; i < kuiperCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
            const height = (Math.random() - 0.5) * 50;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = height;
            
            positions.push(x, y, z);
        }

        kuiperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
        this.scene.add(this.kuiperBelt);
    }

    createOortCloud() {
        const oortCount = 5000;
        const innerRadius = 2000;
        const outerRadius = 5000;
        
        const oortGeometry = new THREE.BufferGeometry();
        const oortMaterial = new THREE.PointsMaterial({
            color: 0x6644aa,
            size: 1,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.6
        });

        const positions = [];
        for (let i = 0; i < oortCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions.push(x, y, z);
        }

        oortGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.oortCloud = new THREE.Points(oortGeometry, oortMaterial);
        this.scene.add(this.oortCloud);
    }

    createOrbitPaths() {
        Object.entries(this.planetData).forEach(([key, planet]) => {
            if (planet.orbitRadius) {
                const orbitGeometry = new THREE.RingGeometry(planet.orbitRadius - 0.5, planet.orbitRadius + 0.5, 128);
                const orbitMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.1
                });
                const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
                orbit.rotation.x = Math.PI / 2;
                this.scene.add(orbit);
            }
        });
    }

    setupEventListeners() {
        // Planet buttons
        document.querySelectorAll('.planet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planet = e.currentTarget.dataset.planet;
                this.selectPlanet(planet);
                
                // Update active button
                document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Speed controls
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.animationSpeed = parseInt(e.target.dataset.speed);
                
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // View details button
        document.getElementById('viewDetailsBtn').addEventListener('click', () => {
            if (this.currentPlanet) {
                const planet = this.planetData[this.currentPlanet];
                if (planet.detailsUrl) {
                    window.open(planet.detailsUrl, '_blank');
                }
            }
        });

        // View moons button
        document.getElementById('viewMoonsBtn').addEventListener('click', () => {
            if (this.currentPlanet) {
                const planet = this.planetData[this.currentPlanet];
                if (planet.moons && planet.moons.length > 0) {
                    this.showMoonsInfo(planet);
                }
            }
        });

        // Close fact popup
        document.getElementById('closeFact').addEventListener('click', () => {
            document.getElementById('factPopup').classList.remove('show');
        });
    }

    selectPlanet(planetKey) {
        this.currentPlanet = planetKey;
        const planet = this.planetData[planetKey];

        // Show fact popup
        this.showFactPopup(planet.funFact);

        // Update info panel
        this.updateInfoPanel(planet);

        // Animate camera to planet
        this.animateToPlanet(planetKey);
    }

    animateToPlanet(planetKey) {
        const planet = this.planetData[planetKey];
        let targetPosition = new THREE.Vector3();
        let lookAtPosition = new THREE.Vector3();
        let cameraDistance = 100;

        if (planetKey === 'sun') {
            targetPosition.set(0, 50, 150);
            lookAtPosition.set(0, 0, 0);
            cameraDistance = 200;
        } else if (planetKey === 'asteroidBelt') {
            targetPosition.set(0, 100, 500);
            lookAtPosition.set(0, 0, 0);
            cameraDistance = 600;
        } else if (planetKey === 'kuiperBelt') {
            targetPosition.set(0, 200, 2000);
            lookAtPosition.set(0, 0, 0);
            cameraDistance = 2500;
        } else if (planetKey === 'oortCloud') {
            targetPosition.set(0, 500, 6000);
            lookAtPosition.set(0, 0, 0);
            cameraDistance = 8000;
        } else {
            // For planets, calculate current position in orbit
            const angle = (this.time / planet.orbitPeriod) * 2 * Math.PI;
            const planetPosition = new THREE.Vector3(
                Math.cos(angle) * planet.orbitRadius,
                0,
                Math.sin(angle) * planet.orbitRadius
            );
            
            lookAtPosition.copy(planetPosition);
            targetPosition.copy(planetPosition).add(new THREE.Vector3(0, planet.radius * 3, planet.radius * 8));
            cameraDistance = planet.radius * 10;
        }

        this.animateCameraTo(targetPosition, lookAtPosition, cameraDistance);
    }

    animateCameraTo(targetPosition, lookAtPosition, distance) {
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.controls.target.lerpVectors(startTarget, lookAtPosition, easeProgress);
            this.controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    showFactPopup(fact) {
        document.getElementById('factText').textContent = fact;
        document.getElementById('factPopup').classList.add('show');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            document.getElementById('factPopup').classList.remove('show');
        }, 5000);
    }

    updateInfoPanel(planet) {
        document.getElementById('planetName').textContent = planet.name;
        
        let detailsHTML = `<p>${planet.description}</p>`;
        
        if (planet.orbitRadius) {
            detailsHTML += `
                <p><strong>Orbital Period:</strong> ${Math.round(planet.orbitPeriod)} Earth days</p>
                <p><strong>Rotation Period:</strong> ${Math.abs(planet.rotationPeriod)} Earth days</p>
            `;
        }
        
        if (planet.moons !== undefined) {
            detailsHTML += `<p><strong>Number of Moons:</strong> ${planet.moons}</p>`;
        }
        
        document.getElementById('planetDetails').innerHTML = detailsHTML;
        
        // Show/hide action buttons
        const detailsBtn = document.getElementById('viewDetailsBtn');
        const moonsBtn = document.getElementById('viewMoonsBtn');
        
        detailsBtn.style.display = planet.detailsUrl ? 'block' : 'none';
        moonsBtn.style.display = (planet.moons && planet.moons.length > 0) ? 'block' : 'none';
        
        document.getElementById('infoPanel').classList.add('show');
    }

    showMoonsInfo(planet) {
        let moonsHTML = `<h4>Moons of ${planet.name}</h4>`;
        planet.moons.forEach(moon => {
            moonsHTML += `
                <div class="moon-item">
                    <strong>${moon.name}</strong><br>
                    <span>${moon.distance} from ${planet.name}</span><br>
                    <em>${moon.fact}</em>
                </div>
            `;
        });
        
        // You can implement a modal or expand the info panel to show moons
        alert(`Moons of ${planet.name}:\n\n` + planet.moons.map(moon => 
            `${moon.name} - ${moon.fact}`
        ).join('\n'));
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.animationSpeed !== 0) {
            this.time += 0.016 * this.animationSpeed;

            // Update planet positions and rotations
            Object.entries(this.planetData).forEach(([key, planet]) => {
                if (planet.orbitRadius && this.planetMeshes[key]) {
                    const planetMesh = this.planetMeshes[key];
                    const angle = (this.time / planet.orbitPeriod) * 2 * Math.PI;
                    planetMesh.position.x = Math.cos(angle) * planet.orbitRadius;
                    planetMesh.position.z = Math.sin(angle) * planet.orbitRadius;
                    
                    const rotationSpeed = (2 * Math.PI) / planet.rotationPeriod;
                    planetMesh.rotation.y += rotationSpeed * 0.016 * this.animationSpeed;
                }
            });

            // Rotate belts for visual effect
            if (this.asteroidBelt) {
                this.asteroidBelt.rotation.y += 0.001 * this.animationSpeed;
            }
            if (this.kuiperBelt) {
                this.kuiperBelt.rotation.y += 0.0005 * this.animationSpeed;
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the solar system when the page loads
window.addEventListener('load', () => {
    new SolarSystem3D();
});
