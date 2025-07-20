import heroImage from "@/assets/cube-craze-hero.jpg";
import { GameBoard } from "@/components/GameBoard";
import { PowerUpIcons } from "@/components/PowerUpIcons";
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
      <header className="relative z-10 h-20" />

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          
          {/* Left Side - Title and CTAs */}
          <div className="space-y-8">
            <HeroTitle />
            
            {/* Power-ups at bottom left */}
            <div className="pt-8">
              <h3 className="text-lg font-semibold text-foreground/80 mb-4">Power-Ups</h3>
              <PowerUpIcons />
            </div>
          </div>

          {/* Right Side - Game Board */}
          <div className="flex justify-center items-center">
            <GameBoard className="max-w-md" />
          </div>
        </div>

        {/* Zaffo Brand Stamp */}
        <div className="absolute bottom-8 right-8">
          <p className="text-white/40 text-sm font-medium tracking-wider">
            by ZAFFO
          </p>
        </div>
      </main>

      {/* Game Rules Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 neon-text">
            How to Play
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Drag & Drop",
                description: "Place three random polyomino shapes on the 10×10 board",
                icon: "🎯"
              },
              {
                title: "Clear Lines",
                description: "Fill entire rows or columns to clear them and earn points",
                icon: "⚡"
              },
              {
                title: "Build Combos",
                description: "Clear multiple lines in one move for massive score multipliers",
                icon: "🔥"
              },
              {
                title: "Charge Colors",
                description: "Fill color bars to unlock Rainbow Blocks that clear entire colors",
                icon: "🌈"
              },
              {
                title: "Gravity Flip",
                description: "Watch ads to flip the board and create new opportunities",
                icon: "🔄"
              },
              {
                title: "Stay Alive",
                description: "Keep placing shapes - if none fit, the game ends!",
                icon: "💎"
              }
            ].map((rule, index) => (
              <div
                key={index}
                className="game-cube p-6 text-center space-y-4"
              >
                <div className="text-4xl">{rule.icon}</div>
                <h3 className="text-xl font-semibold text-primary">
                  {rule.title}
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
