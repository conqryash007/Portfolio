
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import ReactMarkdown from 'react-markdown';
import { Home, Maximize2, Minimize2, RotateCcw, ChevronRight, ChevronLeft, Volume2, VolumeX, Navigation, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import MobileControls from '../components/space/MobileControls';
import QuickNavMenu from '../components/space/QuickNavMenu';
import MobilePlanetPanel from '../components/space/MobilePlanetPanel';

export default function SpaceScene() {
  // Device detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');

  // Detect device on mount
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
        setIsMobile(true);
        setIsTablet(false);
      } else if (width >= 768 && width <= 1024) {
        setDeviceType('tablet');
        setIsMobile(false);
        setIsTablet(true);
      } else {
        setDeviceType('desktop');
        setIsMobile(false);
        setIsTablet(false);
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef(null);
  const nebulaCloudsRef = useRef([]);
  const planetsRef = useRef([]);
  const rocketRef = useRef(null);
  const rocketGroupRef = useRef(null);
  const engineParticlesRef = useRef([]);
  const thrustParticlesRef = useRef([]);
  const travelPathRef = useRef(null);
  const pathProgressRef = useRef(null);
  const animationIdRef = useRef(null);
  const keysRef = useRef({});
  const cameraAngleRef = useRef(0);
  const barrelRollRef = useRef({ active: false, progress: 0, cooldown: 0 });
  
  // Free roam refs
  const mouseRef = useRef({ x: 0, y: 0 });
  const pitchRef = useRef(0);
  const yawRef = useRef(0);
  const freeRoamVelocityRef = useRef(new THREE.Vector3());
  
  // Mobile control refs
  const joystickInputRef = useRef({ x: 0, y: 0 });
  const mobileBoostRef = useRef(false);
  
  // Audio refs
  const audioContextRef = useRef(null);
  const currentSoundRef = useRef(null);
  const gainNodeRef = useRef(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [visitedPlanets, setVisitedPlanets] = useState([0]);
  const [showBarrelRollText, setShowBarrelRollText] = useState(false);
  const [pathProgress, setPathProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [currentSector, setCurrentSector] = useState('SUN');
  const [nearestPlanet, setNearestPlanet] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(50);
  const [freeRoamMode, setFreeRoamMode] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  
  // Mobile-specific state
  const [showQuickNav, setShowQuickNav] = useState(false);
  const [showMobilePlanetPanel, setShowMobilePlanetPanel] = useState(false);

  // Waypoint definitions with sound configurations
  const waypoints = [
    { 
      name: 'SUN', 
      position: [0, 0, 0], 
      radius: 15, 
      color: 0xFFA500, 
      info: 'Welcome to my portfolio! Start your journey through space.',
      label: 'Home Base',
      icon: '🌟',
      soundType: 'sun',
      content: `🌟 WELCOME TO MY PORTFOLIO

Embark on an interactive journey through space to discover my professional story. Each planet represents a different aspect of my career and skills.

Navigate using:
• W/S keys to travel between planets
• A/D to rotate camera
• E for barrel roll
• Shift to boost
• H to toggle controls

Start your journey by traveling to Mercury!`
    },
    { 
      name: 'MERCURY', 
      position: [80, 20, 30], 
      radius: 4, 
      color: 0xB0B0B0, 
      info: 'Learn about my background, interests, and what drives me.',
      label: 'About Me',
      icon: '👨‍💻',
      soundType: 'rocky',
      content: `👨‍💻 SOFTWARE ENGINEER

Yash Gupta
Full Stack Developer | Blockchain Specialist

Seasoned software engineer with expertise in building scalable web applications and blockchain solutions. Passionate about creating innovative digital experiences using modern technologies.

🎓 B.Tech in Information Technology
📍 Currently: Software Engineer at Dreamworks Alliance
💼 2+ years of development experience

I specialize in building end-to-end solutions that combine cutting-edge technology with exceptional user experience. My journey in software development has been driven by curiosity and a commitment to continuous learning.`
    },
    { 
      name: 'VENUS', 
      position: [120, 40, -40], 
      radius: 6, 
      color: 0xFFC649, 
      info: 'Get in touch! Find my email, LinkedIn, and social media.',
      label: 'Contact Information',
      icon: '📫',
      soundType: 'atmospheric',
      content: `📫 CONTACT INFORMATION

📧 guptayash200010@gmail.com
📱 +91 969689544

💼 LinkedIn:
[linkedin.com/in/guptayash007](https://linkedin.com/in/guptayash007/)

🐙 GitHub:
[github.com/conqryash007](https://github.com/conqryash007)

🏆 LeetCode:
[leetcode.com/conqryash007](https://leetcode.com/conqryash007)

Status: Open to opportunities

Feel free to reach out for collaborations, opportunities, or just to connect!`
    },
    { 
      name: 'EARTH', 
      position: [180, 10, -20], 
      radius: 7, 
      color: 0x3A86FF, 
      info: 'My academic journey and educational achievements.',
      label: 'Education',
      icon: '🎓',
      soundType: 'earth',
      content: `🎓 EDUCATION

B.Tech in Information Technology
International Institute of Information Technology (IIIT)
📍 Bhubaneswar, Odisha
📊 CGPA: 8.42/10
📅 Dec 2020 - June 2024

Relevant Coursework:
• Data Structures & Algorithms
• Database Management Systems
• Web Technologies
• Software Engineering
• Blockchain Technology

XII - CBSE
Central Academy, Uttar Pradesh
📊 95.6%
📅 Aug 2018 - May 2019`
    },
    { 
      name: 'MARS', 
      position: [240, -20, 60], 
      radius: 5, 
      color: 0xFF006E, 
      info: 'Professional experience and career highlights.',
      label: 'Work Experience',
      icon: '💼',
      soundType: 'storm',
      content: `💼 WORK EXPERIENCE

🚀 Software Engineer (Current)
Dreamworks Alliance Pvt. Ltd.
Pune, Maharashtra
Aug 2025 - Present

⚙️ Associate Product Engineer
Inovaare Corporation
Bhubaneswar
Jan 2024 - Oct 2024
• Angular 7→17 migration: 30% load time reduction
• Backend API integration & optimization
• Node.js performance improvements
Tech: Angular, Node.js, MongoDB

👨‍💻 Full Stack Developer (Intern)
Quagnitia Systems Pvt. Ltd.
Pune
July 2022 - Jan 2024
• Blockchain platform development
• NFT minting: 10,000+ NFTs
• Marketplace scaling: 50,000+ concurrent users
Tech: React, Node.js, MongoDB, AWS, Blockchain`
    },
    { 
      name: 'JUPITER', 
      position: [320, 0, 40], 
      radius: 14, 
      color: 0xFB5607, 
      info: 'Technical skills, tools, and technologies I work with.',
      label: 'Technical Skills',
      icon: '⚡',
      soundType: 'gas',
      content: `⚡ TECHNICAL SKILLS

💻 LANGUAGES:
Java | C++ | JavaScript | SQL (PostgreSQL)

🎨 FRONTEND:
React.js | Angular | Next.js | Material-UI
HTML5 | CSS3 | Responsive Design

⚙️ BACKEND:
Node.js | Express.js | REST APIs
WebSocket | GraphQL

🗄️ DATABASES:
MongoDB | PostgreSQL | MySQL | Redis

☁️ DEVOPS & CLOUD:
Docker | AWS (EC2, S3, Lambda)
Git | CI/CD | Linux

⛓️ BLOCKCHAIN:
Solidity | Web3.js | Truffle
Hardhat | Ethereum | Smart Contracts`
    },
    { 
      name: 'SATURN', 
      position: [400, 30, -50], 
      radius: 12, 
      color: 0xFFBE0B, 
      info: 'Showcase of my projects and creative work.',
      label: 'Projects',
      icon: '🚀',
      soundType: 'rings',
      content: `🚀 FEATURED PROJECTS

1. 🏠 Property Pulse
Blockchain Land Registration System
Secure transactional data storage for land purchases with smart contracts
Tech: MERN, Solidity, Truffle, Ethereum, Hardhat

2. ✈️ reTraView
Full Stack Traveler Review Platform
Platform for travelers and guides to share experiences
Tech: React.js, Node.js, Express, MongoDB

3. 💰 Fund4Cause
Web3.0 Crowdfunding Platform
Blockchain-based donation platform with ERC-20 token rewards
Tech: React, Next.js, Solidity, Web3.js, Ganache

4. 🌌 Cosmic Canvas (This Site!)
Interactive 3D Portfolio Experience
Explore my journey through space
Tech: React, Three.js, WebGL

View All Projects → [github.com/conqryash007](https://github.com/conqryash007)`
    },
    { 
      name: 'NEPTUNE', 
      position: [480, -10, -20], 
      radius: 8, 
      color: 0x1B98F5, 
      info: 'Awards, certifications, and notable achievements.',
      label: 'Achievements & Certifications',
      icon: '🏆',
      soundType: 'ice',
      content: `🏆 ACHIEVEMENTS & LEADERSHIP

⭐ Tech Lead
GeeksforGeeks Chapter - IIIT Bhubaneswar
2023

🌟 Core Member
Google Developer Student Club - IIIT Bh
2023

🥇 First Prize
GFG's GEEK FIESTA - Web Development Hackathon
2022

📈 Additional Highlights:
• 8.42 CGPA in B.Tech IT
• 95.6% in XII CBSE
• Active open-source contributor
• LeetCode problem solver
• Built 10+ full-stack projects
• Mentored 20+ junior developers

"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill`
    }
  ];

  // Mobile joystick handler
  const handleMobileMove = (x, y) => {
    joystickInputRef.current = { x, y };
  };

  // Mobile boost handler
  const handleMobileBoost = (boosting) => {
    mobileBoostRef.current = boosting;
  };

  // Quick nav planet selection
  const handleQuickNavSelect = (planetIndex) => {
    // Warp to planet
    // This now relies on `jumpToPlanet` which is already defined below and handles the navigation logic
    // and setting `showQuickNav(false)`.
    jumpToPlanet(planetIndex);
  };

  // Initialize Audio Context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [soundEnabled]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  // Generate soundscape based on planet type
  const generateSoundscape = (soundType) => {
    if (!audioContextRef.current || !soundEnabled) return;

    // Stop current sound
    if (currentSoundRef.current) {
      try {
        currentSoundRef.current.forEach(node => {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        });
      } catch (e) {
        // Ignore errors from already stopped nodes
      }
    }

    const ctx = audioContextRef.current;
    const nodes = [];

    switch (soundType) {
      case 'sun':
        // Deep rumbling drone
        const sunOsc1 = ctx.createOscillator();
        sunOsc1.type = 'sine';
        sunOsc1.frequency.value = 40;
        const sunGain1 = ctx.createGain();
        sunGain1.gain.value = 0.15;
        sunOsc1.connect(sunGain1);
        sunGain1.connect(gainNodeRef.current);
        sunOsc1.start();
        nodes.push(sunOsc1);

        const sunOsc2 = ctx.createOscillator();
        sunOsc2.type = 'triangle';
        sunOsc2.frequency.value = 60;
        const sunGain2 = ctx.createGain();
        sunGain2.gain.value = 0.08;
        sunOsc2.connect(sunGain2);
        sunGain2.connect(gainNodeRef.current);
        sunOsc2.start();
        nodes.push(sunOsc2);
        break;

      case 'rocky':
        // High-pitched metallic ambience
        const rockyOsc = ctx.createOscillator();
        rockyOsc.type = 'square';
        rockyOsc.frequency.value = 880;
        const rockyGain = ctx.createGain();
        rockyGain.gain.value = 0.03;
        const rockyFilter = ctx.createBiquadFilter();
        rockyFilter.type = 'highpass';
        rockyFilter.frequency.value = 500;
        rockyOsc.connect(rockyFilter);
        rockyFilter.connect(rockyGain);
        rockyGain.connect(gainNodeRef.current);
        rockyOsc.start();
        nodes.push(rockyOsc);
        break;

      case 'atmospheric':
        // Windy, swirling atmosphere
        const atmOsc1 = ctx.createOscillator();
        atmOsc1.type = 'sawtooth';
        atmOsc1.frequency.value = 220;
        const atmLfo = ctx.createOscillator();
        atmLfo.frequency.value = 0.3;
        const atmLfoGain = ctx.createGain();
        atmLfoGain.gain.value = 20;
        atmLfo.connect(atmLfoGain);
        atmLfoGain.connect(atmOsc1.frequency);
        const atmGain = ctx.createGain();
        atmGain.gain.value = 0.05;
        const atmFilter = ctx.createBiquadFilter();
        atmFilter.type = 'bandpass';
        atmFilter.frequency.value = 300;
        atmOsc1.connect(atmFilter);
        atmFilter.connect(atmGain);
        atmGain.connect(gainNodeRef.current);
        atmOsc1.start();
        atmLfo.start();
        nodes.push(atmOsc1, atmLfo);
        break;

      case 'earth':
        // Calm, harmonious tones
        const earthOsc1 = ctx.createOscillator();
        earthOsc1.type = 'sine';
        earthOsc1.frequency.value = 174; // Solfeggio frequency
        const earthGain1 = ctx.createGain();
        earthGain1.gain.value = 0.08;
        earthOsc1.connect(earthGain1);
        earthGain1.connect(gainNodeRef.current);
        earthOsc1.start();
        nodes.push(earthOsc1);

        const earthOsc2 = ctx.createOscillator();
        earthOsc2.type = 'sine';
        earthOsc2.frequency.value = 261; // Middle C
        const earthGain2 = ctx.createGain();
        earthGain2.gain.value = 0.05;
        earthOsc2.connect(earthGain2);
        earthGain2.connect(gainNodeRef.current);
        earthOsc2.start();
        nodes.push(earthOsc2);
        break;

      case 'storm':
        // Harsh, turbulent soundscape
        const stormNoise = ctx.createBufferSource();
        const stormBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const stormData = stormBuffer.getChannelData(0);
        for (let i = 0; i < stormBuffer.length; i++) {
          stormData[i] = Math.random() * 2 - 1;
        }
        stormNoise.buffer = stormBuffer;
        stormNoise.loop = true;
        const stormFilter = ctx.createBiquadFilter();
        stormFilter.type = 'bandpass';
        stormFilter.frequency.value = 400;
        const stormGain = ctx.createGain();
        stormGain.gain.value = 0.06;
        stormNoise.connect(stormFilter);
        stormFilter.connect(stormGain);
        stormGain.connect(gainNodeRef.current);
        stormNoise.start();
        nodes.push(stormNoise);
        break;

      case 'gas':
        // Deep, swirling gas giant
        const gasOsc1 = ctx.createOscillator();
        gasOsc1.type = 'triangle';
        gasOsc1.frequency.value = 55;
        const gasLfo = ctx.createOscillator();
        gasLfo.frequency.value = 0.2;
        const gasLfoGain = ctx.createGain();
        gasLfoGain.gain.value = 15;
        gasLfo.connect(gasLfoGain);
        gasLfoGain.connect(gasOsc1.frequency);
        const gasGain = ctx.createGain();
        gasGain.gain.value = 0.12;
        gasOsc1.connect(gasGain);
        gasGain.connect(gainNodeRef.current);
        gasOsc1.start();
        gasLfo.start();
        nodes.push(gasOsc1, gasLfo);
        break;

      case 'rings':
        // Crystalline, shimmering tones
        const ringOsc1 = ctx.createOscillator();
        ringOsc1.type = 'sine';
        ringOsc1.frequency.value = 528;
        const ringGain1 = ctx.createGain();
        ringGain1.gain.value = 0.04;
        ringOsc1.connect(ringGain1);
        ringGain1.connect(gainNodeRef.current);
        ringOsc1.start();
        nodes.push(ringOsc1);

        const ringOsc2 = ctx.createOscillator();
        ringOsc2.type = 'sine';
        ringOsc2.frequency.value = 792;
        const ringGain2 = ctx.createGain();
        ringGain2.gain.value = 0.03;
        ringOsc2.connect(ringGain2);
        ringGain2.connect(gainNodeRef.current);
        ringOsc2.start();
        nodes.push(ringOsc2);
        break;

      case 'ice':
        // Cold, crystalline ambience
        const iceOsc = ctx.createOscillator();
        iceOsc.type = 'sine';
        iceOsc.frequency.value = 1320;
        const iceFilter = ctx.createBiquadFilter();
        iceFilter.type = 'highpass';
        iceFilter.frequency.value = 1000;
        const iceGain = ctx.createGain();
        iceGain.gain.value = 0.04;
        iceOsc.connect(iceFilter);
        iceFilter.connect(iceGain);
        iceGain.connect(gainNodeRef.current);
        iceOsc.start();
        nodes.push(iceOsc);
        break;

      case 'space':
      default:
        // Deep space ambient
        const spaceOsc = ctx.createOscillator();
        spaceOsc.type = 'sine';
        spaceOsc.frequency.value = 30;
        const spaceGain = ctx.createGain();
        spaceGain.gain.value = 0.08;
        spaceOsc.connect(spaceGain);
        spaceGain.connect(gainNodeRef.current);
        spaceOsc.start();
        nodes.push(spaceOsc);
        break;
    }

    currentSoundRef.current = nodes;
  };

  // Change soundscape when planet changes or movement state changes
  useEffect(() => {
    if (!soundEnabled) {
      // If sound is disabled, stop all sounds
      if (currentSoundRef.current) {
        currentSoundRef.current.forEach(node => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch (e) {
            // Ignore
          }
        });
        currentSoundRef.current = null;
      }
      return; // Exit if sound is disabled
    }

    // Sound is enabled
    if (freeRoamMode) {
      generateSoundscape('space'); // Always play space ambient in free roam
    } else {
      if (selectedPlanet && !isMoving) {
        generateSoundscape(selectedPlanet.soundType);
      } else if (!isMoving) { // Not at a planet, not moving, so deep space
        generateSoundscape('space');
      }
    }
  }, [selectedPlanet, soundEnabled, isMoving, freeRoamMode]);

  // Toggle sound
  const toggleSound = () => {
    if (!soundEnabled) {
      // Initialize AudioContext if it's null or suspended
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = volume / 100;
      } else if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setSoundEnabled(true);
    } else {
      setSoundEnabled(false);
      // Stop all sounds
      if (currentSoundRef.current) {
        currentSoundRef.current.forEach(node => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch (e) {
            // Ignore
          }
        });
        currentSoundRef.current = null;
      }
      // Optionally suspend audio context to save resources
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
      }
    }
  };

  // Toggle free roam mode
  const toggleFreeRoam = () => {
    const newMode = !freeRoamMode;
    setFreeRoamMode(newMode);
    
    if (newMode) {
      // Entering free roam
      setIsMoving(false);
      setIsOrbiting(false);
      setSelectedPlanet(null);
      setPathProgress(0); // Hide progress bar
      
      // Request pointer lock - will only succeed if called from a user gesture
      if (containerRef.current && !isMobile && !isTablet) { // Only request pointer lock on desktop
        containerRef.current.requestPointerLock();
      }
      // Reset camera orientation for first-person
      pitchRef.current = 0;
      yawRef.current = 0;
      joystickInputRef.current = { x: 0, y: 0 }; // Reset joystick
      mobileBoostRef.current = false; // Reset mobile boost
    } else {
      // Exiting free roam
      if (document.pointerLockElement) { // Only exit if locked
        document.exitPointerLock();
      }
      
      // Reset velocity
      freeRoamVelocityRef.current.set(0, 0, 0);
      
      // Return rocket to the nearest waypoint's orbit
      if (rocketGroupRef.current) {
        const rocketPos = rocketGroupRef.current.position;
        let closestIndex = 0;
        let closestDist = Infinity;
        
        waypoints.forEach((wp, index) => {
          const dist = rocketPos.distanceTo(new THREE.Vector3(...wp.position));
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = index;
          }
        });
        arriveAtPlanet(closestIndex);
      }
      
      // Reset camera angle for tour mode
      cameraAngleRef.current = 0;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    scene.fog = new THREE.FogExp2(0x000814, 0.0005);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Directional light (distant sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Create starfield
    createStarfield(scene);

    // Create nebula clouds
    createNebulaClouds(scene);

    // Create planets
    createPlanets(scene);

    // Create travel path (curve only, not rendered)
    createTravelPath(scene);

    // Create rocket
    createRocket(scene);

    // Pointer lock events
    const onPointerLockChange = () => {
      setPointerLocked(document.pointerLockElement === containerRef.current);
    };
    
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mozpointerlockchange', onPointerLockChange);
    document.addEventListener('webkitpointerlockchange', onPointerLockChange);

    // Mouse move for free roam (desktop only)
    const handleMouseMove = (event) => {
      if (!isMobile && !isTablet && freeRoamMode && document.pointerLockElement === containerRef.current) {
        const sensitivity = 0.002;
        yawRef.current -= event.movementX * sensitivity;
        pitchRef.current -= event.movementY * sensitivity;
        
        // Clamp pitch to prevent gimbal lock
        pitchRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitchRef.current));
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);

    // Keyboard controls (desktop only)
    const handleKeyDown = (event) => {
      if (isMobile || isTablet) return; // Disable keyboard controls on mobile/tablet

      const key = event.key.toLowerCase();
      if (keysRef.current[key]) return; // Prevent repeat
      keysRef.current[key] = true;
      
      if (!freeRoamMode) {
        // Tour mode controls
        if (key === 'w' && !isMoving) {
          moveToNextPlanet();
        } else if (key === 's' && !isMoving) {
          moveToPreviousPlanet();
        } else if (key === 'e' && barrelRollRef.current.cooldown <= 0) {
          triggerBarrelRoll();
        } else if (key === ' ' && isMoving) {
          stopAtWaypoint();
        } else if (key === 'h') {
          setShowControls(prev => !prev);
        }
      } else {
        // Free roam mode controls
        if (key === 'h') {
          setShowControls(prev => !prev);
        } else if (key === 'escape') {
          toggleFreeRoam();
        }
      }
    };
    
    const handleKeyUp = (event) => {
      if (isMobile || isTablet) return; // Disable keyboard controls on mobile/tablet
      keysRef.current[event.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.0001;

      // Animate stars twinkling
      if (starsRef.current) {
        const opacities = starsRef.current.geometry.attributes.opacity;
        
        for (let i = 0; i < opacities.count; i++) {
          const twinkle = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
          opacities.array[i] = 0.3 + twinkle * 0.7;
        }
        opacities.needsUpdate = true;
        
        starsRef.current.rotation.y = time * 0.05;
      }

      // Animate nebula clouds
      nebulaCloudsRef.current.forEach((cloud, index) => {
        cloud.rotation.y = time * (0.1 + index * 0.05);
        cloud.rotation.z = time * 0.03;
        
        const scale = 1 + Math.sin(time + index) * 0.1;
        cloud.scale.set(scale, scale, scale);
      });

      // Animate planets
      planetsRef.current.forEach((planet, index) => {
        planet.rotation.y += 0.001 * (index + 1);
        if (index === 3 && planet.children[0].type === 'Mesh' && planet.children[0].geometry.type === 'SphereGeometry') { // Earth's clouds
          planet.children[0].rotation.y += 0.0015;
        }
        if (index === 3 && planet.children[1] && planet.children[1].type === 'Mesh' && planet.children[1].geometry.type === 'SphereGeometry') { // Earth's moon
          const moonOrbitRadius = 20;
          const moonOrbitSpeed = 0.5;
          const angle = time * moonOrbitSpeed;
          planet.children[1].position.x = planet.position.x + Math.cos(angle) * moonOrbitRadius;
          planet.children[1].position.z = planet.position.z + Math.sin(angle) * moonOrbitRadius;
        }
      });

      // Animate path - this is no longer rendered, so removed here
      // if (travelPathRef.current && travelPathRef.current.material) {
      //   travelPathRef.current.material.uniforms.time.value = time;
      // }

      // Update rocket
      updateRocket(time);

      // Check distance to planets (for info panels)
      checkPlanetProximity();

      // Update camera
      updateCamera();

      // Update barrel roll cooldown
      if (barrelRollRef.current.cooldown > 0) {
        barrelRollRef.current.cooldown -= 0.016;
      }

      renderer.render(scene, camera);
    };

    animate();
    setLoading(false);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mozpointerlockchange', onPointerLockChange);
      document.removeEventListener('webkitpointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Cleanup audio
      if (currentSoundRef.current) {
        currentSoundRef.current.forEach(node => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch (e) {
            // Ignore
          }
        });
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isMoving, showControls, freeRoamMode, isMobile, isTablet]); // Added isMobile, isTablet to dependency array

  const createStarfield = (scene) => {
    // Adjust star count based on device
    const starCount = isMobile ? 1000 : (isTablet ? 2000 : 5000);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const opacities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const radius = 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius * Math.cbrt(Math.random());

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const distance = Math.sqrt(
        positions[i * 3] ** 2 + 
        positions[i * 3 + 1] ** 2 + 
        positions[i * 3 + 2] ** 2
      );
      const brightness = 1 - (distance / radius) * 0.5;

      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness;

      sizes[i] = Math.random() * 2 + 0.5;
      opacities[i] = Math.random() * 0.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(geometry, material);
    starsRef.current = stars;
    scene.add(stars);
  };

  const createNebulaClouds = (scene) => {
    const cloudConfigs = [
      { color: 0xB565D8, position: [-150, 50, -200], count: 800, spread: 80 },
      { color: 0x1B98F5, position: [120, -30, -250], count: 1000, spread: 100 },
      { color: 0xFF006E, position: [-80, 80, -180], count: 600, spread: 60 },
      { color: 0x9D4EDD, position: [150, 20, -300], count: 700, spread: 90 }
    ];

    cloudConfigs.forEach((config) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(config.count * 3);
      const sizes = new Float32Array(config.count);

      for (let i = 0; i < config.count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * config.spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * config.spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * config.spread;
        sizes[i] = Math.random() * 4 + 2;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 3,
        color: config.color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });

      const cloud = new THREE.Points(geometry, material);
      cloud.position.set(...config.position);
      nebulaCloudsRef.current.push(cloud);
      scene.add(cloud);

      const pointLight = new THREE.PointLight(config.color, 2, 150);
      pointLight.position.set(...config.position);
      scene.add(pointLight);
    });
  };

  const createPlanets = (scene) => {
    waypoints.forEach((waypoint, index) => {
      const geometry = new THREE.SphereGeometry(waypoint.radius, 64, 64);
      
      // Create more realistic planet materials
      let material;
      
      switch(index) {
        case 0: // Sun
          material = new THREE.MeshPhongMaterial({
            color: 0xFDB813,
            emissive: 0xFFA500,
            emissiveIntensity: 1.0,
            shininess: 100
          });
          break;
        case 1: // Mercury - gray rocky
          material = new THREE.MeshPhongMaterial({
            color: 0x8C7853,
            emissive: 0x4A4A4A,
            emissiveIntensity: 0.1,
            shininess: 5,
            roughness: 0.9
          });
          break;
        case 2: // Venus - yellowish
          material = new THREE.MeshPhongMaterial({
            color: 0xFFC649,
            emissive: 0xE5AB3A,
            emissiveIntensity: 0.3,
            shininess: 30
          });
          break;
        case 3: // Earth - blue/green
          material = new THREE.MeshPhongMaterial({
            color: 0x2B65EC,
            emissive: 0x1B4D9C,
            emissiveIntensity: 0.2,
            shininess: 50,
            specular: 0x4488FF
          });
          break;
        case 4: // Mars - red/orange
          material = new THREE.MeshPhongMaterial({
            color: 0xCD5C5C,
            emissive: 0x8B2500,
            emissiveIntensity: 0.3,
            shininess: 10
          });
          break;
        case 5: // Jupiter - orange/brown bands
          material = new THREE.MeshPhongMaterial({
            color: 0xC88B3A,
            emissive: 0xA67C52,
            emissiveIntensity: 0.3,
            shininess: 40
          });
          break;
        case 6: // Saturn - pale yellow
          material = new THREE.MeshPhongMaterial({
            color: 0xFAD5A5,
            emissive: 0xE5BE8F,
            emissiveIntensity: 0.2,
            shininess: 60
          });
          break;
        case 7: // Neptune - deep blue
          material = new THREE.MeshPhongMaterial({
            color: 0x4169E1,
            emissive: 0x1E3A8A,
            emissiveIntensity: 0.4,
            shininess: 80,
            specular: 0x6495ED
          });
          break;
        default:
          material = new THREE.MeshPhongMaterial({
            color: waypoint.color,
            emissive: waypoint.color,
            emissiveIntensity: 0.3,
            shininess: 30
          });
      }
      
      const planet = new THREE.Mesh(geometry, material);
      planet.position.set(...waypoint.position);
      planet.userData = { ...waypoint, index };
      
      // Atmosphere glow
      const glowGeometry = new THREE.SphereGeometry(waypoint.radius * 1.15, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: waypoint.color,
        transparent: true,
        opacity: index === 0 ? 0.4 : 0.2,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      planet.add(glow);

      // Point light
      const pointLight = new THREE.PointLight(waypoint.color, index === 0 ? 8 : 3, 150);
      pointLight.position.set(0, 0, 0);
      planet.add(pointLight);

      // Add Earth's clouds
      if (index === 3) {
        const cloudGeometry = new THREE.SphereGeometry(waypoint.radius * 1.02, 32, 32);
        const cloudMaterial = new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        planet.add(clouds);
        
        // Moon
        const moonGeometry = new THREE.SphereGeometry(2, 16, 16);
        const moonMaterial = new THREE.MeshPhongMaterial({
          color: 0xCCCCCC,
          emissive: 0x555555,
          emissiveIntensity: 0.1,
          shininess: 5
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(20, 0, 0); // Initial position relative to Earth
        planet.add(moon);
      }

      // Add Jupiter's Great Red Spot effect
      if (index === 5) {
        const spotGeometry = new THREE.SphereGeometry(waypoint.radius * 0.3, 16, 16);
        const spotMaterial = new THREE.MeshBasicMaterial({
          color: 0xFF6347,
          transparent: true,
          opacity: 0.6
        });
        const spot = new THREE.Mesh(spotGeometry, spotMaterial);
        spot.position.set(waypoint.radius * 0.7, 0, 0); // Position it on the surface
        planet.add(spot);
      }

      // Add Saturn's rings
      if (index === 6) {
        const ringGeometry = new THREE.RingGeometry(waypoint.radius * 1.5, waypoint.radius * 2.2, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({
          color: 0xC9A961,
          emissive: 0xB8924A,
          emissiveIntensity: 0.2,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
          shininess: 30
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2 + 0.3; // Tilt the rings
        planet.add(ring);
        
        // Add ring shadow/detail
        const ringGeometry2 = new THREE.RingGeometry(waypoint.radius * 1.8, waypoint.radius * 2.0, 64);
        const ringMaterial2 = new THREE.MeshBasicMaterial({
          color: 0xA08040,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4
        });
        const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
        ring2.rotation.x = Math.PI / 2 + 0.3; // Same tilt as main ring
        planet.add(ring2);
      }

      // Waypoint indicator node (glowing sphere)
      const nodeGeometry = new THREE.SphereGeometry(2, 16, 16);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(...waypoint.position);
      node.position.y += waypoint.radius + 15;
      scene.add(node);

      planetsRef.current.push(planet);
      scene.add(planet);
    });
  };

  const createTravelPath = (scene) => {
    // Create curve points from waypoints (including return to start)
    const points = waypoints.map(wp => new THREE.Vector3(...wp.position));
    points.push(new THREE.Vector3(...waypoints[0].position)); // Close the loop

    // Create smooth curve with tension
    const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
    
    // Store the path curve for rocket movement (but don't render it)
    pathProgressRef.current = curve;
  };

  const createRocket = (scene) => {
    const rocketGroup = new THREE.Group();
    rocketGroupRef.current = rocketGroup;
    
    // Main body
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 1, 3, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x00D9FF,
      emissiveIntensity: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    rocketGroup.add(body);

    // Nose cone
    const noseGeometry = new THREE.ConeGeometry(0.8, 1.5, 8);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: 0xE0E0E0,
      metalness: 0.9,
      roughness: 0.1
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.y = 2.25;
    rocketGroup.add(nose);

    // Neon accent lines
    const accentMaterial = new THREE.MeshBasicMaterial({
      color: 0x00D9FF,
      transparent: true,
      opacity: 0.9
    });
    
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(1.05, 0.05, 8, 16);
      const ring = new THREE.Mesh(ringGeometry, accentMaterial);
      ring.position.y = -0.5 + i * 0.5;
      ring.rotation.x = Math.PI / 2;
      rocketGroup.add(ring);
    }

    // Wings
    const wingGeometry = new THREE.BoxGeometry(0.1, 1.5, 1);
    const wingMaterial = new THREE.MeshStandardMaterial({
      color: 0xA0A0A0,
      metalness: 0.7,
      roughness: 0.3
    });

    const wingPositions = [
      { x: 1.2, z: 0, rotation: 0 },
      { x: -1.2, z: 0, rotation: 0 },
      { x: 0, z: 1.2, rotation: Math.PI / 2 },
      { x: 0, z: -1.2, rotation: Math.PI / 2 }
    ];

    wingPositions.forEach((pos, index) => {
      const wing = new THREE.Mesh(wingGeometry, wingMaterial);
      wing.position.set(pos.x, -1, pos.z);
      wing.rotation.y = pos.rotation;
      rocketGroup.add(wing);

      // Indicator lights
      const lightColor = (index < 2) ? 0x00FF00 : 0xFF0000;
      const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const lightMaterial = new THREE.MeshBasicMaterial({ color: lightColor });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(pos.x * 0.8, -0.5, pos.z * 0.8);
      rocketGroup.add(light);
    });

    // Engine particles
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 0.8;
      particlePositions[i * 3 + 1] = -2.5 - Math.random() * 5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      particleSizes[i] = Math.random() * 0.8 + 0.3;
      
      const t = Math.random();
      particleColors[i * 3] = 1;
      particleColors[i * 3 + 1] = 0.4 + t * 0.6;
      particleColors[i * 3 + 2] = t * 0.8;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const thrustParticles = new THREE.Points(particleGeometry, particleMaterial);
    rocketGroup.add(thrustParticles);
    thrustParticlesRef.current.push(thrustParticles);

    // Position at first waypoint
    rocketGroup.position.set(
      waypoints[0].position[0],
      waypoints[0].position[1] + waypoints[0].radius + 20,
      waypoints[0].position[2]
    );
    rocketRef.current = rocketGroup;
    scene.add(rocketGroup);
  };

  const checkPlanetProximity = () => {
    if (!rocketGroupRef.current) return;
    
    const rocketPos = rocketGroupRef.current.position;
    const triggerDistance = 30;
    
    let closestPlanet = null;
    let closestDistance = Infinity;
    
    // Check distance to each planet
    waypoints.forEach((waypoint, index) => {
      const planetPos = new THREE.Vector3(...waypoint.position);
      const distance = rocketPos.distanceTo(planetPos) - waypoint.radius;
      
      // Track closest planet
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlanet = { ...waypoint, distance: Math.round(distance), index };
      }
      
      // If within trigger distance and not already at this planet
      if (distance < triggerDistance && (!selectedPlanet || selectedPlanet.index !== index)) {
        setSelectedPlanet(waypoint);
        setCurrentWaypoint(index);
        setCurrentSector(waypoint.name);
        
        if (!freeRoamMode) {
          setIsOrbiting(true);
        }
        
        if (!visitedPlanets.includes(index)) {
          setVisitedPlanets([...visitedPlanets, index]);
        }
        // Don't automatically show mobile panel here - wait for arrival
      }
      
      // If we move away from selected planet
      if (selectedPlanet && distance > triggerDistance * 2 && selectedPlanet.index === index) {
        setSelectedPlanet(null);
        if (!freeRoamMode) {
          setIsOrbiting(false);
        }
        if (isMobile || isTablet) {
          setShowMobilePlanetPanel(false);
        }
      }
    });
    
    // Update nearest planet for navigation arrow (only in tour mode)
    if (!freeRoamMode) {
      if (closestDistance > 100 && !isMoving) {
        setNearestPlanet(closestPlanet);
        if (!selectedPlanet) {
          setCurrentSector('Deep Space');
        }
      } else {
        setNearestPlanet(null);
        if (closestPlanet && !isMoving) {
          setCurrentSector(closestPlanet.name);
        }
      }

      // Update sector during movement
      if (isMoving) {
        setCurrentSector('Traveling');
        setNearestPlanet(null);
      }
    } else {
      // Free roam mode
      if (closestPlanet && closestDistance < 100) {
        setCurrentSector(closestPlanet.name);
      } else {
        setCurrentSector('Free Roam');
      }
      setNearestPlanet(null);
    }
  };

  const moveToNextPlanet = () => {
    const next = (currentWaypoint + 1) % waypoints.length;
    startTravelToPlanet(next);
  };

  const moveToPreviousPlanet = () => {
    const prev = (currentWaypoint - 1 + waypoints.length) % waypoints.length;
    startTravelToPlanet(prev);
  };
  
  const jumpToPlanet = (index) => {
    startTravelToPlanet(index);
    if (isMobile || isTablet) {
      setShowQuickNav(false); // Close quick nav on selection
    }
  };

  const startTravelToPlanet = (targetIndex) => {
    setIsMoving(true);
    setIsOrbiting(false);
    setSelectedPlanet(null);
    setShowMobilePlanetPanel(false); // Hide mobile panel when moving
    
    const duration = 4000; // 4 seconds for longer paths
    const startTime = Date.now();
    const startWaypoint = currentWaypoint;
    
    const travel = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Boost speed multiplier
      const speedMultiplier = (keysRef.current.shift || mobileBoostRef.current) ? 1.5 : 1;
      const adjustedProgress = Math.min(eased * speedMultiplier, 1);
      
      setIsBoosting(keysRef.current.shift || mobileBoostRef.current);
      setPathProgress(adjustedProgress * 100);
      
      // Calculate position along path
      if (pathProgressRef.current) {
        const totalSegments = waypoints.length;
        // The curve is already closed, so `t` goes from 0 to 1 over the whole loop.
        // We need to map `adjustedProgress` to a segment on this loop.
        
        // Calculate normalized 't' values for start and target waypoints
        const startTNormalized = startWaypoint / totalSegments;
        const targetTNormalized = targetIndex / totalSegments;
        
        let currentT;
        // Determine the shortest path direction on a closed loop
        if (Math.abs(targetTNormalized - startTNormalized) <= 0.5) {
          // Direct path is shorter
          currentT = startTNormalized + (targetTNormalized - startTNormalized) * adjustedProgress;
        } else {
          // Path wrapping around the loop is shorter
          if (targetTNormalized > startTNormalized) { // Moving clockwise past loop end (e.g., 6->0)
            currentT = startTNormalized + ((targetTNormalized - 1) - startTNormalized + 1) * adjustedProgress;
          } else { // Moving anti-clockwise past loop start (e.g., 0->6)
            currentT = startTNormalized + ((targetTNormalized + 1) - startTNormalized) * adjustedProgress;
          }
          currentT = currentT % 1; // Ensure t stays between 0 and 1
        }
        
        // Ensure t is always between 0 and 1. CatmullRomCurve3 handles it, but good for clarity.
        currentT = Math.max(0, Math.min(1, currentT));
        
        const position = pathProgressRef.current.getPointAt(currentT);
        const tangent = pathProgressRef.current.getTangentAt(currentT);
        
        if (rocketGroupRef.current) {
          rocketGroupRef.current.position.copy(position);
          
          // Rotate to face direction of travel
          const lookAtPos = new THREE.Vector3().addVectors(position, tangent);
          rocketGroupRef.current.lookAt(lookAtPos);
          rocketGroupRef.current.rotateX(Math.PI / 2);
        }
      }
      
      if (progress < 1) {
        requestAnimationFrame(travel);
      } else {
        arriveAtPlanet(targetIndex);
      }
    };
    
    travel();
  };


  const arriveAtPlanet = (index) => {
    setCurrentWaypoint(index);
    setIsMoving(false);
    setIsOrbiting(true);
    setPathProgress(0);
    setSelectedPlanet(waypoints[index]);
    setCurrentSector(waypoints[index].name);
    
    if (!visitedPlanets.includes(index)) {
      setVisitedPlanets([...visitedPlanets, index]);
    }
    
    // Position rocket in orbit
    const planet = planetsRef.current[index];
    if (planet && rocketGroupRef.current) {
      const orbitRadius = waypoints[index].radius + 25;
      rocketGroupRef.current.position.set(
        planet.position.x + orbitRadius,
        planet.position.y,
        planet.position.z
      );
    }
    
    // Show mobile planet panel only when actually arriving
    if (isMobile || isTablet) {
      setShowMobilePlanetPanel(true);
    }
  };

  const stopAtWaypoint = () => {
    // Find closest waypoint
    if (!rocketGroupRef.current) return;
    
    const rocketPos = rocketGroupRef.current.position;
    let closestIndex = 0;
    let closestDist = Infinity;
    
    waypoints.forEach((wp, index) => {
      const dist = rocketPos.distanceTo(new THREE.Vector3(...wp.position));
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = index;
      }
    });
    
    arriveAtPlanet(closestIndex);
  };

  const triggerBarrelRoll = () => {
    barrelRollRef.current = { active: true, progress: 0, cooldown: 3 };
    setShowBarrelRollText(true);
    setTimeout(() => setShowBarrelRollText(false), 1500);
  };

  const updateRocket = (time) => {
    if (!rocketGroupRef.current || !cameraRef.current) return;

    const rocket = rocketGroupRef.current;
    let currentSpeed = 0;

    if (freeRoamMode) {
      // Free roam movement
      const moveSpeed = 0.3; // Slow speed for easy control
      const boostMultiplier = (keysRef.current.shift || mobileBoostRef.current) ? 2 : 1;
      const damping = 0.92;
      
      let moveForward = 0, moveRight = 0, moveUp = 0;

      if (isMobile || isTablet) {
          // Mobile joystick input
          moveForward = joystickInputRef.current.y * 1; // y is forward/backward
          moveRight = joystickInputRef.current.x * 1;  // x is strafe left/right
          setIsBoosting(mobileBoostRef.current);
      } else {
          // Desktop keyboard input
          if (keysRef.current.w) moveForward = 1;
          if (keysRef.current.s) moveForward = -0.7; // Slower reverse
          if (keysRef.current.a) moveRight = -0.5;
          if (keysRef.current.d) moveRight = 0.5;
          if (keysRef.current.q) moveUp = -0.5;
          if (keysRef.current.e) moveUp = 0.5;
          setIsBoosting(keysRef.current.shift);
      }

      // Get forward direction from yaw and pitch (where rocket is pointing)
      const forward = new THREE.Vector3();
      forward.x = -Math.sin(yawRef.current) * Math.cos(pitchRef.current);
      forward.y = Math.sin(pitchRef.current);
      forward.z = -Math.cos(yawRef.current) * Math.cos(pitchRef.current);
      forward.normalize();
      
      // Right vector (perpendicular to forward)
      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
      
      // Up vector (world up)
      const up = new THREE.Vector3(0, 1, 0);
      
      const acceleration = new THREE.Vector3();
      
      // Apply movement based on computed forward/right/up values
      acceleration.add(forward.clone().multiplyScalar(moveForward * moveSpeed * boostMultiplier));
      acceleration.add(right.clone().multiplyScalar(moveRight * moveSpeed * boostMultiplier));
      acceleration.add(up.clone().multiplyScalar(moveUp * moveSpeed * boostMultiplier));
      
      // Apply acceleration to velocity
      freeRoamVelocityRef.current.add(acceleration);
      
      // Apply damping
      freeRoamVelocityRef.current.multiplyScalar(damping);
      
      // Calculate new position
      const newPosition = rocket.position.clone().add(freeRoamVelocityRef.current);
      
      // Collision detection with planets
      waypoints.forEach((waypoint) => {
        const planetPos = new THREE.Vector3(...waypoint.position);
        const distance = newPosition.distanceTo(planetPos);
        const safeDistance = waypoint.radius + 8; // 8 units clearance from surface
        
        if (distance < safeDistance) {
          // Push rocket away from planet
          const pushDirection = newPosition.clone().sub(planetPos).normalize();
          newPosition.copy(planetPos).add(pushDirection.multiplyScalar(safeDistance));
          // Reduce velocity towards planet
          freeRoamVelocityRef.current.multiplyScalar(0.5); // Dampen velocity
          
          // Optionally, also reduce velocity perpendicular to push direction if desired,
          // but just dampening the whole vector is often good enough for arcade feel.
        }
      });
      
      // Update position
      rocket.position.copy(newPosition);
      
      // Orient rocket to point where mouse is looking (yaw and pitch)
      const lookTarget = new THREE.Vector3().addVectors(
        rocket.position,
        forward.clone().multiplyScalar(10)
      );
      rocket.lookAt(lookTarget);
      rocket.rotateX(Math.PI / 2); // Adjust for rocket model orientation
      
      // Calculate speed
      currentSpeed = freeRoamVelocityRef.current.length() * 100;
      setIsBoosting(isMobile || isTablet ? mobileBoostRef.current : keysRef.current.shift && freeRoamVelocityRef.current.length() > 0.1);
      
      // Update thrust particles
      thrustParticlesRef.current.forEach((particles) => {
        if (particles.material) {
          const particleOpacity = freeRoamVelocityRef.current.length() > 0.05 ? (isBoosting ? 1 : 0.7) : 0.1;
          particles.material.opacity = particleOpacity;
        }

        if (particles.geometry && particles.geometry.attributes.position) {
          const positions = particles.geometry.attributes.position.array;
          const particleSpeed = freeRoamVelocityRef.current.length() > 0.05 ? (isBoosting ? 0.8 : 0.5) : 0.1;
          
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= particleSpeed;
            if (positions[i + 1] < -15) {
              positions[i + 1] = -2.5;
              positions[i] = (Math.random() - 0.5) * 0.8;
              positions[i + 2] = (Math.random() - 0.5) * 0.8;
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
        }
      });
    } else {
      // Tour mode - existing rocket behavior
      // Barrel roll animation (desktop only for now)
      if (!isMobile && !isTablet && barrelRollRef.current.active) {
        barrelRollRef.current.progress += 0.04;
        rocket.rotation.z = barrelRollRef.current.progress * Math.PI * 2;
        
        if (barrelRollRef.current.progress >= 1) {
          barrelRollRef.current.active = false;
          barrelRollRef.current.progress = 0;
          rocket.rotation.z = 0;
        }
      }

      // Orbit animation when at planet
      if (isOrbiting && !isMoving) {
        const planet = planetsRef.current[currentWaypoint];
        if (planet) {
          const orbitRadius = waypoints[currentWaypoint].radius + 25;
          const orbitSpeed = 0.3;
          const angle = time * orbitSpeed;
          
          rocket.position.x = planet.position.x + Math.cos(angle) * orbitRadius;
          rocket.position.z = planet.position.z + Math.sin(angle) * orbitRadius;
          rocket.position.y = planet.position.y;
          
          // Look at planet
          rocket.lookAt(planet.position);
          rocket.rotateX(Math.PI / 2);
          
          currentSpeed = orbitSpeed * orbitRadius * 0.1;
        }
      }

      // Idle bobbing
      if (!isMoving && isOrbiting) {
        const bob = Math.sin(time * 2) * 0.3;
        rocket.position.y += bob * 0.01;
      }

      // Calculate speed from movement
      if (isMoving) {
        currentSpeed = (keysRef.current.shift || mobileBoostRef.current) ? 3 : 1.5;
      }

      setIsBoosting(keysRef.current.shift || mobileBoostRef.current && isMoving);

      // Update thrust particles
      thrustParticlesRef.current.forEach((particles) => {
        if (particles.material) {
          particles.material.opacity = isMoving ? (isBoosting ? 1 : 0.7) : 0.3;
        }

        if (particles.geometry && particles.geometry.attributes.position) {
          const positions = particles.geometry.attributes.position.array;
          const speed = isMoving ? (isBoosting ? 0.5 : 0.3) : 0.1;
          
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= speed;
            if (positions[i + 1] < -15) {
              positions[i + 1] = -2.5;
              positions[i] = (Math.random() - 0.5) * 0.8;
              positions[i + 2] = (Math.random() - 0.5) * 0.8;
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
        }
      });
    }

    setSpeed(Math.round(currentSpeed * 100));
  };

  const updateCamera = () => {
    if (!rocketGroupRef.current || !cameraRef.current) return;

    const rocket = rocketGroupRef.current;
    const camera = cameraRef.current;

    if (freeRoamMode) {
      // Free roam camera - third person view always behind rocket
      const cameraDistance = 40; // Distance behind rocket
      const cameraHeight = 10; // Height above rocket
      
      // Get rocket's forward direction (where it's pointing)
      const forward = new THREE.Vector3();
      forward.x = -Math.sin(yawRef.current) * Math.cos(pitchRef.current);
      forward.y = Math.sin(pitchRef.current);
      forward.z = -Math.cos(yawRef.current) * Math.cos(pitchRef.current);
      forward.normalize();
      
      // Position camera behind the rocket (opposite of forward direction)
      const cameraOffset = forward.clone().multiplyScalar(-cameraDistance);
      cameraOffset.y += cameraHeight;
      
      const targetCameraPosition = new THREE.Vector3().addVectors(rocket.position, cameraOffset);
      camera.position.lerp(targetCameraPosition, 0.1);
      
      // Look at a point ahead of the rocket
      const lookAtPoint = new THREE.Vector3().addVectors(rocket.position, forward.clone().multiplyScalar(20));
      camera.lookAt(lookAtPoint);
    } else {
      // Tour mode camera - cinematic view showing both planet and rocket
      if (isOrbiting && !isMoving) {
        const planet = planetsRef.current[currentWaypoint];
        if (planet) {
          // Position camera to frame both planet and rocket
          const cameraDistance = (isMobile || isTablet) ? 80 : 60; // Further back on mobile
          const angle = Date.now() * 0.0001; // Slow rotation
          
          const cameraPos = new THREE.Vector3(
            planet.position.x + Math.cos(angle) * cameraDistance,
            planet.position.y + 20,
            planet.position.z + Math.sin(angle) * cameraDistance
          );
          
          camera.position.lerp(cameraPos, 0.05);
          
          // Look at a point between the planet and rocket
          const lookAtPoint = new THREE.Vector3(
            (planet.position.x + rocket.position.x) / 2,
            planet.position.y,
            (planet.position.z + rocket.position.z) / 2
          );
          camera.lookAt(lookAtPoint);
        }
      } else {
        // During movement or other states
        const keys = keysRef.current;

        // Camera orbit controls (A/D keys on desktop, or simply follow on mobile)
        if (!isMobile && !isTablet) {
          if (keys.a) {
            cameraAngleRef.current += 0.02;
          }
          if (keys.d) {
            cameraAngleRef.current -= 0.02;
          }
        }
        
        // Camera position behind rocket
        const cameraDistance = (isMobile || isTablet) ? 40 : 30;
        const cameraHeight = (isMobile || isTablet) ? 15 : 10; // Adjusted for better view on mobile
        
        const targetCameraPosition = new THREE.Vector3(
          rocket.position.x - Math.sin(cameraAngleRef.current) * cameraDistance,
          rocket.position.y + cameraHeight,
          rocket.position.z - Math.cos(cameraAngleRef.current) * cameraDistance
        );

        camera.position.lerp(targetCameraPosition, 0.1);
        camera.lookAt(rocket.position);
      }
    }
  };

  const resetPosition = () => {
    if (rocketGroupRef.current) {
      const waypoint = waypoints[0];
      rocketGroupRef.current.position.set(
        waypoint.position[0],
        waypoint.position[1] + waypoint.radius + 20,
        waypoint.position[2]
      );
      rocketGroupRef.current.rotation.set(0, 0, 0);
      setCurrentWaypoint(0);
      setIsMoving(false);
      setIsOrbiting(true);
      setSelectedPlanet(waypoint);
      setCurrentSector(waypoint.name);
      cameraAngleRef.current = 0;
      setVisitedPlanets([0]);
      
      // Reset free roam states if active
      if (freeRoamMode) {
        toggleFreeRoam(); // This will exit free roam, trigger pointerlock exit, and reset velocity/camera
      }
      // Ensure free roam refs are reset regardless
      freeRoamVelocityRef.current.set(0, 0, 0);
      yawRef.current = 0;
      pitchRef.current = 0;
      joystickInputRef.current = { x: 0, y: 0 }; // Reset mobile joystick
      mobileBoostRef.current = false; // Reset mobile boost
      if (isMobile || isTablet) {
        setShowMobilePlanetPanel(true);
        setShowQuickNav(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Update rocket movement for mobile (tour mode)
  useEffect(() => {
    if (!isMobile || freeRoamMode) return;
    
    const handleMobileMovement = () => {
      const { x, y } = joystickInputRef.current;
      
      if (Math.abs(x) > 0.2 || Math.abs(y) > 0.2) {
        if (y > 0.5 && !isMoving) { // Forward
          moveToNextPlanet();
        } else if (y < -0.5 && !isMoving) { // Backward
          moveToPreviousPlanet();
        }
      }
      
      keysRef.current.shift = mobileBoostRef.current;
    };
    
    const interval = setInterval(handleMobileMovement, 100);
    return () => clearInterval(interval);
  }, [isMobile, isMoving, freeRoamMode, joystickInputRef.current.x, joystickInputRef.current.y]);

  return (
    <div className="relative w-full h-screen bg-[#000814] overflow-hidden">
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#000814]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl font-light tracking-wide">Initializing Universe...</p>
          </div>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" onClick={() => {
          if (freeRoamMode && containerRef.current && !document.pointerLockElement && !isMobile && !isTablet) { // Preserve original condition for pointerlock
              containerRef.current.requestPointerLock();
          }
      }} />

      {/* MOBILE UI ELEMENTS */}
      {(isMobile || isTablet) && (
        <>
          {/* Mobile Overlay for Free Roam (when not locked) - Preserved */}
          {freeRoamMode && !pointerLocked && (
            <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center text-center">
              <div className="p-4 rounded-lg bg-gray-900/90 text-white border border-gray-700">
                <p className="text-xl mb-2">Tap to start free roam!</p>
                <p className="text-sm text-gray-400">Use joystick for movement, boost button for speed.</p>
                <Button onClick={toggleFreeRoam} className="mt-4">Exit Free Roam</Button>
              </div>
            </div>
          )}

          {/* Mobile Controls (Joystick, Boost, Barrel Roll) - Preserved, for FREE ROAM */}
          {freeRoamMode && pointerLocked && (
            <MobileControls
              joystickInputRef={joystickInputRef}
              mobileBoostRef={mobileBoostRef}
              pitchRef={pitchRef}
              yawRef={yawRef}
              onMove={handleMobileMove}
              onBoost={handleMobileBoost}
            />
          )}

          {/* NEW Mobile Controls for TOUR MODE (from outline) */}
          {(!freeRoamMode && !loading) && ( // Apply only if not in free roam, and not loading
            <MobileControls
              onMove={handleMobileMove}
              onBoost={handleMobileBoost}
              onMenuOpen={() => setShowQuickNav(true)}
              isBoosting={isBoosting}
              isMoving={isMoving}
            />
          )}
          
          {/* QUICK NAV MENU */}
          <QuickNavMenu
            isOpen={showQuickNav}
            onClose={() => setShowQuickNav(false)}
            waypoints={waypoints}
            onSelectPlanet={handleQuickNavSelect}
            visitedPlanets={visitedPlanets}
          />

          {/* MOBILE PLANET PANEL */}
          {showMobilePlanetPanel && selectedPlanet && ( // Only show on mobile if specified, as per original logic, not outline's `isMobile` check
            <MobilePlanetPanel
              planet={selectedPlanet}
              onClose={() => setShowMobilePlanetPanel(false)}
              onNext={moveToNextPlanet}
              onPrevious={moveToPreviousPlanet}
              currentIndex={currentWaypoint}
              totalPlanets={waypoints.length}
              visitedPlanets={visitedPlanets}
            />
          )}

          {/* Reset Button for mobile - Preserved in original top-left position */}
          <Button onClick={resetPosition} size="icon" className="absolute top-4 left-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white">
            <Home className="w-5 h-5" />
          </Button>

          {/* Mobile Free Roam Toggle Button - Preserved in original top-right position */}
          <Button
            onClick={toggleFreeRoam}
            disabled={isMoving}
            size="icon"
            className={`absolute top-4 right-4 z-10 backdrop-blur-md border ${
              freeRoamMode
                ? 'bg-green-500/20 hover:bg-green-500/30 border-green-400/50 text-green-300'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
          >
            {freeRoamMode ? <Navigation className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
          </Button>
        </>
      )}

      {/* DESKTOP/TABLET TOP-LEFT HUD */}
      {showControls && !isMobile && ( // Show on desktop and tablet, if controls are visible
        <div className="absolute top-6 left-6 z-10 space-y-3">
          {/* Mode Indicator */}
          <div 
            className="backdrop-blur-md rounded-lg px-4 py-2 border"
            style={{
              background: 'rgba(15, 15, 31, 0.7)',
              borderColor: freeRoamMode ? '#00FF88' : '#00D9FF',
              boxShadow: freeRoamMode 
                ? '0 0 15px rgba(0, 255, 136, 0.4)' 
                : '0 0 10px rgba(0, 217, 255, 0.2)'
            }}
          >
            <div className="text-xs text-cyan-300/60 uppercase tracking-wider mb-1">Mode</div>
            <div className={`font-mono font-bold ${freeRoamMode ? 'text-green-400' : 'text-cyan-400'}`}>
              {freeRoamMode ? 'FREE ROAM' : 'TOUR'}
            </div>
          </div>

          {/* Speed Indicator */}
          <div 
            className="backdrop-blur-md rounded-lg px-4 py-2 border"
            style={{
              background: 'rgba(15, 15, 31, 0.7)',
              borderColor: '#00D9FF',
              boxShadow: '0 0 10px rgba(0, 217, 255, 0.2)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="text-xs text-cyan-300/60 uppercase tracking-wider">Velocity</div>
              <div className="text-cyan-400 font-mono font-bold text-lg">{speed}</div>
              <div className="text-xs text-cyan-300/60">km/s</div>
            </div>
          </div>

          {!freeRoamMode && (
            <>
              {/* Sector Indicator */}
              <div 
                className="backdrop-blur-md rounded-lg px-4 py-2 border"
                style={{
                  background: 'rgba(15, 15, 31, 0.7)',
                  borderColor: '#00D9FF',
                  boxShadow: '0 0 10px rgba(0, 217, 255, 0.2)'
                }}
              >
                <div className="text-xs text-cyan-300/60 uppercase tracking-wider mb-1">Sector</div>
                <div className="text-cyan-400 font-mono font-semibold">{currentSector}</div>
              </div>

              {/* Boost Status */}
              <div 
                className="backdrop-blur-md rounded-lg px-4 py-2 border"
                style={{
                  background: 'rgba(15, 15, 31, 0.7)',
                  borderColor: isBoosting ? '#00FF88' : '#00D9FF',
                  boxShadow: isBoosting 
                    ? '0 0 15px rgba(0, 255, 136, 0.4)' 
                    : '0 0 10px rgba(0, 217, 255, 0.2)'
                }}
              >
                <div className="text-xs text-cyan-300/60 uppercase tracking-wider mb-1">Boost</div>
                <div className={`font-mono font-bold ${isBoosting ? 'text-green-400' : 'text-cyan-400'}`}>
                  {isBoosting ? 'ACTIVE' : 'READY'}
                </div>
              </div>
            </>
          )}

          {/* Sound Controls */}
          <div 
            className="backdrop-blur-md rounded-lg p-3 border space-y-2"
            style={{
              background: 'rgba(15, 15, 31, 0.7)',
              borderColor: '#00D9FF',
              boxShadow: '0 0 10px rgba(0, 217, 255, 0.2)'
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <Button
                onClick={toggleSound}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-cyan-400 hover:bg-cyan-500/20"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <div className="text-xs text-cyan-300/60 uppercase tracking-wider">
                {soundEnabled ? 'On' : 'Off'}
              </div>
            </div>
            {soundEnabled && (
              <div className="space-y-1">
                <div className="text-xs text-cyan-300/60">Volume</div>
                <Slider
                  value={[volume]}
                  onValueChange={(val) => setVolume(val[0])}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>
            )}
          </div>

          {/* Mode Toggle Button (Desktop/Tablet Only) */}
          <Button
            onClick={toggleFreeRoam}
            disabled={isMoving}
            size="sm"
            className={`w-full backdrop-blur-md border ${
              freeRoamMode 
                ? 'bg-green-500/20 hover:bg-green-500/30 border-green-400/50 text-green-300'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
          >
            {freeRoamMode ? <Navigation className="w-4 h-4 mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
            {freeRoamMode ? 'Exit Free Roam' : 'Free Roam Mode'}
          </Button>

          {/* Toggle Controls Button (Desktop/Tablet Only) */}
          <Button
            onClick={() => setShowControls(prev => !prev)}
            size="sm"
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white"
          >
            {showControls ? 'Hide' : 'Show'} Controls (H)
          </Button>
        </div>
      )}

      {/* MOBILE SECTOR INDICATOR */}
      {isMobile && !showMobilePlanetPanel && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div 
            className="backdrop-blur-md rounded-full px-6 py-3 border"
            style={{
              background: 'rgba(15, 15, 31, 0.8)',
              borderColor: '#00D9FF',
              boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)'
            }}
          >
            <div className="text-cyan-400 font-mono font-bold text-lg text-center">{currentSector}</div>
          </div>
        </div>
      )}

      {/* Toggle HUD Button - Always visible if controls are hidden */}
      {!showControls && !isMobile && (
        <Button
          onClick={() => setShowControls(prev => !prev)}
          size="sm"
          className="absolute top-6 left-6 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white"
        >
          Show HUD (H)
        </Button>
      )}

      {/* NAVIGATION ARROW */}
      {!isMobile && !freeRoamMode && nearestPlanet && nearestPlanet.name && !isMoving && showControls && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <div className="text-cyan-400 text-6xl">↓</div>
            <div 
              className="backdrop-blur-md rounded-lg px-4 py-2 border"
              style={{
                background: 'rgba(15, 15, 31, 0.9)',
                borderColor: '#00D9FF',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)'
              }}
            >
              <div className="text-cyan-400 font-mono text-sm">
                {nearestPlanet.name} - {nearestPlanet.distance}m
              </div>
              <div className="text-cyan-300/60 text-xs">
                {nearestPlanet.label}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS GUIDE */}
      {showControls && !freeRoamMode && !isMobile && (
        <div className="absolute bottom-6 left-6 z-10 w-80">
          <div 
            className="backdrop-blur-xl rounded-xl overflow-hidden"
            style={{
              background: 'rgba(15, 15, 31, 0.9)',
              border: '2px solid #00D9FF',
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
            }}
          >
            <div className="p-4 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
              <h3 className="text-white font-bold text-lg">Navigation Controls</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Next Planet</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  W
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Previous Planet</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Toggle HUD</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  H
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free Roam Instructions (Desktop/Tablet only) */}
      {!isMobile && !freeRoamMode && !pointerLocked && showControls && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div 
            className="backdrop-blur-xl rounded-xl p-6 border-2"
            style={{
              background: 'rgba(15, 15, 31, 0.95)',
              borderColor: '#00FF88',
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.4)'
            }}
          >
            <h3 className="text-green-400 font-bold text-xl mb-3 text-center">Free Roam Mode</h3>
            <p className="text-white text-sm mb-4 text-center">Click anywhere to start flying!</p>
            <div className="text-white/80 text-sm space-y-1">
              <p>🖱️ Mouse - Look around</p>
              <p>⌨️ W - Move forward</p>
              <p>⌨️ S - Move backward</p>
              <p>⌨️ A/D - Strafe left/right</p>
              <p>⌨️ Q/E - Move down/up</p>
              <p>⌨️ Shift - Boost</p>
              <p>⌨️ ESC - Exit free roam</p>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION ARROW (Desktop/Tablet only) */}
      {!isMobile && !freeRoamMode && nearestPlanet && nearestPlanet.name && !isMoving && showControls && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <div className="text-cyan-400 text-6xl">↓</div>
            <div 
              className="backdrop-blur-md rounded-lg px-4 py-2 border"
              style={{
                background: 'rgba(15, 15, 31, 0.9)',
                borderColor: '#00D9FF',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)'
              }}
            >
              <div className="text-cyan-400 font-mono text-sm">
                {nearestPlanet.name} - {nearestPlanet.distance}m
              </div>
              <div className="text-cyan-300/60 text-xs">
                {nearestPlanet.label}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS GUIDE - FREE ROAM (Desktop/Tablet only) */}
      {showControls && freeRoamMode && !isMobile && (
        <div className="absolute bottom-6 left-6 z-10 w-80">
          <div 
            className="backdrop-blur-xl rounded-xl overflow-hidden"
            style={{
              background: 'rgba(15, 15, 31, 0.9)',
              border: '2px solid #00D9FF',
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
            }}
          >
            <div className="p-4 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
              <h3 className="text-white font-bold text-lg">Free Roam Controls</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Look Around</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  Mouse
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Move Forward</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  W
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Move Backward</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Strafe</span>
                <div className="flex gap-1">
                  <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                    A
                  </kbd>
                  <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                    D
                  </kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Vertical</span>
                <div className="flex gap-1">
                  <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                    Q
                  </kbd>
                  <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                    E
                  </kbd>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cyan-400/20">
                <span className="text-white/70 text-sm">Boost Mode</span>
                <kbd className="px-3 py-1 bg-green-500/20 border border-green-400/50 rounded text-green-300 font-mono text-sm">
                  Shift
                </kbd>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cyan-400/20">
                <span className="text-white/70 text-sm">Exit Free Roam</span>
                <kbd className="px-3 py-1 bg-red-500/20 border border-red-400/50 rounded text-red-300 font-mono text-sm">
                  ESC
                </kbd>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cyan-400/20">
                <span className="text-white/70 text-sm">Toggle HUD</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  H
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS GUIDE - NAVIGATION/TOUR (Desktop/Tablet only) */}
      {showControls && !freeRoamMode && !isMobile && (
        <div className="absolute bottom-6 left-6 z-10 w-80">
          <div 
            className="backdrop-blur-xl rounded-xl overflow-hidden"
            style={{
              background: 'rgba(15, 15, 31, 0.9)',
              border: '2px solid #00D9FF',
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
            }}
          >
            <div className="p-4 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
              <h3 className="text-white font-bold text-lg">Navigation Controls</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Next Planet</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  W
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Previous Planet</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Toggle HUD</span>
                <kbd className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-sm">
                  H
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barrel Roll Text */}
      {showBarrelRollText && showControls && !isMobile && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="text-6xl font-bold text-cyan-400 animate-bounce" style={{
            textShadow: '0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.6)'
          }}>
            BARREL ROLL!
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {!freeRoamMode && isMoving && showControls && !isMobile && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 w-80">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-xs">
                {waypoints[currentWaypoint].name} → {waypoints[(currentWaypoint + 1) % waypoints.length].name}
              </span>
              <span className="text-cyan-400 text-xs font-mono">{Math.round(pathProgress)}%</span>
            </div>
            <div className="bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${pathProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Information Panel - DESKTOP ONLY */}
      {selectedPlanet && !isMoving && !isMobile && (
        <div 
          className="absolute top-20 right-6 z-20 w-[400px] max-h-[calc(100vh-120px)] animate-in slide-in-from-right duration-500"
          style={{
            fontFamily: "'Exo 2', 'Orbitron', monospace"
          }}
        >
          <div 
            className="backdrop-blur-xl rounded-xl overflow-hidden"
            style={{
              background: 'rgba(15, 15, 31, 0.85)',
              border: '2px solid #00D9FF',
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.3), inset 0 0 20px rgba(0, 217, 255, 0.1)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPlanet.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">{selectedPlanet.name}</h2>
                    <p className="text-cyan-400 text-sm font-medium">{selectedPlanet.label}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className="border-cyan-400 text-cyan-400 bg-cyan-500/10"
                >
                  {currentWaypoint + 1}/{waypoints.length}
                </Badge>
              </div>
              <div className="text-cyan-300 text-xs mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Approaching {selectedPlanet.name}...</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
              <div className="text-white/90 text-sm leading-relaxed whitespace-pre-line font-mono prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    a: ({node, ...props}) => (
                      <a 
                        {...props} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition-colors"
                      />
                    ),
                    p: ({node, ...props}) => <p {...props} className="mb-2" />
                  }}
                >
                  {selectedPlanet.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              {!freeRoamMode && (
                <>
                  <div className="flex gap-2 mb-3">
                    <Button
                      onClick={moveToPreviousPlanet}
                      disabled={isMoving}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      onClick={moveToNextPlanet}
                      disabled={isMoving}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}
              
              {/* Journey progress */}
              <div className={freeRoamMode ? '' : 'mt-3 pt-3 border-t border-cyan-400/20'}>
                <p className="text-cyan-300/60 text-xs mb-2 uppercase tracking-wider">Journey Progress</p>
                <div className="flex gap-1">
                  {waypoints.map((wp, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                        visitedPlanets.includes(index)
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-400 shadow-lg shadow-cyan-500/50'
                          : 'bg-white/20'
                      }`}
                      title={wp.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset and Fullscreen Controls */}
      {showControls && !isMobile && (
        <div className="absolute top-6 right-6 z-30 flex gap-2">
          <Button onClick={resetPosition} size="icon" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white">
            <Home className="w-5 h-5" />
          </Button>
          <Button onClick={resetPosition} size="icon" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white">
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button onClick={toggleFullscreen} size="icon" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 217, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 217, 255, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 217, 255, 0.7);
        }
      `}</style>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-20" 
           style={{
             background: 'radial-gradient(circle at center, transparent 0%, rgba(0,8,20,0.4) 100%)'
           }} 
      />
    </div>
  );
}
