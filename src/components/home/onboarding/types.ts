export type MascotType = "tiger" | "komodo" | "rhino" | "yeti" | "cendrawasih" | "orangutan" | "tarsius";
export type CommitmentLevel = "santai" | "serius" | "hardcore";

export interface MascotInfo {
  id: MascotType;
  name: string;
  description: string;
  color: string;
  bg: string;
  image: string;
  price?: number;
}
