import { Code, Palette, Lightbulb, Target, Music, Shield, Megaphone, Database, Gamepad2 } from "lucide-react";

export interface CategoryVisual {
  gradient: string;
  icon: typeof Code;
  color: string;
  image: string;
}

const categoryMap: Record<string, CategoryVisual> = {
  // Programming
  "Backend Programmer": { gradient: "from-blue-600/40 to-blue-900/40", icon: Code, color: "text-blue-400", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=1200&fit=crop" },
  "Engine Programmer": { gradient: "from-blue-600/40 to-blue-900/40", icon: Code, color: "text-blue-400", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=1200&fit=crop" },
  "Gameplay Programmer": { gradient: "from-blue-600/40 to-blue-900/40", icon: Code, color: "text-blue-400", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=1200&fit=crop" },
  // Art
  "3D Artist": { gradient: "from-purple-600/40 to-purple-900/40", icon: Palette, color: "text-purple-400", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1200&fit=crop" },
  "2D Artist": { gradient: "from-purple-600/40 to-purple-900/40", icon: Palette, color: "text-purple-400", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=1200&fit=crop" },
  "Technical Artist": { gradient: "from-purple-600/40 to-purple-900/40", icon: Palette, color: "text-purple-400", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=1200&fit=crop" },
  "Art Director": { gradient: "from-purple-600/40 to-purple-900/40", icon: Palette, color: "text-purple-400", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=1200&fit=crop" },
  // Design
  "Game Designer": { gradient: "from-emerald-600/40 to-emerald-900/40", icon: Lightbulb, color: "text-emerald-400", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=1200&fit=crop" },
  // Production
  "Producer": { gradient: "from-amber-600/40 to-amber-900/40", icon: Target, color: "text-amber-400", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1200&fit=crop" },
  "Project Manager": { gradient: "from-amber-600/40 to-amber-900/40", icon: Target, color: "text-amber-400", image: "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=800&h=1200&fit=crop" },
  // Audio
  "Sound Designer": { gradient: "from-pink-600/40 to-pink-900/40", icon: Music, color: "text-pink-400", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=1200&fit=crop" },
  // QA
  "QA Lead": { gradient: "from-cyan-600/40 to-cyan-900/40", icon: Shield, color: "text-cyan-400", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1200&fit=crop" },
  // Marketing
  "Marketing Manager": { gradient: "from-orange-600/40 to-orange-900/40", icon: Megaphone, color: "text-orange-400", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=1200&fit=crop" },
  "UA Manager": { gradient: "from-orange-600/40 to-orange-900/40", icon: Megaphone, color: "text-orange-400", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1200&fit=crop" },
  "Community Manager": { gradient: "from-orange-600/40 to-orange-900/40", icon: Megaphone, color: "text-orange-400", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1200&fit=crop" },
  // Data/DevOps
  "Data Analyst": { gradient: "from-teal-600/40 to-teal-900/40", icon: Database, color: "text-teal-400", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1200&fit=crop" },
  "DevOps Engineer": { gradient: "from-teal-600/40 to-teal-900/40", icon: Database, color: "text-teal-400", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=1200&fit=crop" },
};

const defaultVisual: CategoryVisual = {
  gradient: "from-primary/30 to-primary/10",
  icon: Gamepad2,
  color: "text-primary",
  image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=1200&fit=crop",
};

export function getCategoryVisual(category: string): CategoryVisual {
  return categoryMap[category] || defaultVisual;
}
