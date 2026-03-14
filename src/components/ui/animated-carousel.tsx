import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function OrbitCarousel() {
  const [isDark, setIsDark] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);


  const zDepth = 450;
  const imageSize = 250;
  const borderRadius = 12;
  const backfaceVisible = false;
  const pauseOnHover = true;

  const images = [
    { id: 1, url: '/images/activity6.jpg', label: 'Sports' },
    { id: 2, url: '/images/activity7.jpg', label: 'Dance' },
    { id: 3, url: '/images/activity8.jpg', label: 'Art' },
    { id: 4, url: '/images/activity9.jpg', label: 'Play' },
    { id: 5, url: '/images/activity10.jpg', label: 'Music' },
    { id: 6, url: '/images/activity3.jpg', label: 'Learning' },
  ];

  const numImages = images.length;
  const angleSlice = 360 / numImages;

  React.useEffect(() => {
    if (isHovering && pauseOnHover) return;

    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isHovering, pauseOnHover]);

  const handleImageClick = (index: number) => {
    const targetRotation = -index * angleSlice;
    setRotation(targetRotation % 360);
  };

  return (
    <div className={`w-full min-h-[600px] py-12 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-transparent'}`}>
      {/* Orthogonal Grid Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`absolute top-6 right-6 z-50 p-3 rounded-full transition-all ${
          isDark
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-white text-gray-800 hover:bg-gray-100 shadow-lg'
        }`}
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="relative w-full h-[500px] flex flex-col items-center justify-center overflow-hidden">
        {/* 3D Carousel Container */}
        <div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: '1200px' }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Rotating Group */}
          <motion.div
            className="relative"
            style={{
              width: imageSize * 2,
              height: imageSize * 2,
              transformStyle: 'preserve-3d',
            }}
            animate={{ rotateY: rotation }}
            transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
          >
            {images.map((image, index) => {
              const angle = (index * angleSlice * Math.PI) / 180;
              const x = Math.cos(angle) * zDepth;
              const z = Math.sin(angle) * zDepth;

              return (
                <motion.div
                  key={image.id}
                  className="absolute cursor-pointer"
                  style={{
                    width: imageSize,
                    height: imageSize,
                    left: '50%',
                    top: '50%',
                    marginLeft: -imageSize / 2,
                    marginTop: -imageSize / 2,
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: backfaceVisible ? 'visible' : 'hidden',
                  }}
                  animate={{
                    x,
                    z,
                    rotateY: -rotation,
                  }}
                  transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
                  onClick={() => handleImageClick(index)}
                  whileHover={{ scale: 1.15 }}
                >
                  {/* Image Card */}
                  <div
                    className={`w-full h-full rounded-lg shadow-2xl overflow-hidden cursor-pointer transition-transform ${
                      isDark ? 'ring-2 ring-gray-700' : 'ring-2 ring-white'
                    }`}
                    style={{ borderRadius: `${borderRadius}px` }}
                  >
                    {/* Image */}
                    <img
                      src={image.url}
                      alt={image.label}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Label */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="text-white text-center font-bold text-lg drop-shadow-lg">
                        {image.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Tip Footer */}
      <div className="absolute bottom-8 left-8">
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          💡 Click any image to snap it to the front • Hover to pause
        </p>
      </div>
    </div>
  );
}
