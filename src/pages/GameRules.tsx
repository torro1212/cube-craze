import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const GameRules = () => {
  const navigate = useNavigate();

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

      {/* Navigation */}
      <header className="relative z-10 p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </header>

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

export default GameRules; 