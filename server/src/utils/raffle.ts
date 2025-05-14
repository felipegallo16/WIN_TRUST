import { getRaffle, setRaffleWinner } from '../models/database';

export const selectRaffleWinner = (raffleId: string): void => {
  const raffle = getRaffle(raffleId);
  if (!raffle || raffle.ganador || raffle.numeros_vendidos.length === 0) {
    return;
  }

  // Select a random number from the sold numbers
  const randomIndex = Math.floor(Math.random() * raffle.numeros_vendidos.length);
  const winningNumber = raffle.numeros_vendidos[randomIndex];

  // Find the participation with the winning number
  const participaciones = raffle.numeros_vendidos.map((numero, index) => ({
    numero,
    nullifier_hash: `participant_${index}`, // In a real system, this would come from the database
  }));

  const winner = participaciones.find(p => p.numero === winningNumber);
  if (winner) {
    setRaffleWinner(raffleId, winner.numero, winner.nullifier_hash);
  }
}; 