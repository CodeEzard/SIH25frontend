import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const sizeClasses: Record<string, string> = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div
      className={`flex items-center justify-center gap-2 mx-auto ${className}`}
    >
      <motion.div
        className={`${sizeClasses[size]} flex items-center justify-center`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ duration: 0.2 }}
        aria-hidden={false}
      >
        <svg
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff00ff" stopOpacity="1" />
              <stop offset="25%" stopColor="#da70d6" stopOpacity="1" />
              <stop offset="50%" stopColor="#8a2be2" stopOpacity="1" />
              <stop offset="75%" stopColor="#6a0dad" stopOpacity="1" />
              <stop offset="100%" stopColor="#4b0082" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="leftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9932cc" stopOpacity="1" />
              <stop offset="30%" stopColor="#7b68ee" stopOpacity="1" />
              <stop offset="60%" stopColor="#6a0dad" stopOpacity="1" />
              <stop offset="100%" stopColor="#2d1b69" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="rightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6e6fa" stopOpacity="1" />
              <stop offset="20%" stopColor="#da70d6" stopOpacity="1" />
              <stop offset="50%" stopColor="#ba55d3" stopOpacity="1" />
              <stop offset="80%" stopColor="#9370db" stopOpacity="1" />
              <stop offset="100%" stopColor="#663399" stopOpacity="1" />
            </linearGradient>

            <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter
              id="edgeGlow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1.5 0 1.5 0 0  0 0.5 1.5 0 0  1.5 0 1.5 0 0  0 0 0 1 0"
              />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(300,250)">
            <polygon
              points="-80,-100 0,-140 80,-100 0,-60"
              fill="url(#topGrad)"
              stroke="#ff00ff"
              strokeWidth="4"
              filter="url(#neon)"
            />
            <polygon
              points="-80,-100 -80,0 0,40 0,-60"
              fill="url(#leftGrad)"
              stroke="#8a2be2"
              strokeWidth="4"
            />
            <polygon
              points="0,-60 0,40 80,0 80,-100"
              fill="url(#rightGrad)"
              stroke="#da70d6"
              strokeWidth="4"
              filter="url(#neon)"
            />

            <g
              strokeWidth="3"
              fill="none"
              filter="url(#edgeGlow)"
              opacity="0.8"
            >
              <line x1="-80" y1="-100" x2="0" y2="-140" stroke="#ff00ff" />
              <line x1="0" y1="-140" x2="80" y2="-100" stroke="#ff00ff" />
              <line x1="80" y1="-100" x2="80" y2="0" stroke="#da70d6" />
              <line x1="0" y1="40" x2="80" y2="0" stroke="#da70d6" />
              <line x1="-80" y1="0" x2="0" y2="40" stroke="#8a2be2" />
              <line x1="-80" y1="-100" x2="-80" y2="0" stroke="#9932cc" />
              <line x1="0" y1="-60" x2="0" y2="40" stroke="#ba55d3" />
            </g>

            <g strokeWidth="2" fill="none" opacity="0.6">
              <line x1="-40" y1="-80" x2="0" y2="-100" stroke="#ff69b4" />
              <line x1="0" y1="-100" x2="40" y2="-80" stroke="#ff69b4" />
              <line x1="40" y1="-80" x2="40" y2="-20" stroke="#dda0dd" />
              <line x1="0" y1="20" x2="40" y2="-20" stroke="#dda0dd" />
              <line x1="-40" y1="-20" x2="0" y2="20" stroke="#9370db" />
              <line x1="-40" y1="-80" x2="-40" y2="-20" stroke="#8b008b" />
            </g>
          </g>
        </svg>
      </motion.div>

      {showText && (
        <div className={`font-bold tracking-tight ${textSizes[size]}`}>
          Veri<span className="text-purple-400">Cred</span>
        </div>
      )}
    </div>
  );
}
