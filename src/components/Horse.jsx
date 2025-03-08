import { useRef, useState, useEffect, useMemo } from 'react'
import { Box } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '../hooks/useKeyboardControls'

const Horse = ({ position = [0, 0, 0], color = "#8B4513", isPlayer = false, scale = 1, variant = 'normal' }) => {
  const horseRef = useRef()
  const legsRef = useRef({})
  const movement = useKeyboardControls()
  const [currentSpeed, setCurrentSpeed] = useState(0.1)
  const lastFrameTime = useRef(Date.now())
  const galloping = useRef(null)

  const SPEED_CONFIG = useMemo(() => ({
    MAX_SPEED: 0.3,
    MIN_SPEED: 0.1,
    ACCELERATION_RATE: 0.0015,
    DECELERATION_RATE: 0.003
  }), [])

  useEffect(() => {
    if (isPlayer) {
      galloping.current = new Audio('/sounds/gallop.mp3')
      galloping.current.loop = true
      galloping.current.volume = 0.3
      // Preload the audio
      galloping.current.load()
      
      return () => {
        if (galloping.current) {
          galloping.current.pause()
          galloping.current.currentTime = 0
        }
      }
    }
  }, [isPlayer])

  useFrame((state) => {
    if (!horseRef.current || !isPlayer) return

    const now = Date.now()
    const deltaTime = (now - lastFrameTime.current) / 1000
    lastFrameTime.current = now

    const moving = movement.forward || movement.backward || movement.left || movement.right

    // Optimized speed and sound control
    if (moving) {
      setCurrentSpeed(prev => {
        const newSpeed = Math.min(
          prev + SPEED_CONFIG.ACCELERATION_RATE * deltaTime * 60,
          SPEED_CONFIG.MAX_SPEED
        )
        
        if (galloping.current) {
          if (galloping.current.paused) {
            const playPromise = galloping.current.play()
            if (playPromise) {
              playPromise.catch(() => {})
            }
          }
          
          const speedRatio = (newSpeed - SPEED_CONFIG.MIN_SPEED) / 
                           (SPEED_CONFIG.MAX_SPEED - SPEED_CONFIG.MIN_SPEED)
          galloping.current.volume = Math.min(0.3 + (speedRatio * 0.4), 0.7)
          galloping.current.playbackRate = Math.min(0.8 + (speedRatio * 0.8), 1.6)
        }
        
        return newSpeed
      })
    } else {
      setCurrentSpeed(prev => {
        const newSpeed = Math.max(
          prev - SPEED_CONFIG.DECELERATION_RATE * deltaTime * 60,
          SPEED_CONFIG.MIN_SPEED
        )
        
        if (galloping.current && newSpeed === SPEED_CONFIG.MIN_SPEED) {
          galloping.current.pause()
          galloping.current.currentTime = 0
        }
        
        return newSpeed
      })
    }

    // Movement calculations using deltaTime
    const moveAmount = currentSpeed * deltaTime * 60
    const rotateAmount = moveAmount * 0.5

    if (movement.forward) {
      horseRef.current.position.z -= moveAmount * Math.cos(horseRef.current.rotation.y)
      horseRef.current.position.x -= moveAmount * Math.sin(horseRef.current.rotation.y)
    }
    if (movement.backward) {
      horseRef.current.position.z += moveAmount * Math.cos(horseRef.current.rotation.y)
      horseRef.current.position.x += moveAmount * Math.sin(horseRef.current.rotation.y)
    }
    if (movement.left) {
      horseRef.current.rotation.y += rotateAmount
    }
    if (movement.right) {
      horseRef.current.rotation.y -= rotateAmount
    }

    // Optimized animation timing
    const animationSpeed = 20 + (currentSpeed - SPEED_CONFIG.MIN_SPEED) * 150
    const legAnimation = Math.sin(state.clock.elapsedTime * animationSpeed) * 0.4
    
    Object.values(legsRef.current).forEach((leg, index) => {
      if (leg) {
        if (index < 2) {
          leg.position.y = 0.8 + (moving ? legAnimation : 0)
          leg.position.z = 1 + (moving ? Math.abs(legAnimation) * 0.7 : 0)
        } else {
          leg.position.y = 0.8 - (moving ? legAnimation : 0)
          leg.position.z = -1 - (moving ? Math.abs(legAnimation) * 0.7 : 0)
        }
      }
    })
  })

  const getHorseStyle = (variant) => {
    switch(variant) {
      case 'tall':
        return {
          bodySize: [1.8, 1.4, 3.2],
          neckSize: [0.7, 1.8, 0.9],
          headSize: [0.5, 0.9, 1.3],
          legSize: [0.35, 1.8, 0.35],
          bodyHeight: 2.2,
          neckPos: [0, 3.3, -1.2],
          headPos: [0, 4.2, -1.8]
        }
      case 'sturdy':
        return {
          bodySize: [2.4, 1.1, 2.8],
          neckSize: [0.9, 1.3, 1.1],
          headSize: [0.7, 0.7, 1.1],
          legSize: [0.5, 1.4, 0.5],
          bodyHeight: 1.8,
          neckPos: [0, 2.8, -1],
          headPos: [0, 3.5, -1.6]
        }
      case 'pony':
        return {
          bodySize: [1.6, 1, 2.4],
          neckSize: [0.6, 1.2, 0.8],
          headSize: [0.5, 0.6, 0.9],
          legSize: [0.3, 1.2, 0.3],
          bodyHeight: 1.6,
          neckPos: [0, 2.5, -1],
          headPos: [0, 3.2, -1.5]
        }
      default:
        return {
          bodySize: [2, 1.2, 3],
          neckSize: [0.8, 1.5, 1],
          headSize: [0.6, 0.8, 1.2],
          legSize: [0.4, 1.6, 0.4],
          bodyHeight: 2,
          neckPos: [0, 3, -1.2],
          headPos: [0, 3.8, -1.8]
        }
    }
  }

  const style = getHorseStyle(variant)

  return (
    <group ref={horseRef} position={position} name={isPlayer ? "horse" : "npc-horse"} scale={scale}>
      {/* Body */}
      <Box args={style.bodySize} position={[0, style.bodyHeight, 0]} castShadow>
        <meshStandardMaterial color={color} />
      </Box>

      {/* Neck */}
      <Box args={style.neckSize} position={style.neckPos} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <meshStandardMaterial color={color} />
      </Box>

      {/* Head */}
      <Box args={style.headSize} position={style.headPos} rotation={[Math.PI / 4, 0, 0]} castShadow>
        <meshStandardMaterial color={color} />
      </Box>

      {/* Legs */}
      <Box ref={el => legsRef.current.frontLeft = el} args={style.legSize} position={[-0.5, 0.8, 1]} castShadow>
        <meshStandardMaterial color={color} />
      </Box>

      <Box 
        ref={el => legsRef.current.frontRight = el}
        args={[0.4, 1.6, 0.4]} 
        position={[0.5, 0.8, 1]} 
        castShadow
      >
        <meshStandardMaterial color="#8B4513" />
      </Box>

      <Box 
        ref={el => legsRef.current.backLeft = el}
        args={[0.4, 1.6, 0.4]} 
        position={[-0.5, 0.8, -1]} 
        castShadow
      >
        <meshStandardMaterial color="#8B4513" />
      </Box>

      <Box 
        ref={el => legsRef.current.backRight = el}
        args={[0.4, 1.6, 0.4]} 
        position={[0.5, 0.8, -1]} 
        castShadow
      >
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Tail */}
      <Box args={[0.4, 1, 0.4]} position={[0, 2.5, 1.8]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
    </group>
  )
}

export default Horse