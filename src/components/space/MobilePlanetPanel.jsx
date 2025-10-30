import React, { useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function MobilePlanetPanel({ 
  planet, 
  onClose, 
  onNext, 
  onPrevious,
  currentIndex,
  totalPlanets,
  visitedPlanets
}) {
  const startYRef = useRef(0);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - startYRef.current;
      
      // Swipe down to close
      if (deltaY > 100) {
        onClose();
      }
    };

    const panel = panelRef.current;
    if (panel) {
      panel.addEventListener('touchstart', handleTouchStart);
      panel.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (panel) {
        panel.removeEventListener('touchstart', handleTouchStart);
        panel.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [onClose]);

  // Condensed mobile content
  const getMobileContent = () => {
    switch(planet.name) {
      case 'SUN':
        return `🌟 WELCOME

Embark on an interactive journey through space to discover my professional story.

**Navigate:**
• Use joystick to travel
• Tap planets in menu
• Swipe down to close

Start your journey!`;

      case 'MERCURY':
        return `👨‍💻 Yash Gupta
**Software Engineer**

Full Stack | Blockchain Specialist
B.Tech IT | CGPA 8.42

📍 Dreamworks Alliance, Pune
📧 guptayash200010@gmail.com

2+ years of development experience building scalable web apps.`;

      case 'VENUS':
        return `📫 CONTACT

📧 guptayash200010@gmail.com
📱 +91 969689544

💼 [LinkedIn](https://linkedin.com/in/guptayash007)
🐙 [GitHub](https://github.com/conqryash007)
🏆 [LeetCode](https://leetcode.com/conqryash007)

**Status:** Open to opportunities`;

      case 'EARTH':
        return `🎓 EDUCATION

**B.Tech in IT**
IIIT Bhubaneswar
📊 CGPA: 8.42
📅 2020-2024

**XII - CBSE**
Central Academy, UP
📊 95.6%
📅 2018-2019`;

      case 'MARS':
        return `💼 EXPERIENCE

**🚀 Software Engineer**
Dreamworks Alliance
*Aug 2025 - Present*

**⚙️ Associate Product Engineer**
Inovaare Corporation
*Jan 2024 - Oct 2024*
Angular migration, Node.js

**👨‍💻 Full Stack Developer**
Quagnitia Systems
*July 2022 - Jan 2024*
Blockchain, NFT, AWS`;

      case 'JUPITER':
        return `⚡ TECH SKILLS

**💻 Languages:**
Java • C++ • JavaScript • SQL

**🎨 Frontend:**
React • Angular • Next.js

**⚙️ Backend:**
Node.js • Express • REST APIs

**🗄️ Databases:**
MongoDB • PostgreSQL

**☁️ DevOps:**
Docker • AWS • Git

**⛓️ Blockchain:**
Solidity • Web3.js • Ethereum`;

      case 'SATURN':
        return `🚀 PROJECTS

**🏠 Property Pulse**
Blockchain Land Registration
*MERN + Solidity*

**✈️ reTraView**
Travel Review Platform
*React + Node.js + MongoDB*

**💰 Fund4Cause**
Web3.0 Crowdfunding
*Next.js + Solidity*

**🌌 Cosmic Canvas**
Interactive 3D Portfolio
*React + Three.js*

[View Portfolio →](https://github.com/conqryash007)`;

      case 'NEPTUNE':
        return `🏆 ACHIEVEMENTS

⭐ **Tech Lead**
GeeksforGeeks Chapter
*2023*

🌟 **Core Member**
Google Developer Student Club
*2023*

🥇 **First Prize**
GFG Web Dev Hackathon
*2022*

📈 8.42 CGPA • 95.6% XII
🌐 10+ Full-Stack Projects
👨‍🏫 Mentored 20+ Developers`;

      default:
        return planet.content;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      style={{ touchAction: 'pan-y' }}
    >
      <motion.div
        ref={panelRef}
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="w-full max-w-lg max-h-[85vh] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 15, 31, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
          border: '2px solid rgba(0, 217, 255, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 217, 255, 0.3)'
        }}
      >
        {/* Swipe Indicator */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-2"></div>

        {/* Header */}
        <div className="p-4 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{planet.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{planet.name}</h2>
                <p className="text-cyan-400 text-sm font-medium">{planet.label}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-cyan-300 hover:bg-cyan-500/20 flex-shrink-0"
              style={{ touchAction: 'manipulation', minWidth: '44px', minHeight: '44px' }}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <Badge 
            variant="outline" 
            className="border-cyan-400 text-cyan-400 bg-cyan-500/10"
          >
            {currentIndex + 1}/{totalPlanets}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-180px)] custom-scrollbar">
          <div className="text-white/90 text-base leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                a: ({node, ...props}) => (
                  <a 
                    {...props} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    style={{ touchAction: 'manipulation' }}
                  />
                ),
                p: ({node, ...props}) => <p {...props} className="mb-3" />,
                strong: ({node, ...props}) => <strong {...props} className="text-cyan-300 font-bold" />
              }}
            >
              {getMobileContent()}
            </ReactMarkdown>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
          <div className="flex gap-2">
            <Button
              onClick={onPrevious}
              size="lg"
              variant="outline"
              className="flex-1 border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20"
              style={{ touchAction: 'manipulation', minHeight: '48px' }}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </Button>
            <Button
              onClick={onNext}
              size="lg"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              style={{ touchAction: 'manipulation', minHeight: '48px' }}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
          
          {/* Journey Progress */}
          <div className="mt-3">
            <p className="text-cyan-300/60 text-xs mb-2 uppercase tracking-wider">Journey Progress</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPlanets }).map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    visitedPlanets.includes(index)
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-400'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}