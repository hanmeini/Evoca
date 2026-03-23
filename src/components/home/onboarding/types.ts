export type MascotType = "tiger" | "komodo" | "rhino";
export type CommitmentLevel = "santai" | "serius" | "hardcore";

export interface MascotInfo {
  id: MascotType;
  name: string;
  description: string;
  color: string;
  bg: string;
  image: string;
}
