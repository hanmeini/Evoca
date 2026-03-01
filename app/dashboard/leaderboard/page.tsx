import { Trophy, Star, Shield, Flame } from "lucide-react";
import Image from "next/image";

export default function LeaderboardPage() {
  const users = [
    {
      name: "Andi Saputra",
      score: 2450,
      rank: 1,
      color: "bg-amber-100 text-amber-600",
    },
    {
      name: "Budi Santoso",
      score: 2100,
      rank: 2,
      color: "bg-stone-200 text-stone-600",
    },
    {
      name: "Citra Lestari",
      score: 1950,
      rank: 3,
      color: "bg-orange-100 text-orange-600",
    },
    {
      name: "Dimas Anggara",
      score: 1800,
      rank: 4,
      color: "bg-transparent text-stone-400",
    },
    {
      name: "Eka Putri",
      score: 1750,
      rank: 5,
      color: "bg-transparent text-stone-400",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 min-h-screen">
      <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-[3rem] p-10 mb-12 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-300 drop-shadow-lg" />
        <h1 className="font-serif text-3xl md:text-5xl font-black mb-2 relative z-10">
          Leaderboard Global
        </h1>
        <p className="font-bold text-indigo-100 relative z-10 text-lg">
          Jadilah yang terbaik di Evoca!
        </p>
      </div>

      <div className="space-y-4">
        {users.map((u, idx) => (
          <div
            key={idx}
            className="bg-white border-2 border-stone-100 rounded-[2rem] p-5 flex items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${u.color} shadow-inner`}
              >
                {u.rank <= 3 ? `#${u.rank}` : u.rank}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-full overflow-hidden flex items-center justify-center font-black text-stone-500">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-lg">{u.name}</p>
                  <p className="text-xs font-bold text-stone-400 tracking-widest uppercase">
                    Level {6 - u.rank}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-2xl shadow-inner border border-rose-100">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="font-black text-rose-600">{u.score} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
