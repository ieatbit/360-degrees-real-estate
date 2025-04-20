'use client';

import React, { useEffect, useRef, useState } from 'react';

const EarthLogo = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const loading = loadingRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || !container || !loading) return;
    
    // Canvas dimensions
    const width = 60;
    const height = 60;
    canvas.width = width;
    canvas.height = height;
    
    // Create image elements
    const earthImg = new Image();
    
    // Try loading the earth texture from multiple possible paths
    const texturePaths = [
      '/images/earth/earth-map.jpg',
      '/images/earth/earthmap.jpg',
      '/images/earth-texture.jpg'
    ];
    
    let currentPathIndex = 0;
    const tryLoadTexture = () => {
      if (currentPathIndex >= texturePaths.length) {
        console.error('Failed to load any Earth texture');
        setHasError(true);
        if (loading) {
          loading.textContent = 'Failed to load';
        }
        return;
      }
      
      earthImg.src = texturePaths[currentPathIndex];
      currentPathIndex++;
    };
    
    // Loading indicator
    let isLoading = true;
    
    // Earth rotation variables
    let rotation = 0;
    const rotationSpeed = 0.005;
    
    // Render the Earth
    const renderEarth = () => {
      if (!context) return;
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      // Draw Earth
      context.save();
      context.translate(width / 2, height / 2);
      
      // Create a circular clipping path
      context.beginPath();
      context.arc(0, 0, width / 2 - 2, 0, Math.PI * 2, false);
      context.clip();
      
      // Draw Earth map with rotation
      const imgWidth = earthImg.width;
      const offsetX = (rotation * imgWidth / (Math.PI * 2)) % imgWidth;
      context.drawImage(
        earthImg,
        offsetX, 0, imgWidth - offsetX, earthImg.height,
        -width / 2, -height / 2, width, height
      );
      
      // Draw the remaining portion of the map for seamless rotation
      if (offsetX > 0) {
        context.drawImage(
          earthImg,
          0, 0, offsetX, earthImg.height,
          width - offsetX - width / 2, -height / 2, offsetX, height
        );
      }
      
      context.restore();
    };
    
    // Animation loop
    const animate = () => {
      rotation += rotationSpeed;
      renderEarth();
      requestAnimationFrame(animate);
    };
    
    // Handle image loading
    earthImg.onload = () => {
      isLoading = false;
      setIsLoaded(true);
      if (loading) {
        loading.style.display = 'none';
      }
      animate();
      console.log('Earth texture loaded successfully');
    };
    
    // Handle loading error
    earthImg.onerror = () => {
      console.error(`Failed to load Earth texture: ${earthImg.src}`);
      tryLoadTexture(); // Try next texture path
    };
    
    // Start loading the first texture
    tryLoadTexture();
    
    // Cleanup
    return () => {
      // No cleanup needed for this simple animation
    };
  }, []);
  
  return (
    <div className="earth-container" ref={containerRef}>
      {!isLoaded && !hasError && (
        <div className="loading-indicator" ref={loadingRef}>
          <div className="loading-sphere"></div>
        </div>
      )}
      {hasError && (
        <div className="error-fallback">
          <div className="earth-fallback">360°</div>
        </div>
      )}
      <canvas className="earth-canvas" ref={canvasRef}></canvas>
      <style jsx>{`
        .earth-container {
          position: relative;
          width: 60px;
          height: 60px;
        }
        .earth-canvas {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
        }
        .loading-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 0;
        }
        .loading-sphere {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1E5F8C, #0A3D62);
          animation: pulse 1.5s infinite ease-in-out;
        }
        .error-fallback {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .earth-fallback {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1E5F8C, #0A3D62);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default EarthLogo; 