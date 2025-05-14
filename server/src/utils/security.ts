import crypto from 'crypto';

// Store for tracking used nullifier hashes per action
const usedNullifierHashes: Map<string, Set<string>> = new Map();

export const maskNullifierHash = (hash: string): string => {
  // Return only last 4 characters
  return `****${hash.slice(-4)}`;
};

export const checkNullifierHashReuse = (action: string, nullifierHash: string): boolean => {
  if (!usedNullifierHashes.has(action)) {
    usedNullifierHashes.set(action, new Set());
  }

  const actionHashes = usedNullifierHashes.get(action)!;
  if (actionHashes.has(nullifierHash)) {
    return true; // Hash already used for this action
  }

  actionHashes.add(nullifierHash);
  return false;
};

export const generateActionId = (raffleId: string): string => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `sorteo_${raffleId}_${timestamp}_${random}`;
}; 