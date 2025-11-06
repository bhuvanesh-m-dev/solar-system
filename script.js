class SolarSystem3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.animationSpeed = 1;
        this.time = 0;
        this.currentRegion = 'fullSystem';
        
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

        // Initial view
        this.focusOnRegion('fullSystem');

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        // Sun light (point light at center)
        const sunLight = new THREE.PointLight(0xffffff, 2, 100000);
        this.scene.add(sunLight);

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
        // Planet data with realistic relative sizes and distances (scaled for visualization)
        this.planetData = {
            mercury: {
                name: "Mercury",
                radius: 3,
                orbitRadius: 100,
                orbitPeriod: 88,
                color: 0x8c7853,
                tilt: 0.034,
                rotationPeriod: 58.6
            },
            venus: {
                name: "Venus",
                radius: 7,
                orbitRadius: 150,
                orbitPeriod: 225,
                color: 0xffc649,
                tilt: 177.4,
                rotationPeriod: -243
            },
            earth: {
                name: "Earth",
                radius: 7.5,
                orbitRadius: 200,
                orbitPeriod: 365,
                color: 0x4facfe,
                tilt: 23.44,
                rotationPeriod: 1,
                moons: 1
            },
            mars: {
                name: "Mars",
                radius: 4,
                orbitRadius: 250,
                orbitPeriod: 687,
                color: 0xff6b6b,
                tilt: 25.19,
                rotationPeriod: 1.03,
                moons: 2
            },
            jupiter: {
                name: "Jupiter",
                radius: 40,
                orbitRadius: 400,
                orbitPeriod: 4333,
                color: 0xd2691e,
                tilt: 3.13,
                rotationPeriod: 0.41,
                moons: 95
            },
            saturn: {
                name: "Saturn",
                radius: 35,
                orbitRadius: 600,
                orbitPeriod: 10759,
                color: 0xfad0c4,
                tilt: 26.73,
                rotationPeriod: 0.45,
                rings: true,
                moons: 146
            },
            uranus: {
                name: "Uranus",
                radius: 25,
                orbitRadius: 800,
                orbitPeriod: 30687,
                color: 0x4dd0e1,
                tilt: 97.77,
                rotationPeriod: -0.72,
                moons: 28
            },
            neptune: {
                name: "Neptune",
                radius: 24,
                orbitRadius: 1000,
                orbitPeriod: 60190,
                color: 0x1e3c72,
                tilt: 28.32,
                rotationPeriod: 0.67,
                moons: 16
            }
        };

        // Create planets
        Object.entries(this.planetData).forEach(([key, planet]) => {
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
        const innerRadius = 280; // Between Mars and Jupiter
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
        const innerRadius = 1200; // Beyond Neptune
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
        // Note: Oort Cloud is scaled down 1000x for visualization
        // Actual Oort Cloud extends from ~2000 AU to 100,000+ AU
        const oortCount = 5000;
        const innerRadius = 2000; // Scaled down from 2000 AU
        const outerRadius = 5000; // Scaled down from 50,000+ AU
        
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
            // Spherical distribution for Oort Cloud
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
        });
    }

    setupEventListeners() {
        // Zoom controls
        document.querySelectorAll('.zoom-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const region = e.target.dataset.region;
                this.focusOnRegion(region);
                
                // Update active button
                document.querySelectorAll('.zoom-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Speed controls
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.animationSpeed = parseInt(e.target.dataset.speed);
                
                // Update active button
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Double click to reset view
        this.renderer.domElement.addEventListener('dblclick', () => {
            this.focusOnRegion('fullSystem');
        });
    }

    focusOnRegion(region) {
        this.currentRegion = region;
        
        const targetPosition = new THREE.Vector3();
        const lookAtPosition = new THREE.Vector3();
        let cameraDistance = 1000;

        switch (region) {
            case 'inner':
                targetPosition.set(0, 100, 300);
                lookAtPosition.set(0, 0, 0);
                cameraDistance = 400;
                this.updateInfoPanel('Inner Solar System', 
                    'Explore the rocky planets: Mercury, Venus, Earth, and Mars. This region contains the Asteroid Belt between Mars and Jupiter.');
                break;
                
            case 'gasGiants':
                targetPosition.set(0, 200, 800);
                lookAtPosition.set(0, 0, 0);
                cameraDistance = 1200;
                this.updateInfoPanel('Gas Giants Region', 
                    'Discover Jupiter, Saturn, Uranus, and Neptune - the massive outer planets with complex ring systems and many moons.');
                break;
                
            case 'kuiperBelt':
                targetPosition.set(0, 300, 2000);
                lookAtPosition.set(0, 0, 0);
                cameraDistance = 2500;
                this.updateInfoPanel('Kuiper Belt', 
                    'Beyond Neptune lies the Kuiper Belt, home to dwarf planets like Pluto and thousands of icy bodies.');
                break;
                
            case 'oortCloud':
                targetPosition.set(0, 1000, 8000);
                lookAtPosition.set(0, 0, 0);
                cameraDistance = 10000;
                this.updateInfoPanel('Oort Cloud', 
                    'The outermost region of our solar system. A spherical shell of icy objects that extends nearly a light-year from the Sun. (Shown at 1:1000 scale)');
                break;
                
            case 'fullSystem':
            default:
                targetPosition.set(0, 500, 1500);
                lookAtPosition.set(0, 0, 0);
                cameraDistance = 2000;
                this.updateInfoPanel('Full Solar System', 
                    'View our entire solar system from the Sun to the distant Oort Cloud. Use the region buttons to explore specific areas.');
                break;
        }

        // Animate camera to new position
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

    updateInfoPanel(title, info) {
        document.getElementById('regionTitle').textContent = title;
        document.getElementById('regionInfo').innerHTML = `<p>${info}</p>`;
    }

    updateDistanceIndicator() {
        const distanceFromSun = this.camera.position.length();
        const auDistance = (distanceFromSun / 200).toFixed(1); // Rough conversion to AU
        document.getElementById('distanceValue').textContent = `${auDistance} AU`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.animationSpeed !== 0) {
            this.time += 0.016 * this.animationSpeed; // Roughly 60fps

            // Update planet positions and rotations
            Object.entries(this.planetData).forEach(([key, planet]) => {
                const planetMesh = this.planetMeshes[key];
                if (planetMesh) {
                    // Orbital motion
                    const angle = (this.time / planet.orbitPeriod) * 2 * Math.PI;
                    planetMesh.position.x = Math.cos(angle) * planet.orbitRadius;
                    planetMesh.position.z = Math.sin(angle) * planet.orbitRadius;
                    
                    // Rotation
                    const rotationSpeed = (2 * Math.PI) / planet.rotationPeriod;
                    planetMesh.rotation.y += rotationSpeed * 0.016 * this.animationSpeed;
                }
            });

            // Rotate asteroid belt and Kuiper belt for visual effect
            if (this.asteroidBelt) {
                this.asteroidBelt.rotation.y += 0.001 * this.animationSpeed;
            }
            if (this.kuiperBelt) {
                this.kuiperBelt.rotation.y += 0.0005 * this.animationSpeed;
            }
        }

        // Update controls
        this.controls.update();
        
        // Update distance indicator
        this.updateDistanceIndicator();

        // Render scene
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
