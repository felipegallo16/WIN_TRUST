import { Request, Response, NextFunction } from 'express';
import { ProofData } from '../models/types';

export const validateParticipacion = (req: Request, res: Response, next: NextFunction) => {
  const { raffleId, numero_elegido, proof } = req.body;

  // Validate raffleId
  if (!raffleId || typeof raffleId !== 'string') {
    return res.status(400).json({ error: 'raffleId inválido' });
  }

  // Validate numero_elegido if provided
  if (numero_elegido !== undefined) {
    const num = Number(numero_elegido);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      return res.status(400).json({ error: 'numero_elegido debe ser un entero positivo' });
    }
  }

  // Validate proof
  if (!proof || typeof proof !== 'object') {
    return res.status(400).json({ error: 'proof inválido' });
  }

  const requiredProofFields: (keyof ProofData)[] = [
    'nullifier_hash',
    'merkle_root',
    'proof',
    'verification_level'
  ];

  // Type assertion for proof object
  const proofObj = proof as Record<string, unknown>;

  for (const field of requiredProofFields) {
    if (!proofObj[field] || typeof proofObj[field] !== 'string') {
      return res.status(400).json({ error: `Campo ${field} inválido en proof` });
    }
  }

  next();
};

export const validateRaffleId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de sorteo inválido' });
  }
  next();
}; 