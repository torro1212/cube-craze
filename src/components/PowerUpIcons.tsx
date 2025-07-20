import { Zap, Shield, RotateCcw } from "lucide-react";

export const PowerUpIcons = () => {
  const powerUps = [
    {
      icon: Zap,
      name: "Color Bomb",
      description: "Removes all blocks of one color",
      className: "power-up-icon text-neon-yellow"
    },
    {
      icon: Shield,
      name: "Shield",
      description: "10s immunity protection",
      className: "power-up-icon text-neon-turquoise"
    },
    {
      icon: RotateCcw,
      name: "Gravity Flip",
      description: "Flips board 180°",
      className: "power-up-icon text-neon-magenta"
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {powerUps.map((powerUp, index) => (
        <div
          key={powerUp.name}
          className={`${powerUp.className} p-4 w-16 h-16 flex items-center justify-center cursor-pointer`}
          title={powerUp.description}
        >
          <powerUp.icon size={32} />
        </div>
      ))}
    </div>
  );
};