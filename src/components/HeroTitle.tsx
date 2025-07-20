import { useNavigate } from "react-router-dom";
import headlineImage from "@/assets/headline.png";

export const HeroTitle = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-[10px]">
        <div className="flex justify-center -mt-20 -mb-10">
          <img 
            src={headlineImage} 
            alt="CUBE CRAZE" 
            className="max-w-full h-auto max-h-64 md:max-h-80 lg:max-h-96 xl:max-h-[28rem] 2xl:max-h-[32rem] object-contain scale-100"
          />
        </div>
        <div className="text-2xl md:text-3xl font-semibold text-foreground/90 tracking-wide">
          <span className="text-neon-turquoise">Drag</span>
          <span className="text-white mx-2">•</span>
          <span className="text-neon-yellow">Match</span>
          <span className="text-white mx-2">•</span>
          <span className="text-neon-magenta">Blast!</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-lg text-foreground/80 max-w-md mx-auto leading-relaxed">
          Master the ultimate block puzzle challenge! Drag polyomino shapes, clear lines, 
          and trigger epic combos in this colorful 3D adventure.
        </p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate('/game')}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl neon-glow hover:scale-105 transition-all duration-300"
          >
            Play Now
          </button>
          <button 
            onClick={() => navigate('/rules')}
            className="px-8 py-3 border-2 border-neon-purple text-neon-purple font-semibold rounded-xl hover:bg-neon-purple hover:text-white transition-all duration-300"
          >
            Game Rules
          </button>
        </div>
      </div>
    </div>
  );
};