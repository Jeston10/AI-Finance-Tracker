"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import the entire ThreeDScene to avoid SSR issues
const ThreeDSceneComponent = dynamic(() => import("./three-d-scene-client"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-600 font-medium">Loading 3D Scene...</p>
      </div>
    </div>
  )
})

export function ThreeDScene() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading 3D Scene...</p>
        </div>
      </div>
    )
  }

  return <ThreeDSceneComponent />
}
