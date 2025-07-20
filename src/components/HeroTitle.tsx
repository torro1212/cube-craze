export const HeroTitle = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="neon-text text-6xl md:text-8xl font-bold tracking-tight">
          Cube Craze
        </h1>
        <div className="text-2xl md:text-3xl font-semibold text-foreground/90 tracking-wide">
          <span className="text-neon-turquoise">Drag</span>
          <span className="text-white mx-2">•</span>
          <span className="text-neon-yellow">Match</span>
          <span className="text-white mx-2">•</span>
          <span className="text-neon-magenta">Blast!</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-lg text-foreground/80 max-w-md leading-relaxed">
          Master the ultimate block puzzle challenge! Drag polyomino shapes, clear lines, 
          and trigger epic combos in this colorful 3D adventure.
        </p>
        
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl neon-glow hover:scale-105 transition-all duration-300">
            Play Now
          </button>
          <button className="px-8 py-3 border-2 border-neon-purple text-neon-purple font-semibold rounded-xl hover:bg-neon-purple hover:text-white transition-all duration-300">
            Learn Rules
          </button>
        </div>
      </div>
    </div>
  );
};