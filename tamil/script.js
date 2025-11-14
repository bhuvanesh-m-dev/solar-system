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

                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();
                this.intersectPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                
                this.init();
                this.setupEventListeners();
                this.animate();
            }

            init() {
                // Scene setup
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x000011);

                // Camera setup
                this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300000);
                this.camera.position.set(0, 500, 1000);

                // Renderer setup
                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                document.getElementById('container3D').appendChild(this.renderer.domElement);

                // Orbit controls
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.08;
                this.controls.minDistance = 10;
                this.controls.maxDistance = 150000;

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
                for (let i = 0; i < 4000; i++) {
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
                const sunGeometry = new THREE.SphereGeometry(120, 32, 32);
                const sunMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffff00,
                    emissive: 0xffff00,
                    emissiveIntensity: 0.9
                });
                
                this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
                this.scene.add(this.sun);

                // Sun glow effect
                const glowGeometry = new THREE.SphereGeometry(180, 32, 32);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff6600,
                    transparent: true,
                    opacity: 0.18
                });
                const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
                this.scene.add(sunGlow);
            }

            createPlanets() {
                // Consolidated planet dataset (AU values included where relevant)
                this.planetData = {
                    solarSystem: { 
                        name: "சூரிய மண்டலம்", 
                        description: "முழு சூரிய மண்டலத்தின் கண்ணோட்டம்.", 
                        funFact: "சூரிய மண்டலம் 4.5 பில்லியன் ஆண்டுகளுக்கு மேல் பழமையானது!" 
                    },
                    sun: { 
                        name: "சூரியன்", 
                        radius: 120, 
                        color: 0xffff00, 
                        funFact: "சூரியன் சூரிய மண்டலத்தின் 99.86% நிறையைக் கொண்டுள்ளது.", 
                        description: "சூரிய மண்டலத்தின் மையத்தில் உள்ள நமது மகத்தான நட்சத்திரம், அனைத்து கிரகங்களுக்கும் ஒளி மற்றும் ஆற்றலை வழங்குகிறது.", 
                        detailsUrl: "sun/index.html", 
                        au: 0 
                    },
                    mercury: { 
                        name: "புதன்", 
                        radius: 9, 
                        orbitRadius: 234, 
                        orbitPeriod: 88, 
                        color: 0x8c7853, 
                        tilt: 0.034, 
                        rotationPeriod: 58.6, 
                        funFact: "புதனுக்கு வளிமண்டலம் இல்லை மற்றும் வெப்பநிலை 800°F முதல் -290°F வரை மாறுபடும்!", 
                        description: "சூரியனுக்கு மிக நெருக்கமான கிரகம் மற்றும் நமது சூரிய மண்டலத்தில் மிக வேகமானது!", 
                        detailsUrl: "mercury/index.html", 
                        moons: 0, 
                        au: 0.39 
                    },
                    venus: { 
                        name: "வெள்ளி", 
                        radius: 21, 
                        orbitRadius: 432, 
                        orbitPeriod: 225, 
                        color: 0xffc649, 
                        tilt: 177.4, 
                        rotationPeriod: -243, 
                        funFact: "வெள்ளி பின்னோக்கி சுழல்கிறது! வெள்ளியில் ஒரு நாள் அதன் வருடத்தை விட நீளமானது!", 
                        description: "கடினமான நச்சு வளிமண்டலம் மற்றும் எரிமலை நிலப்பரப்புடன் கூடிய மிக வெப்பமான கிரகம்.", 
                        detailsUrl: "venus/index.html", 
                        moons: 0, 
                        au: 0.72 
                    },
                    earth: { 
                        name: "பூமி", 
                        radius: 22.5, 
                        orbitRadius: 600, 
                        orbitPeriod: 365, 
                        color: 0x4facfe, 
                        tilt: 23.44, 
                        rotationPeriod: 1, 
                        funFact: "பூமி திரவ நீர் மற்றும் உயிரினங்களை ஆதரிக்கும் ஒரே கிரகம்!", 
                        description: "நமக்குத் தெரிந்த வாழ்க்கைக்கு சரியான நிலைமைகளுடன் கூடிய நமது அழகான வீட்டு கிரகம்.", 
                        detailsUrl: "earth/index.html", 
                        moons: 1, 
                        au: 1.00 
                    },
                    mars: { 
                        name: "செவ்வாய்", 
                        radius: 12, 
                        orbitRadius: 912, 
                        orbitPeriod: 687, 
                        color: 0xff6b6b, 
                        tilt: 25.19, 
                        rotationPeriod: 1.03, 
                        funFact: "செவ்வாய் சூரிய மண்டலத்தில் மிகப்பெரிய எரிமலை - ஒலிம்பஸ் மான்ஸ்!", 
                        description: "விஞ்ஞானிகள் பழங்கால வாழ்க்கையின் அறிகுறிகளைத் தேடும் சிவப்பு கிரகம்.", 
                        detailsUrl: "mars/index.html", 
                        moons: 2, 
                        au: 1.52 
                    },
                    jupiter: { 
                        name: "வியாழன்", 
                        radius: 72, 
                        orbitRadius: 3120, 
                        orbitPeriod: 4333, 
                        color: 0xd2691e, 
                        tilt: 3.13, 
                        rotationPeriod: 0.41, 
                        funFact: "வியாழன் மிகப் பெரியது, மற்ற அனைத்து கிரகங்களும் அதற்குள் பொருந்தும்!", 
                        description: "பிரபலமான பெரிய சிவப்பு புள்ளி புயலுடன் கூடிய மாபெரும் வாயு கிரகம்.", 
                        detailsUrl: "jupiter/index.html", 
                        moons: 95, 
                        au: 5.20 
                    },
                    saturn: { 
                        name: "சனி", 
                        radius: 63, 
                        orbitRadius: 5724, 
                        orbitPeriod: 10759, 
                        color: 0xfad0c4, 
                        tilt: 26.73, 
                        rotationPeriod: 0.45, 
                        funFact: "சனி தண்ணீரில் மிதக்கும் - அது தண்ணீரை விட குறைந்த அடர்த்தியைக் கொண்டுள்ளது!", 
                        description: "அற்புதமான பனி வளையங்களுடன் கூடிய அழகான வளைய கிரகம்.", 
                        detailsUrl: "saturn/index.html", 
                        rings: true, 
                        moons: 146, 
                        au: 9.54 
                    },
                    uranus: { 
                        name: "யுரேனஸ்", 
                        radius: 75, 
                        orbitRadius: 11520, 
                        orbitPeriod: 30687, 
                        color: 0x4dd0e1, 
                        tilt: 97.77, 
                        rotationPeriod: -0.72, 
                        funFact: "யுரேனஸ் ஒரு உருண்டை பந்து போல அதன் பக்கத்தில் சுழல்கிறது!", 
                        description: "மங்கலான வளையங்கள் மற்றும் மீத்தேன் வளிமண்டலத்துடன் கூடிய சாய்ந்த பனி மாபெரும்.", 
                        detailsUrl: "uranus/index.html", 
                        moons: 27, 
                        au: 19.20 
                    },
                    neptune: { 
                        name: "நெப்டியூன்", 
                        radius: 72, 
                        orbitRadius: 18036, 
                        orbitPeriod: 60190, 
                        color: 0x1e3c72, 
                        tilt: 28.32, 
                        rotationPeriod: 0.67, 
                        funFact: "நெப்டியூனுக்கு சூரிய மண்டலத்தில் மிக வலுவான காற்று - மணிக்கு 1,200 மைல் வரை!", 
                        description: "நமது சூரிய மண்டலத்தின் விளிம்பில் உள்ள ஆழமான நீல காற்று கிரகம்.", 
                        detailsUrl: "neptune/index.html", 
                        moons: 14, 
                        au: 30.06 
                    },
                    asteroidBelt: { 
                        name: "சிறுகோள் பட்டை", 
                        radius: 1620, 
                        color: 0x888888, 
                        funFact: "சிறுகோள் பட்டையில் மில்லியன் கணக்கான சிறுகோள்கள் உள்ளன, ஆனால் அவை மிகவும் தொலைவில் உள்ளன!", 
                        description: "செவ்வாய் மற்றும் வியாழனுக்கு இடையில் சூரிய மண்டலத்தின் உருவாக்கத்திலிருந்து பாறை குப்பைகளால் நிரப்பப்பட்ட பகுதி.", 
                        detailsUrl: "asteroid-belt/index.html" 
                    },
                    kuiperBelt: { 
                        name: "குயிப்பர் பட்டை", 
                        radius: 24000, 
                        color: 0x4466aa, 
                        funFact: "புளூட்டோ குயிப்பர் பட்டையில் அறியப்பட்ட மிகப்பெரிய பொருள்!", 
                        description: "நெப்டியூனுக்கு அப்பால் பனி உடல்கள் மற்றும் குள்ள கிரகங்களைக் கொண்ட பரந்த பகுதி.", 
                        detailsUrl: "kuiper-belt/index.html" 
                    },
                    oortCloud: { 
                        name: "ஓர்ட் மேகம்", 
                        radius: 150000, 
                        color: 0x6644aa, 
                        funFact: "ஓர்ட் மேகம் டிரில்லியன் கணக்கான பனி பொருட்களைக் கொண்டிருக்கலாம்!", 
                        description: "நமது சூரிய மண்டலத்தைச் சுற்றியுள்ள பனி உடல்களின் கோள ஓடு, கிட்டத்தட்ட ஒரு ஒளி ஆண்டு தொலைவில்.", 
                        detailsUrl: "oort-cloud/index.html" 
                    }
                };

                // Create planets
                Object.entries(this.planetData).forEach(([key, planet]) => {
                    if (!planet.orbitRadius || key === 'sun' || key === 'asteroidBelt' || key === 'kuiperBelt' || key === 'oortCloud') return;
                    
                    const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
                    const material = new THREE.MeshPhongMaterial({
                        color: planet.color,
                        shininess: 20,
                        specular: 0x222222
                    });
                    
                    const planetMesh = new THREE.Mesh(geometry, material);
                    
                    // Set axial tilt
                    planetMesh.rotation.z = planet.tilt * Math.PI / 180;
                    
                    this.planetMeshes[key] = planetMesh;
                    this.scene.add(planetMesh);

                    // Create Saturn's rings
                    if (planet.rings) {
                        const ringGeometry = new THREE.RingGeometry(planet.radius + 10, planet.radius + 85, 640);
                        const ringMaterial = new THREE.MeshBasicMaterial({
                            color: 0xfad0c4,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.7
                        });
                        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                        rings.rotation.x = Math.PI / 2;
                        
                        const ringGroup = new THREE.Group();
                        ringGroup.add(rings);
                        ringGroup.rotation.z = planet.tilt * Math.PI / 180;
                        
                        planetMesh.add(ringGroup);
                    }
                });
            }

            createAsteroidBelt() {
                const asteroidCount = 1600;
                const innerRadius = 1200;
                const outerRadius = 2400;
                
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
                    const height = (Math.random() - 0.5) * 30;
                    
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
                const kuiperCount = 2000;
                const innerRadius = 18300;
                const outerRadius = 30000;
                
                const kuiperGeometry = new THREE.BufferGeometry();
                const kuiperMaterial = new THREE.PointsMaterial({
                    color: 0x4466aa,
                    size: 1.2,
                    sizeAttenuation: true
                });

                const positions = [];
                for (let i = 0; i < kuiperCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
                    const height = (Math.random() - 0.5) * 60;
                    
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
                const oortCount = 3000;
                const innerRadius = 120000;
                const outerRadius = 180000;
                
                const oortGeometry = new THREE.BufferGeometry();
                const oortMaterial = new THREE.PointsMaterial({
                    color: 0x6644aa,
                    size: 1,
                    sizeAttenuation: true,
                    transparent: true,
                    opacity: 0.5
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
                        const orbitGeometry = new THREE.RingGeometry(planet.orbitRadius - 0.6, planet.orbitRadius + 0.6, 128);
                        const orbitMaterial = new THREE.MeshBasicMaterial({
                            color: 0xffffff,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.08
                        });
                        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
                        orbit.rotation.x = Math.PI / 2;
                        this.scene.add(orbit);
                    }
                });
            }

            setupEventListeners() {
                // Time scale buttons
                document.querySelectorAll('.time-scale-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const speed = parseFloat(e.currentTarget.dataset.speed);
                        this.animationSpeed = speed;

                        // Update active button
                        document.querySelectorAll('.time-scale-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                    });
                });

                // Planet buttons
                document.querySelectorAll('.planet-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const planet = e.currentTarget.dataset.planet;
                        this.onPlanetSelected(planet);
                        
                        // Update active button
                        document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
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

                // Close fact popup
                document.getElementById('closeFact').addEventListener('click', () => {
                    document.getElementById('factPopup').classList.remove('show');
                });

                // Mouse move for distance calculation
                document.addEventListener('mousemove', (event) => {
                    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                });

                // Share button
                const shareBtn = document.getElementById('share-btn');
                const sharePopup = document.getElementById('share-popup');
                const closeSharePopup = document.getElementById('close-share-popup');

                if (shareBtn && sharePopup && closeSharePopup) {
                    shareBtn.addEventListener('click', () => {
                        sharePopup.classList.add('show');
                    });

                    closeSharePopup.addEventListener('click', () => {
                        sharePopup.classList.remove('show');
                    });

                    sharePopup.addEventListener('click', (e) => {
                        if (e.target === sharePopup) {
                            sharePopup.classList.remove('show');
                        }
                    });
                }

                // "More" button
                const moreBtn = document.getElementById('more-btn');
                const morePopup = document.getElementById('more-popup');
                const closeMorePopup = document.getElementById('close-more-popup');

                if (moreBtn && morePopup && closeMorePopup) {
                    moreBtn.addEventListener('click', () => {
                        morePopup.classList.add('show');
                    });

                    closeMorePopup.addEventListener('click', () => {
                        morePopup.classList.remove('show');
                    });

                    morePopup.addEventListener('click', (e) => {
                        if (e.target === morePopup) {
                            morePopup.classList.remove('show');
                        }
                    });
                }
            }

            onPlanetSelected(planetKey) {
                // Normalize missing keys
                if (!this.planetData[planetKey]) return;
                this.currentPlanet = planetKey;
                const p = this.planetData[planetKey];

                // Info & fact
                this.updateInfoPanel(p);
                if (p.funFact) this.showFactPopup(p.funFact);

                // Animate camera
                this.animateToPlanet(planetKey);
            }

            updateInfoPanel(planet) {
                document.getElementById('planetName').textContent = planet.name || '—';
                let html = `<p>${planet.description || ''}</p>`;

                if (planet.orbitRadius) {
                    html += `<p><strong>சுற்றுப்பாதை ஆரம் (அலகுகள்):</strong> ${planet.orbitRadius}</p>`;
                    if (planet.orbitPeriod) html += `<p><strong>சுற்றுப்பாதை காலம்:</strong> ${Math.round(planet.orbitPeriod)} நாட்கள்</p>`;
                    if (planet.rotationPeriod) html += `<p><strong>சுழற்சி:</strong> ${Math.abs(planet.rotationPeriod)} நாட்கள்</p>`;
                }

                if (planet.moons !== undefined) {
                    if (Array.isArray(planet.moons)) {
                        html += `<p><strong>நிலவுகள்:</strong> ${planet.moons.length}</p>`;
                    } else {
                        html += `<p><strong>நிலவுகள்:</strong> ${planet.moons}</p>`;
                    }
                }

                if (typeof planet.au === 'number') {
                    html += `<p><strong>சராசரி தூரம்:</strong> ${planet.au.toFixed(2)} AU</p>`;
                    document.getElementById('distance-display').textContent = `${planet.au.toFixed(2)} AU`;
                    document.getElementById('distance-display-aux').textContent = `${planet.au.toFixed(2)} AU`;
                }

                document.getElementById('planetDetails').innerHTML = html;
                document.getElementById('infoPanel').classList.add('show');
            }

            showFactPopup(text) {
                const popup = document.getElementById('factPopup');
                const factText = document.getElementById('factText');
                factText.textContent = text || '';
                popup.classList.add('show');
                // auto-hide after 5s
                clearTimeout(this._factTimeout);
                this._factTimeout = setTimeout(() => popup.classList.remove('show'), 5000);
            }

            animateToPlanet(planetKey) {
                const p = this.planetData[planetKey];
                let targetPosition = new THREE.Vector3();
                let lookAtPosition = new THREE.Vector3();
                // sensible defaults
                if (planetKey === 'solarSystem') {
                    targetPosition.set(0, 15000, 30000);
                    lookAtPosition.set(0, 0, 0);
                } else if (planetKey === 'sun') {
                    targetPosition.set(0, 150, 450);
                    lookAtPosition.set(0, 0, 0);
                } else if (planetKey === 'asteroidBelt') {
                    targetPosition.set(0, 300, 1500);
                    lookAtPosition.set(0, 0, 0);
                } else if (planetKey === 'kuiperBelt') {
                    targetPosition.set(0, 600, 6000);
                    lookAtPosition.set(0, 0, 0);
                } else if (planetKey === 'oortCloud') {
                    targetPosition.set(0, 1500, 210000);
                    lookAtPosition.set(0, 0, 0);
                } else {
                    // compute planet's current position in orbit
                    const angle = (this.time / (p.orbitPeriod || 1)) * 2 * Math.PI;
                    const planetPos = new THREE.Vector3(
                        Math.cos(angle) * (p.orbitRadius || 600),
                        0,
                        Math.sin(angle) * (p.orbitRadius || 600)
                    );
                    lookAtPosition.copy(planetPos);
                    // camera offset slightly above and back relative to planet
                    targetPosition.copy(planetPos).add(new THREE.Vector3(0, Math.max(120, p.radius * 3), Math.max(240, p.radius * 8)));
                }

                // Duration and easing
                const duration = 1200;
                const startTime = performance.now();
                const startPos = this.camera.position.clone();
                const startTarget = this.controls.target.clone();

                const animate = (t) => {
                    const elapsed = t - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);

                    this.camera.position.lerpVectors(startPos, targetPosition, ease);
                    this.controls.target.lerpVectors(startTarget, lookAtPosition, ease);
                    this.controls.update();

                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }

            animate() {
                requestAnimationFrame(() => this.animate());

                if (this.animationSpeed !== 0) {
                    this.time += 0.016 * this.animationSpeed;

                    // Update planet positions and rotations
                    Object.entries(this.planetData).forEach(([key, planet]) => {
                        if (planet.orbitRadius && this.planetMeshes[key]) {
                            const mesh = this.planetMeshes[key];
                            const angle = (this.time / (planet.orbitPeriod || 1)) * 2 * Math.PI;
                            mesh.position.x = Math.cos(angle) * planet.orbitRadius;
                            mesh.position.z = Math.sin(angle) * planet.orbitRadius;
                            const rotationSpeed = (2 * Math.PI) / (planet.rotationPeriod || 1);
                            mesh.rotation.y += rotationSpeed * 0.016 * this.animationSpeed;

                            if (planet.rings) {
                                const ringGroup = mesh.children.find(child => child.type === 'Group');
                                if (ringGroup) {
                                    ringGroup.rotation.y += rotationSpeed * 0.016 * this.animationSpeed;
                                }
                            }
                        }
                    });

                    // Rotate belts for visual effect
                    if (this.asteroidBelt) {
                        this.asteroidBelt.rotation.y += 0.0009 * this.animationSpeed;
                    }
                    if (this.kuiperBelt) {
                        this.kuiperBelt.rotation.y += 0.0004 * this.animationSpeed;
                    }
                }

                // Distance under cursor (aux)
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersection = new THREE.Vector3();
                this.raycaster.ray.intersectPlane(this.intersectPlane, intersection);
                const distance = intersection.length();
                const auDistance = distance / 600; // 1 AU = 600 units (consistent with data)
                const aux = document.getElementById('distance-display-aux');
                if (aux) aux.textContent = `${auDistance.toFixed(2)} AU`;

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
