import express from 'express';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateParticipacion, validateRaffleId } from '../middleware/validators';
import {
  getInfo,
  getRaffles,
  getRaffleById,
  createNewRaffle,
  participate,
  getWinner
} from '../controllers/raffles';

const router = express.Router();

// GET /
router.get('/', getInfo);

// GET /sorteos
router.get('/sorteos', getRaffles);

// GET /sorteos/:id
router.get('/sorteos/:id', validateRaffleId, getRaffleById);

// POST /sorteos/crear
router.post('/sorteos/crear', createNewRaffle);

// POST /sorteos/participar
router.post('/sorteos/participar', rateLimiter, validateParticipacion, participate);

// GET /sorteos/:id/ganador
router.get('/sorteos/:id/ganador', validateRaffleId, getWinner);

export default router;
