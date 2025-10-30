import React, { useRef, useEffect, useState } from 'react';
import { Rocket, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MobileControls({ 
  onMove, 
  onBoost, 
  onMenuOpen, 
  isBoosting,
  isMoving 
}) {
  const joystickRef = useRef(null);
  const joystickBaseRef = useRef(null);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef(null);

  const handleJoystickStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystick(touch);
  };

  const handleJoystickMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;
    
    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
    if (touch) {
      updateJoystick(touch);
    }
  };

  const handleJoystickEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setJoystickPosition({ x: 0, y: 0 });
    onMove(0, 0);
    touchIdRef.current = null;
  };

  const updateJoystick = (touch) => {
    if (!joystickBaseRef.current) return;

    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;
    
    const maxDistance = rect.width / 2;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }
    
    setJoystickPosition({ x: deltaX, y: deltaY });
    
    // Normalize to -1 to 1 range
    const normalizedX = deltaX / maxDistance;
    const normalizedY = deltaY / maxDistance;
    
    onMove(normalizedX, -normalizedY); // Invert Y for natural feel
  };

  return (
    <>
      {/* Virtual Joystick */}
      <div className="absolute bottom-8 left-8 z-30">
        <div
          ref={joystickBaseRef}
          className="relative w-32 h-32 rounded-full border-4 border-cyan-400/40 bg-black/30 backdrop-blur-md"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          style={{ touchAction: 'none' }}
        >
          <div
            ref={joystickRef}
            className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50 transition-transform"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`
            }}
          >
            <div className="absolute inset-2 rounded-full bg-white/30"></div>
          </div>
          
          {/* Direction indicators */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-cyan-300/60 text-xs font-mono">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">↑</div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">↓</div>
              <div className="absolute -left-6 top-1/2 -translate-y-1/2">←</div>
              <div className="absolute -right-6 top-1/2 -translate-y-1/2">→</div>
            </div>
          </div>
        </div>
        <div className="text-cyan-300 text-xs text-center mt-2 font-mono">Navigate</div>
      </div>

      {/* Boost Button */}
      <div className="absolute bottom-8 right-8 z-30">
        <Button
          onTouchStart={(e) => {
            e.preventDefault();
            onBoost(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onBoost(false);
          }}
          size="lg"
          className={`w-24 h-24 rounded-full transition-all ${
            isBoosting
              ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50 scale-95'
              : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30'
          }`}
          style={{ touchAction: 'none' }}
        >
          <div className="flex flex-col items-center">
            <Rocket className={`w-8 h-8 ${isBoosting ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-mono mt-1">BOOST</span>
          </div>
        </Button>
      </div>

      {/* Quick Nav Button */}
      <div className="absolute top-6 right-6 z-30">
        <Button
          onClick={onMenuOpen}
          size="lg"
          className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-cyan-400/50 shadow-lg"
          style={{ touchAction: 'manipulation' }}
        >
          <Menu className="w-6 h-6 text-cyan-300" />
        </Button>
      </div>
    </>
  );
}