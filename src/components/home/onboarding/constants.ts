import { MascotInfo } from "./types";

export const MASCOTS: MascotInfo[] = [
  {
    id: "tiger",
    name: "Tiger Ninja",
    description: "Si Pemberani yang fokus dan tajam.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    image: "/pet/tiger/image.png",
    price: 0
  },
  {
    id: "komodo",
    name: "Komodo Sage",
    description: "Si Pintar yang strategis dan tenang.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    image: "/pet/komodo/image.png",
    price: 300
  },
  {
    id: "rhino",
    name: "Rhino Tank",
    description: "Si Tangguh yang konsisten dan kuat.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    image: "/pet/rhino/image.png",
    price: 600
  },
  {
    id: "yeti",
    name: "Yeti Legend",
    description: "Legenda pegunungan yang sangat kuat.",
    color: "text-slate-600",
    bg: "bg-slate-50",
    image: "/pet/yeti/image.png",
    price: 1000
  },
  {
    id: "cendrawasih",
    name: "Cendrawasih",
    description: "Keindahan surga dari tanah Papua.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    image: "/pet/cendrawasih/image.png",
    price: 1500
  },
  {
    id: "orangutan",
    name: "Orangutan",
    description: "Penjaga hutan yang bijak dan kuat.",
    color: "text-orange-800",
    bg: "bg-orange-50",
    image: "/pet/orangutan/image.png",
    price: 2000
  },
  {
    id: "tarsius",
    name: "Tarsius",
    description: "Si Kecil bermata besar yang lincah.",
    color: "text-stone-600",
    bg: "bg-stone-50",
    image: "/pet/tarsius/image.png",
    price: 2500
  },
];

export const STROKE_STYLE = {
  WebkitTextStroke: "2px white",
  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

export const LOADING_TIPS = [
  "Belajar 15 menit setiap hari lebih efektif daripada 3 jam sekali seminggu.",
  "Kumpulkan koin untuk membuka item langka di toko quest!",
  "Selesaikan quest harian untuk menjaga streak belajarmu.",
  "Leaderboard diperbarui secara real-time. Kejar rank tertinggimu!",
  "Coba AI Reader untuk merangkum dokumen panjang dalam sekejap.",
];

export const LOADING_LOGS = [
  "Membangun Peta Pertualangan...",
  "Menyusun Quest Harian...",
  "Menyiapkan Partner Belajarmu...",
  "Mengasah Konsentrasi...",
  "Menyebar Treasure Chest...",
  "Mensinkronisasi Jadwal Belajar...",
  "Membangkitkan Semangat Belajar!"
];
