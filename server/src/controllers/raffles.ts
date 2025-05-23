import { Request, Response, NextFunction } from 'express';
import { verifyWorldIDProof } from '../utils/verification';
import { selectRaffleWinner } from '../utils/raffle';
import { maskNullifierHash } from '../utils/security';
import {
  getActiveRaffles,
  getRaffle,
  addParticipacion,
  getParticipaciones,
  createRaffle,
} from '../models/database';
import { ProofData } from '../models/types';

export const getInfo = (req: Request, res: Response): void => {
  res.json({
    message: 'WinTrust API',
    version: '1.0.0',
    endpoints: {
      'GET /sorteos': 'Lista todos los sorteos activos',
      'GET /sorteos/:id': 'Obtiene detalles de un sorteo',
      'POST /sorteos/participar': 'Permite participar en un sorteo',
      'GET /sorteos/:id/ganador': 'Obtiene el ganador de un sorteo',
      'POST /sorteos/crear': 'Crea un nuevo sorteo (solo admin)'
    }
  });
};

export const getRaffles = (req: Request, res: Response): void => {
  const activeRaffles = getActiveRaffles();
  res.json(activeRaffles);
};

export const getRaffleById = (req: Request, res: Response): void => {
  const raffle = getRaffle(req.params.id);
  if (!raffle) {
    res.status(404).json({ error: 'Sorteo no encontrado' });
    return;
  }
  res.json(raffle);
};

export const createNewRaffle = (req: Request, res: Response): void => {
  const raffle = {
    id: Date.now().toString(),
    nombre: req.body.nombre || "Sorteo de prueba",
    premio: req.body.premio || "100 WLD",
    descripcion: req.body.descripcion || "Un sorteo de prueba",
    precio_por_numero: req.body.precio_por_numero || 1,
    fecha_fin: new Date(req.body.fecha_fin || Date.now() + 24 * 60 * 60 * 1000),
    total_numeros: req.body.total_numeros || 100,
    numeros_vendidos: [],
  };
  createRaffle(raffle);
  res.json(raffle);
};

export const participate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { raffleId, numero_elegido, proof, action } = req.body;

  try {
    const verificationResult = await verifyWorldIDProof(proof as ProofData, action);
    if (!verificationResult.success) {
      res.status(400).json({ error: verificationResult.error });
      return;
    }

    const raffle = getRaffle(raffleId);
    if (!raffle) {
      res.status(404).json({ error: 'Sorteo no encontrado' });
      return;
    }

    if (new Date() > raffle.fecha_fin) {
      res.status(400).json({ error: 'El sorteo ha finalizado' });
      return;
    }

    if (raffle.numeros_vendidos.length >= raffle.total_numeros) {
      res.status(400).json({ error: 'No hay números disponibles' });
      return;
    }

    let numero_asignado: number;
    if (!numero_elegido) {
      const numeros_disponibles = Array.from(
        { length: raffle.total_numeros },
        (_, i) => i + 1
      ).filter(n => !raffle.numeros_vendidos.includes(n));
      numero_asignado = numeros_disponibles[Math.floor(Math.random() * numeros_disponibles.length)];
    } else {
      if (numero_elegido < 1 || numero_elegido > raffle.total_numeros) {
        res.status(400).json({ error: 'Número fuera de rango' });
        return;
      }
      if (raffle.numeros_vendidos.includes(numero_elegido)) {
        res.status(400).json({ error: 'Número ya vendido' });
        return;
      }
      numero_asignado = numero_elegido;
    }

    addParticipacion({
      raffleId,
      nullifier_hash: proof.nullifier_hash,
      numero_asignado,
      fecha: new Date(),
    });

    res.json({
      mensaje: 'Participación exitosa',
      numero_asignado,
      nullifier_hash_masked: maskNullifierHash(proof.nullifier_hash),
    });
  } catch (error) {
    next(error);
  }
};

export const getWinner = (req: Request, res: Response): void => {
  const raffle = getRaffle(req.params.id);
  if (!raffle) {
    res.status(404).json({ error: 'Sorteo no encontrado' });
    return;
  }

  if (!raffle.ganador) {
    if (new Date() > raffle.fecha_fin) {
      selectRaffleWinner(req.params.id);
      const updatedRaffle = getRaffle(req.params.id);
      if (updatedRaffle?.ganador) {
        res.json({
          numero: updatedRaffle.ganador.numero,
          nullifier_hash_masked: maskNullifierHash(updatedRaffle.ganador.nullifier_hash)
        });
        return;
      }
    }
    res.status(404).json({ error: 'El sorteo aún no tiene ganador' });
    return;
  }

  res.json({
    numero: raffle.ganador.numero,
    nullifier_hash_masked: maskNullifierHash(raffle.ganador.nullifier_hash)
  });
};