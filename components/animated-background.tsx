"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  type: "circle" | "square" | "triangle"
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = window.innerWidth < 768 ? 30 : 50

      // Use a seed for consistent particle generation
      let seed = 12345
      const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: seededRandom() * canvas.offsetWidth,
          y: seededRandom() * canvas.offsetHeight,
          vx: (seededRandom() - 0.5) * 0.5,
          vy: (seededRandom() - 0.5) * 0.5,
          size: seededRandom() * 3 + 1,
          opacity: seededRandom() * 0.5 + 0.1,
          type: ["circle", "square", "triangle"][Math.floor(seededRandom() * 3)] as "circle" | "square" | "triangle",
        })
      }
      particlesRef.current = particles
    }

    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = "white"
      ctx.strokeStyle = "white"
      ctx.lineWidth = 1

      switch (particle.type) {
        case "circle":
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
        case "square":
          ctx.fillRect(particle.x - particle.size, particle.y - particle.size, particle.size * 2, particle.size * 2)
          break
        case "triangle":
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y - particle.size)
          ctx.lineTo(particle.x - particle.size, particle.y + particle.size)
          ctx.lineTo(particle.x + particle.size, particle.y + particle.size)
          ctx.closePath()
          ctx.fill()
          break
      }
      ctx.restore()
    }

    const drawConnections = () => {
      const particles = particlesRef.current
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.globalAlpha = ((100 - distance) / 100) * 0.2
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.offsetWidth) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.offsetHeight) particle.vy *= -1

        drawParticle(particle)
      })

      drawConnections()
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createParticles()
    animate()

    const handleResize = () => {
      resizeCanvas()
      createParticles()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isClient])

  if (!isClient) {
    return <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
  }

  // Static geometric shapes data to avoid hydration issues
  const geometricShapes = [
    { width: 45, height: 45, left: 15, top: 20, delay: 0 },
    { width: 35, height: 35, left: 70, top: 15, delay: 2 },
    { width: 55, height: 55, left: 25, top: 60, delay: 4 },
    { width: 40, height: 40, left: 80, top: 70, delay: 6 },
    { width: 30, height: 30, left: 50, top: 40, delay: 8 },
    { width: 50, height: 50, left: 10, top: 80, delay: 10 },
  ]

  const pulsingCircles = [
    { size: 200, delay: 0 },
    { size: 300, delay: 0.5 },
    { size: 400, delay: 1 },
  ]

  return (
    <div className="relative w-full h-full">
      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {geometricShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute border border-gray-700"
            style={{
              width: shape.width,
              height: shape.height,
              left: `${shape.left}%`,
              top: `${shape.top}%`,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: shape.delay,
            }}
          />
        ))}
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ width: "100%", height: "100%" }} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/40" />

      {/* Pulsing circles */}
      <div className="absolute inset-0">
        {pulsingCircles.map((circle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-gray-600"
            style={{
              width: circle.size,
              height: circle.size,
              left: "50%",
              top: "50%",
              marginLeft: -(circle.size / 2),
              marginTop: -(circle.size / 2),
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: circle.delay,
            }}
          />
        ))}
      </div>

      {/* Central hexagon */}
      <motion.div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <div className="w-32 h-32 border-2 border-gray-600 transform rotate-45" />
      </motion.div>
    </div>
  )
}
