import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

export function CameraControls() {
  const targetPosition = new THREE.Vector3()
  const offset = new THREE.Vector3(0, 3, 12)
  const [rotation, setRotation] = useState(0)
  const isMouseDown = useRef(false)
  const lastMouseX = useRef(0)

  useFrame(({ camera, scene }) => {
    const horse = scene.getObjectByName('horse')
    if (horse) {
      // Calculate rotated offset
      const rotatedOffset = offset.clone()
      rotatedOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation)
      
      // Apply offset to target position
      targetPosition.copy(horse.position).add(rotatedOffset)
      
      // Update camera position
      camera.position.lerp(targetPosition, 0.1)
      camera.lookAt(horse.position.x, horse.position.y + 1, horse.position.z)
    }
  })

  // Add mouse event handlers
  const handleMouseDown = (e) => {
    isMouseDown.current = true
    lastMouseX.current = e.clientX
  }

  const handleMouseMove = (e) => {
    if (isMouseDown.current) {
      const delta = (e.clientX - lastMouseX.current) * 0.005
      setRotation(prev => prev - delta)
      lastMouseX.current = e.clientX
    }
  }

  const handleMouseUp = () => {
    isMouseDown.current = false
  }

  // Add event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return null
}