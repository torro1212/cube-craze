import heroImage from "@/assets/cube-craze-hero.jpg";
import { HeroTitle } from "@/components/HeroTitle";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-dark to-space-light">
        <div className="absolute inset-0 opacity-30">
          {/* Animated stars */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation Space */}
      <header className="relative z-10 h-12" />

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 py-4">
        <div className="flex justify-center items-center min-h-[600px]">
          
          {/* Centered Content */}
          <div className="text-center">
            <HeroTitle />
          </div>

        </div>
      </main>
    </div>
  );
};

export default Index;
