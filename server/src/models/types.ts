export interface Raffle {
  id: string;
  nombre: string;
  premio: string;
  descripcion: string;
  precio_por_numero: number;
  fecha_fin: Date;
  total_numeros: number;
  numeros_vendidos: number[];
  ganador?: {
    numero: number;
    nullifier_hash: string;
  };
}

export interface Participacion {
  raffleId: string;
  nullifier_hash: string;
  numero_asignado: number;
  fecha: Date;
}

export interface ProofData {
  nullifier_hash: string;
  merkle_root: string;
  proof: string;
  verification_level: string;
} 