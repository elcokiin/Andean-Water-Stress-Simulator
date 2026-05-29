import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Sphere, Grid, Float } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ModelScene() {
  return (
    <div className="relative h-screen w-full bg-background font-sans">
      <header className="absolute top-0 left-0 z-50 p-6">
        <Button variant="outline" size="sm" asChild className="rounded-full backdrop-blur-md bg-background/50">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
          </Link>
        </Button>
      </header>
      
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-end pb-24">
        <div className="bg-background/80 backdrop-blur-xl border border-border/50 p-6 rounded-2xl shadow-xl max-w-md text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Simulación Dinámica</h2>
          <p className="text-muted-foreground text-sm">
            Representación interactiva de los reservorios hídricos. (Modelo en desarrollo).
          </p>
        </div>
      </div>

      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Environment preset="city" />
        
        <Grid 
          infiniteGrid 
          fadeDistance={20} 
          fadeStrength={5} 
          cellColor="#3b82f6" 
          sectionColor="#1e3a8a" 
        />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Sphere args={[1, 64, 64]} position={[0, 1, 0]}>
            <meshStandardMaterial 
              color="#3b82f6" 
              wireframe 
              emissive="#1e3a8a" 
              emissiveIntensity={0.5} 
            />
          </Sphere>
        </Float>
        
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}