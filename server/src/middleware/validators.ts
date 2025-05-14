import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ProofData } from '../models/types';

export const validateParticipacion: RequestHandler = (req, res, next) => {
  const { raffleId, numero_elegido, proof } = req.body;

  // Validate raffleId
  if (!raffleId || typeof raffleId !== 'string') {
    res.status(400).json({ error: 'raffleId inválido' });
    return;
  }

  // Validate numero_elegido if provided
  if (numero_elegido !== undefined) {
    const num = Number(numero_elegido);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      res.status(400).json({ error: 'numero_elegido debe ser un entero positivo' });
      return;
    }
  }

  // Validate proof
  if (!proof || typeof proof !== 'object') {
    res.status(400).json({ error: 'proof inválido' });
    return;
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
      res.status(400).json({ error: `Campo ${field} inválido en proof` });
      return;
    }
  }

  next();
};

export const validateRaffleId: RequestHandler = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'ID de sorteo inválido' });
    return;
  }
  next();
}; 