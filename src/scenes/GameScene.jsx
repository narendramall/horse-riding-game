import { useRef } from 'react'
import { Plane } from '@react-three/drei'
import Horse from '../components/Horse'

const GameScene = () => {
  const groundRef = useRef()

  return (
    <>
      <Plane
        ref={groundRef}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        args={[100, 100]}
      >
        <meshStandardMaterial color="#90EE90" />
      </Plane>

      {/* Player's Horse - Normal variant */}
      <Horse 
        position={[0, 0, 0]} 
        color="#8B4513" 
        isPlayer={true} 
        variant="normal"
        scale={1} 
      />

      {/* Tall, elegant horse */}
      <Horse 
        position={[-5, 0, -5]} 
        color="#2F1700" 
        variant="tall"
        scale={1.1} 
      />

      {/* Sturdy, strong horse */}
      <Horse 
        position={[5, 0, -3]} 
        color="#D4A675" 
        variant="sturdy"
        scale={0.9} 
      />

      {/* Small pony */}
      <Horse 
        position={[-3, 0, 5]} 
        color="#FFE4C4" 
        variant="pony"
        scale={0.8} 
      />

      {/* Dark, muscular horse */}
      <Horse 
        position={[4, 0, 4]} 
        color="#1A0F00" 
        variant="sturdy"
        scale={1.2} 
      />
    </>
  )
}

export default GameScene