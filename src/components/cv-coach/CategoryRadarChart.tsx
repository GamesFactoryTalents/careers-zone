import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

interface Category {
  name: string;
  score: number;
}

interface CategoryRadarChartProps {
  categories: Category[];
}

export default function CategoryRadarChart({ categories }: CategoryRadarChartProps) {
  const data = categories.map((c) => ({
    subject: c.name.split(" ")[0], // Short label
    score: c.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(240 6% 20%)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "hsl(240 5% 55%)", fontSize: 10, fontFamily: "Rajdhani" }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(0 72% 51%)"
            fill="hsl(0 72% 51%)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
