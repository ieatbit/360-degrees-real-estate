"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as THREE from 'three';
import gsap from 'gsap';

interface NavItem {
  title: string;
  path: string;
  order: number;
  visible: boolean;
}

interface Settings {
  siteName: string;
  navigation: NavItem[];
}

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const earthCanvasRef = useRef<HTMLCanvasElement>(null);
  const earthContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    siteName: '360° Real Estate',
    navigation: [
      { title: 'Home', path: '/', order: 1, visible: true },
      { title: 'Properties', path: '/properties', order: 2, visible: true },
      { title: 'About Us', path: '/about', order: 3, visible: true },
      { title: 'Contact Us', path: '/contact', order: 4, visible: true },
      { title: 'Uttarakhand Guide', path: '/uttarakhand-guide', order: 5, visible: true },
    ]
  });
  
  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings({
            siteName: data.siteName,
            navigation: data.navigation || settings.navigation,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);
  
  useEffect(() => {
    if (!earthCanvasRef.current || !earthContainerRef.current) return;
    
    // Setup scene
    const scene = new THREE.Scene();
    
    // Get container dimensions
    const containerRect = earthContainerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    // Setup camera with adjusted FOV and position
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2.2; // Move camera further back from 1.8
    
    // Setup renderer with high quality settings
    const renderer = new THREE.WebGLRenderer({ 
      canvas: earthCanvasRef.current,
      antialias: true,
      alpha: true,
      precision: 'highp'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    
    // Create Earth with a more defined material
    const earthGeometry = new THREE.SphereGeometry(1, 96, 96);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1565C0, // Deeper blue for oceans
      shininess: 15,
      specular: 0x333333, // Reduced specular highlights
      flatShading: false
    });
    
    // Texture loader with loading manager
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = () => {
      setIsLoading(false);
      console.log("All textures loaded successfully");
    };
    
    loadingManager.onError = (url) => {
      // Use a safer approach to log errors
      setIsLoading(false); // Ensure loading indicator is removed even when errors occur
    };
    
    const textureLoader = new THREE.TextureLoader(loadingManager);
    
    // Enhanced Earth textures with high-resolution maps and fallbacks
    const loadTexture = (path: string, fallbackPath?: string): Promise<THREE.Texture> => {
      return new Promise((resolve) => {
        textureLoader.load(
          path, 
          (texture) => {
            console.log(`Loaded texture: ${path}`);
            resolve(texture);
          },
          undefined,
          () => {
            console.warn(`Failed to load texture: ${path}, trying fallback`);
            if (fallbackPath) {
              textureLoader.load(
                fallbackPath,
                (texture) => {
                  console.log(`Loaded fallback texture: ${fallbackPath}`);
                  resolve(texture);
                },
                undefined,
                (error) => {
                  // Replace console.error with safer approach
                  // Create a basic colored texture as last resort
                  const canvas = document.createElement('canvas');
                  canvas.width = 256;
                  canvas.height = 256;
                  const context = canvas.getContext('2d');
                  if (context) {
                    context.fillStyle = '#1a66cc';
                    context.fillRect(0, 0, 256, 256);
                  }
                  const basicTexture = new THREE.CanvasTexture(canvas);
                  resolve(basicTexture);
                }
              );
            } else {
              // Create a basic colored texture as last resort
              const canvas = document.createElement('canvas');
              canvas.width = 256;
              canvas.height = 256;
              const context = canvas.getContext('2d');
              if (context) {
                context.fillStyle = '#1a66cc';
                context.fillRect(0, 0, 256, 256);
              }
              const basicTexture = new THREE.CanvasTexture(canvas);
              resolve(basicTexture);
            }
          }
        );
      });
    };
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Create a basic cloud material initially
    const cloudGeometry = new THREE.SphereGeometry(1.01, 96, 96);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,  // Start with 0 opacity to avoid flash
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);
    
    // Hide earth initially to prevent blue flash
    earth.visible = false;
    
    // Enhanced atmosphere glow effect
    const atmosphereGeometry = new THREE.SphereGeometry(1.10, 96, 96);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.1, 0.3, 0.8, 0.6) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    
    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0x606060, 1.0); // Brighter ambient light
    scene.add(ambientLight);
    
    // Main sun light - positioned to create realistic day/night terminator
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.8);
    // Position the light to simulate the sun shining from one side
    directionalLight.position.set(10, 0, 5);
    scene.add(directionalLight);
    
    // Add subtle point lights to create more dimension
    const blueLight = new THREE.PointLight(0x6699ff, 0.5); // Reduced intensity from 0.6
    blueLight.position.set(-3, -2, 5); // Adjusted position
    scene.add(blueLight);
    
    // Add a subtle rim light to create depth separation
    const rimLight = new THREE.PointLight(0xffffff, 0.3);
    rimLight.position.set(0, 0, -5);
    scene.add(rimLight);
    
    // Load textures asynchronously
    const loadAllTextures = async () => {
      try {
        // First check if files exist before attempting to load them
        const checkImageExists = async (url: string): Promise<boolean> => {
          try {
            const res = await fetch(url, { method: 'HEAD' });
            return res.ok;
          } catch (e) {
            return false;
          }
        };
        
        // Determine which files exist
        const normalMapExists = await checkImageExists('/images/earth/earth-normal.jpg');
        const normalFallbackExists = await checkImageExists('/images/earth/earthnormal.jpg');
        const cloudMapExists = await checkImageExists('/images/earth/clouds.png');
        const cloudFallbackExists = await checkImageExists('/images/earth/earthclouds.jpg');
        
        // Use appropriate paths based on what exists
        const normalMapPath = normalMapExists ? '/images/earth/earth-normal.jpg' : 
                              normalFallbackExists ? '/images/earth/earthnormal.jpg' : null;
        const cloudMapPath = cloudMapExists ? '/images/earth/clouds.png' : 
                             cloudFallbackExists ? '/images/earth/earthclouds.jpg' : null;
        
        // Try all possible paths for the textures
        const earthMap: THREE.Texture = await loadTexture(
          '/images/earth/earth-map.jpg', 
          '/images/earth/earthmap.jpg'
        );
        
        const earthNormalMap: THREE.Texture = await loadTexture(
          normalMapPath || '/images/earth/earth-normal.jpg',
          '/images/earth/earthnormal.jpg'
        );
        
        const cloudMap: THREE.Texture = await loadTexture(
          cloudMapPath || '/images/earth/clouds.png',
          '/images/earth/earthclouds.jpg'
        );
        
        // Apply textures once loaded
        earthMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        // Apply post-processing to enhance the texture colors
        if (earthMap.image && 'src' in earthMap.image) {
          // Increase contrast for better land visibility
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx && earthMap.image instanceof HTMLImageElement) {
            const img = earthMap.image;
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Get image data and enhance colors
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Increase contrast and enhance green
            for (let i = 0; i < data.length; i += 4) {
              // Enhance greens (land areas)
              if (data[i+1] > data[i] && data[i+1] > data[i+2]) {
                data[i+1] = Math.min(255, data[i+1] * 1.3); // Boost green channel
              }
              
              // Make blues lighter (ocean areas)
              if (data[i+2] > data[i] && data[i+2] > data[i+1]) {
                data[i+2] = Math.min(255, data[i+2] * 1.1); // Boost blue channel slightly
                data[i] = Math.min(255, data[i] * 1.3);     // Add more red to blues to make them lighter
              }
              
              // Increase contrast 
              for (let j = 0; j < 3; j++) {
                data[i+j] = (data[i+j] > 128) ? 
                  Math.min(255, data[i+j] + 20) : 
                  Math.max(0, data[i+j] - 10);
              }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Create new texture from enhanced canvas
            const enhancedTexture = new THREE.CanvasTexture(canvas);
            enhancedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            earthMaterial.map = enhancedTexture;
          } else {
            earthMaterial.map = earthMap;
          }
        } else {
          earthMaterial.map = earthMap;
        }
        
        earthMaterial.normalMap = earthNormalMap;
        earthMaterial.normalScale = new THREE.Vector2(0.15, 0.15);
        
        cloudMaterial.map = cloudMap;
        cloudMaterial.opacity = 0.35;
        
        // Update materials
        earthMaterial.needsUpdate = true;
        cloudMaterial.needsUpdate = true;
        
        // Show earth after textures are loaded
        earth.visible = true;
        
        // Animate cloud opacity to avoid sudden appearance
        gsap.to(cloudMaterial, {
          opacity: 0.35,
          duration: 1.0,
          ease: "power2.inOut"
        });
        
        // Log success
        console.log("All textures loaded successfully");
      } catch (error) {
        console.error("Error loading textures:", error);
        // Still show earth with basic materials as fallback
        earth.visible = true;
        // Use a solid texture as last resort
        earthMaterial.map = null;
        earthMaterial.color = new THREE.Color(0x1a66cc);
      }
    };
    
    loadAllTextures();
    
    // Track mouse movement for interactive rotation - Disabled for automatic rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    // Start with India/Asia visible (around longitude 80° East)
    let initialRotation = { x: 0.2, y: Math.PI * 0.2 };
    
    // Set initial rotation
    earth.rotation.x = initialRotation.x;
    earth.rotation.y = initialRotation.y;
    clouds.rotation.x = initialRotation.x;
    clouds.rotation.y = initialRotation.y;
    
    // No longer needed for automatic rotation
    // const handleMouseMove = (event: MouseEvent) => {
    //   // Only process if container exists
    //   if (!earthContainerRef.current) return;
    //   
    //   const containerRect = earthContainerRef.current.getBoundingClientRect();
    //   
    //   // Calculate mouse position relative to container center
    //   mouseX = ((event.clientX - containerRect.left) / containerRect.width) * 2 - 1;
    //   mouseY = -((event.clientY - containerRect.top) / containerRect.height) * 2 + 1;
    //   
    //   // Limit rotation amount
    //   targetRotationY = mouseX * 0.6;
    //   targetRotationX = mouseY * 0.4;
    // };
    
    // No longer listening to mouse movement
    // window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop with pure automatic rotation
    const animate = () => {
      // Earth rotates once every 24 hours
      // In a real-time simulation, that would be 2π radians per 24 hours = 2π/86400 radians per second
      // For visual effect, we'll simulate this but still keep it visibly rotating
      const earthRotationPerSecond = Math.PI * 2 / 86400; // Complete rotation in 24 hours (86400 seconds)
      const speedMultiplier = 1000; // Speed up by 1000x to make it visible but still realistic in motion
      
      // Calculate time elapsed since last frame (approx 1/60 second)
      const deltaTime = 1/60;
      
      // Calculate rotation increment
      const baseRotationSpeed = earthRotationPerSecond * speedMultiplier * deltaTime;
      const cloudRotationSpeed = baseRotationSpeed * 1.1; // Clouds move slightly faster
      
      // Apply rotation - counterclockwise (west to east, like the real Earth)
      earth.rotation.y -= baseRotationSpeed;
      clouds.rotation.y -= cloudRotationSpeed;
      
      // Maintain tilt (23.5° like Earth's axial tilt)
      earth.rotation.x = initialRotation.x;
      clouds.rotation.x = initialRotation.x;
      
      // Render scene
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation immediately
    requestRef.current = requestAnimationFrame(animate);
    
    // Debug check to ensure animation loop is running
    console.log("Animation loop started");
    
    // Handle resize
    const handleResize = () => {
      if (!earthContainerRef.current) return;
      
      const containerRect = earthContainerRef.current.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      // window.removeEventListener('mousemove', handleMouseMove); // Removed this line since we disabled mouse control
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      // Dispose resources
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();
      
      // Clear references
      if (earthCanvasRef.current) {
        earthCanvasRef.current.width = 0;
        earthCanvasRef.current.height = 0;
      }
    };
  }, []);
  
  return (
    <header className="bg-white shadow-md py-2 border-b border-gray-100 relative">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 bg-transparent outline-none focus:outline-none">
          <div ref={earthContainerRef} className="earth-container">
            {isLoading && (
              <div className="loading-indicator">
                <div className="loading-sphere"></div>
              </div>
            )}
            <canvas ref={earthCanvasRef} className="earth-canvas" />
            <style jsx>{`
              .earth-container {
                width: 70px;
                height: 70px;
                position: relative;
                overflow: visible;
                border-radius: 0;
                box-shadow: none;
                background: none;
                border: none;
                outline: none;
              }
              
              .earth-canvas {
                width: 100%;
                height: 100%;
                display: block;
                background: none;
              }
              
              .loading-indicator {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 50%;
              }
              
              .loading-sphere {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #48a0f9, #1a4c8e);
                animation: pulse 1.5s ease-in-out infinite;
              }
              
              @keyframes pulse {
                0% { transform: scale(0.8); opacity: 0.7; }
                50% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.8); opacity: 0.7; }
              }
            `}</style>
          </div>
          <span className="text-xl font-bold text-[#0F2C5A]">{settings.siteName}</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {settings.navigation
            .filter(item => item.visible)
            .sort((a, b) => a.order - b.order)
            .map((navItem) => (
              <Link 
                key={navItem.path}
                href={navItem.path}
                className={`font-medium ${
                  (pathname === navItem.path || (navItem.path !== '/' && pathname && pathname.startsWith(navItem.path)))
                    ? 'text-[#0F2C5A] border-b-2 border-[#D4AF37]' 
                    : 'text-gray-600 hover:text-[#0F2C5A] hover:border-b-2 hover:border-[#D4AF37]'
                } transition-all py-1`}
              >
                {navItem.title}
              </Link>
            ))}
        </nav>
        
        <div className="md:hidden">
          <button 
            className="text-[#0F2C5A] focus:outline-none hover:text-[#1A3E73] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-100 animate-fadeIn">
          <div className="container mx-auto px-4 py-3">
            {settings.navigation
              .filter(item => item.visible)
              .sort((a, b) => a.order - b.order)
              .map((navItem) => (
                <Link 
                  key={navItem.path}
                  href={navItem.path}
                  className={`block py-3 px-4 text-lg ${
                    (pathname === navItem.path || (navItem.path !== '/' && pathname && pathname.startsWith(navItem.path)))
                      ? 'text-[#0F2C5A] border-l-4 border-[#D4AF37] bg-gray-50 font-medium' 
                      : 'text-gray-600 hover:text-[#0F2C5A] hover:bg-gray-50 border-l-4 border-transparent'
                  } transition-all`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {navItem.title}
                </Link>
              ))}
          </div>
          
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </header>
  );
};

export default Header;
