import { Raffle, Participacion } from './types';

// In-memory database
const raffles: Map<string, Raffle> = new Map();
const participaciones: Map<string, Participacion[]> = new Map();

// Helper functions
export const getRaffle = (id: string): Raffle | undefined => {
  return raffles.get(id);
};

export const getAllRaffles = (): Raffle[] => {
  return Array.from(raffles.values());
};

export const getActiveRaffles = (): Raffle[] => {
  const now = new Date();
  return Array.from(raffles.values()).filter(raffle => raffle.fecha_fin > now);
};

export const createRaffle = (raffle: Raffle): void => {
  raffles.set(raffle.id, raffle);
  participaciones.set(raffle.id, []);
};

export const getParticipaciones = (raffleId: string): Participacion[] => {
  return participaciones.get(raffleId) || [];
};

export const addParticipacion = (participacion: Participacion): void => {
  const raffleParticipaciones = participaciones.get(participacion.raffleId) || [];
  raffleParticipaciones.push(participacion);
  participaciones.set(participacion.raffleId, raffleParticipaciones);
  
  // Update raffle numbers
  const raffle = raffles.get(participacion.raffleId);
  if (raffle) {
    raffle.numeros_vendidos.push(participacion.numero_asignado);
    raffles.set(participacion.raffleId, raffle);
  }
};

export const setRaffleWinner = (raffleId: string, numero: number, nullifier_hash: string): void => {
  const raffle = raffles.get(raffleId);
  if (raffle) {
    raffle.ganador = { numero, nullifier_hash };
    raffles.set(raffleId, raffle);
  }
}; 