/**
 * SplashCursor — лоадер с анимацией логотипа OFT при первой загрузке.
 * Чёрный фон, красный неоновый круг, буквы OFT, глитч на молнии в F.
 * Длительность 2.5 с, затем fade out к главному экрану.
 */

import { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const RED = '#FF0000';
const BLACK = '#000000';
const SPLASH_DURATION_MS = 2500;
const FADE_OUT_DURATION = 0.5;

export interface SplashCursorProps {
  onFinish?: () => void;
}

export default function SplashCursor({ onFinish }: SplashCursorProps) {
  const [exiting, setExiting] = useState(false);
  const containerControls = useAnimationControls();

  useEffect(() => {
    const fadeOutAt = SPLASH_DURATION_MS - FADE_OUT_DURATION * 1000;
    const t = setTimeout(() => {
      setExiting(true);
    }, fadeOutAt);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    containerControls.start({ opacity: 0 }).then(() => {
      onFinish?.();
    });
  }, [exiting, containerControls, onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: BLACK }}
      initial={{ opacity: 1 }}
      animate={containerControls}
      transition={{ duration: FADE_OUT_DURATION, ease: 'easeInOut' }}
    >
      {/* Красный неоновый круг */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: [
            '0 0 20px #FF0000, 0 0 40px rgba(255,0,0,0.4)',
            '0 0 35px #FF0000, 0 0 70px rgba(255,0,0,0.6)',
            '0 0 20px #FF0000, 0 0 40px rgba(255,0,0,0.4)',
          ],
        }}
        transition={{
          opacity: { duration: 0.4 },
          scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          boxShadow: {
            duration: 1.2,
            repeat: Infinity,
            repeatDelay: 0.2,
          },
        }}
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: `2px solid ${RED}`,
          background: 'transparent',
        }}
      />

      {/* Логотип OFT + молния в F */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <svg
          viewBox="0 0 160 64"
          width={200}
          height={80}
          className="relative"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="oft-glow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="lightning-glow">
              <feGaussianBlur stdDeviation="0.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* O */}
          <motion.text
            x={24}
            y={48}
            fontSize={48}
            fontWeight={800}
            fill={RED}
            fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
            filter="url(#oft-glow)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            O
          </motion.text>

          {/* F с молнией */}
          <g>
            <motion.text
              x={72}
              y={48}
              fontSize={48}
              fontWeight={800}
              fill={RED}
              fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
              filter="url(#oft-glow)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              F
            </motion.text>
            {/* Молния по центру F */}
            <motion.path
              d="M 88 18 L 84 32 L 90 32 L 86 46 L 92 28 L 86 28 Z"
              fill={RED}
              filter="url(#lightning-glow)"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0, 1, 0, 0],
              }}
              transition={{
                duration: 0.5,
                times: [0, 0.45, 0.5, 0.55, 1],
                delay: 1.15,
              }}
            />
          </g>

          {/* T */}
          <motion.text
            x={112}
            y={48}
            fontSize={48}
            fontWeight={800}
            fill={RED}
            fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
            filter="url(#oft-glow)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75, duration: 0.4 }}
          >
            T
          </motion.text>
        </svg>
      </motion.div>
    </motion.div>
  );
}
