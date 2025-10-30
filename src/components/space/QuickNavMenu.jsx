import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickNavMenu({ isOpen, onClose, waypoints, onSelectPlanet, visitedPlanets }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gradient-to-br from-[#0F0F1F] to-[#1A1A2E] z-50 overflow-y-auto"
            style={{
              borderLeft: '2px solid rgba(0, 217, 255, 0.3)',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md border-b border-cyan-400/30 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Quick Navigation</h2>
                <Button
                  onClick={onClose}
                  size="icon"
                  variant="ghost"
                  className="text-cyan-300 hover:bg-cyan-500/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <p className="text-cyan-300/70 text-sm mt-2">Tap to warp to any planet</p>
            </div>

            {/* Planet List */}
            <div className="p-4 space-y-3">
              {waypoints.map((waypoint, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onSelectPlanet(index);
                    onClose();
                  }}
                  className="w-full text-left p-4 rounded-xl transition-all relative overflow-hidden group"
                  style={{
                    background: visitedPlanets.includes(index)
                      ? 'rgba(0, 217, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid',
                    borderColor: visitedPlanets.includes(index)
                      ? 'rgba(0, 217, 255, 0.4)'
                      : 'rgba(255, 255, 255, 0.1)',
                    touchAction: 'manipulation'
                  }}
                >
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-cyan-400/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
                  
                  <div className="relative flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{waypoint.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{waypoint.name}</h3>
                        {visitedPlanets.includes(index) && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-400/30">
                            Visited
                          </span>
                        )}
                      </div>
                      <p className="text-cyan-300 text-sm font-medium mb-1">{waypoint.label}</p>
                      <p className="text-white/60 text-xs line-clamp-2">{waypoint.info}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}