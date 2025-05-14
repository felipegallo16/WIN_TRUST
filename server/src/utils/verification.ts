import { verifyCloudProof } from '@worldcoin/idkit';
import { ProofData } from '../models/types';
import { checkNullifierHashReuse } from './security';

export const verifyWorldIDProof = async (
  proofData: ProofData,
  action: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if nullifier hash was already used for this action
    if (checkNullifierHashReuse(action, proofData.nullifier_hash)) {
      return {
        success: false,
        error: 'Este proof ya fue utilizado para esta acción'
      };
    }

    const result = await verifyCloudProof(
      {
        proof: proofData.proof,
        merkle_root: proofData.merkle_root,
        nullifier_hash: proofData.nullifier_hash,
      },
      process.env.APP_ID || '',
      action,
      action // Use the action as signal
    );

    if (!result.success) {
      return {
        success: false,
        error: 'Verificación de World ID fallida'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error verifying World ID proof:', error);
    return {
      success: false,
      error: 'Error interno en la verificación'
    };
  }
}; 