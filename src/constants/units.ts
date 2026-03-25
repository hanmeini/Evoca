export interface MonsterStage {
  name: string;
  image: string;
  video?: string;
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  monsters: MonsterStage[]; // Array of 4 stages for the first 4 nodes
  theme: "evoca1" | "evoca2" | "evoca3" | "evoca4" | "evoca5";
  bgGradient: string;
}

export const UNITS: Unit[] = [
  {
    id: 1,
    title: "Unit 1: Awal Petualangan",
    description: "Kenali dasar-dasar dunia Evoca bersama Yeti Muda.",
    monsters: [
      {
        name: "Yeti Muda",
        image: "/images/monsters/unit-1/young.jpeg",
      },
      {
        name: "Yeti Remaja",
        image: "/images/monsters/unit-1/teen.jpeg",
      },
      {
        name: "Yeti Dewasa",
        image: "/images/monsters/unit-1/adult.jpeg",
      },
    ],
    theme: "evoca1",
    bgGradient: "from-violet-500 to-purple-600"
  },
  {
    id: 2,
    title: "Unit 2: Hutan Berkabut",
    description: "Hadapi tantangan di dalam hutan misterius.",
    monsters: [
      { name: "Dragon Kecil", image: "/images/monsters/unit-2/young.jpeg" },
      { name: "Dragon Remaja", image: "/images/monsters/unit-2/teen.jpeg" },
      { name: "Dragon Dewasa", image: "/images/monsters/unit-2/adult.jpeg" }
    ],
    theme: "evoca2",
    bgGradient: "from-emerald-500 to-teal-600"
  },
  {
    id: 3,
    title: "Unit 3: Puncak Salju",
    description: "Bertahan di suhu ekstrem dan temukan rahasia es.",
    monsters: [
      { name: "Phoenix Kecil", image: "/images/monsters/unit-3/young.jpeg" },
      { name: "Phoenix Remaja", image: "/images/monsters/unit-3/teen.jpeg" },
      { name: "Phoenix Dewasa", image: "/images/monsters/unit-3/adult.jpeg" }
    ],
    theme: "evoca3",
    bgGradient: "from-blue-500 to-indigo-600"
  },
  {
    id: 4,
    title: "Unit 4: Lembah Api",
    description: "Buktikan ketangguhanmu di tempat yang membara.",
    monsters: [
      { name: "Kraken Kecil", image: "/images/monsters/unit-4/young.jpeg" },
      { name: "Kraken Remaja", image: "/images/monsters/unit-4/teen.jpeg" },
      { name: "Kraken Dewasa", image: "/images/monsters/unit-4/adult.jpeg" }
    ],
    theme: "evoca4",
    bgGradient: "from-rose-500 to-pink-600"
  },
  {
    id: 5,
    title: "Unit 5: Kerajaan Langit",
    description: "Capai puncak tertinggi dan jadilah Legenda.",
    monsters: [
      { name: "Golem Kecil", image: "/images/monsters/unit-5/young.jpeg" },
      { name: "Golem Remaja", image: "/images/monsters/unit-5/teen.jpeg" },
      { name: "Golem Dewasa", image: "/images/monsters/unit-5/adult.jpeg" }
    ],
    theme: "evoca5",
    bgGradient: "from-sky-500 to-blue-600"
  }
];
