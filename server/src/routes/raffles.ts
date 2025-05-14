import express from 'express';
import { verifyWorldIDProof } from '../utils/verification';
import { selectRaffleWinner } from '../utils/raffle';
import { maskNullifierHash, generateActionId } from '../utils/security';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateParticipacion, validateRaffleId } from '../middleware/validators';
import {
  getActiveRaffles,
  getRaffle,
  addParticipacion,
  getParticipaciones,
  createRaffle,
} from '../models/database';
import { ProofData } from '../models/types';

const router = express.Router();

// GET /
router.get('/', (req, res) => {
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
});

// GET /sorteos
router.get('/', (req, res) => {
  const activeRaffles = getActiveRaffles();
  res.json(activeRaffles);
});

// GET /sorteos/:id
router.get('/:id', validateRaffleId, (req, res) => {
  const raffle = getRaffle(req.params.id);
  if (!raffle) {
    return res.status(404).json({ error: 'Sorteo no encontrado' });
  }
  res.json(raffle);
});

// POST /sorteos/crear
router.post('/crear', (req, res) => {
  const raffle = {
    id: Date.now().toString(),
    nombre: req.body.nombre || "Sorteo de prueba",
    premio: req.body.premio || "100 WLD",
    descripcion: req.body.descripcion || "Un sorteo de prueba",
    precio_por_numero: req.body.precio_por_numero || 1,
    fecha_fin: new Date(req.body.fecha_fin || Date.now() + 24 * 60 * 60 * 1000), // 24 horas por defecto
    total_numeros: req.body.total_numeros || 100,
    numeros_vendidos: [],
  };
  createRaffle(raffle);
  res.json(raffle);
});

// POST /participar
router.post('/participar', rateLimiter, validateParticipacion, async (req, res) => {
  const { raffleId, numero_elegido, proof, action } = req.body;

  // Verify World ID proof with action
  const verificationResult = await verifyWorldIDProof(proof as ProofData, action);
  if (!verificationResult.success) {
    return res.status(400).json({ error: verificationResult.error });
  }

  const raffle = getRaffle(raffleId);
  if (!raffle) {
    return res.status(404).json({ error: 'Sorteo no encontrado' });
  }

  // Check if raffle is still active
  if (new Date() > raffle.fecha_fin) {
    return res.status(400).json({ error: 'El sorteo ha finalizado' });
  }

  // Check if there are numbers available
  if (raffle.numeros_vendidos.length >= raffle.total_numeros) {
    return res.status(400).json({ error: 'No hay números disponibles' });
  }

  // Assign number
  let numero_asignado = numero_elegido;
  if (!numero_elegido) {
    // Find first available number
    const numeros_disponibles = Array.from(
      { length: raffle.total_numeros },
      (_, i) => i + 1
    ).filter(n => !raffle.numeros_vendidos.includes(n));
    
    numero_asignado = numeros_disponibles[Math.floor(Math.random() * numeros_disponibles.length)];
  } else {
    // Validate chosen number
    if (numero_elegido < 1 || numero_elegido > raffle.total_numeros) {
      return res.status(400).json({ error: 'Número fuera de rango' });
    }
    if (raffle.numeros_vendidos.includes(numero_elegido)) {
      return res.status(400).json({ error: 'Número ya vendido' });
    }
  }

  // Add participation
  addParticipacion({
    raffleId,
    nullifier_hash: proof.nullifier_hash,
    numero_asignado,
    fecha: new Date(),
  });

  res.json({
    mensaje: 'Participación exitosa',
    numero_asignado,
    nullifier_hash_masked: maskNullifierHash(proof.nullifier_hash)
  });
});

// GET /sorteos/:id/ganador
router.get('/:id/ganador', validateRaffleId, (req, res) => {
  const raffle = getRaffle(req.params.id);
  if (!raffle) {
    return res.status(404).json({ error: 'Sorteo no encontrado' });
  }

  if (!raffle.ganador) {
    // Check if raffle has ended and select winner
    if (new Date() > raffle.fecha_fin) {
      selectRaffleWinner(req.params.id);
      // Get updated raffle
      const updatedRaffle = getRaffle(req.params.id);
      if (updatedRaffle?.ganador) {
        return res.json({
          numero: updatedRaffle.ganador.numero,
          nullifier_hash_masked: maskNullifierHash(updatedRaffle.ganador.nullifier_hash)
        });
      }
    }
    return res.status(404).json({ error: 'El sorteo aún no tiene ganador' });
  }

  res.json({
    numero: raffle.ganador.numero,
    nullifier_hash_masked: maskNullifierHash(raffle.ganador.nullifier_hash)
  });
});

export default router; 