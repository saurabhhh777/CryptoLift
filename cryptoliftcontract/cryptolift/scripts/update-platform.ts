import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const PROGRAM_ID = new PublicKey('HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT');

// Generate instruction discriminator
function getInstructionDiscriminator(instructionName: string): Buffer {
  const data = `global:${instructionName}`;
  const hash = createHash('sha256').update(data).digest();
  return hash.slice(0, 8);
}

async function main() {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load wallet
    const walletPath = join(process.env.HOME || '', '.config/solana/id.json');
    const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(walletPath, 'utf-8')))
    );
    
    console.log('Wallet address:', walletKeypair.publicKey.toString());
    console.log('Program ID:', PROGRAM_ID.toString());
    
    // Create platform state PDA
    const [platformStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform_state')],
        PROGRAM_ID
    );
    
    console.log('Platform State PDA:', platformStatePda.toString());
    
    // Set correct fee amount
    const feeAmount = 10_000_000; // 0.01 SOL in lamports
    
    // Create instruction data for update_fee
    const updateFeeDiscriminator = getInstructionDiscriminator('update_fee');
    console.log('Update fee discriminator:', updateFeeDiscriminator.toString('hex'));
    
    // Serialize parameters: new_fee_amount (u64)
    const feeAmountBuffer = Buffer.alloc(8);
    feeAmountBuffer.writeBigUInt64LE(BigInt(feeAmount), 0);
    
    const instructionData = Buffer.concat([
        updateFeeDiscriminator,
        feeAmountBuffer
    ]);
    
    console.log('Instruction data length:', instructionData.length);
    console.log('Instruction data (hex):', instructionData.toString('hex'));
    
    // Create transaction
    const transaction = new Transaction().add({
        keys: [
            { pubkey: platformStatePda, isSigner: false, isWritable: true },
            { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
    });
    
    try {
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [walletKeypair],
            { commitment: 'confirmed' }
        );
        
        console.log('✅ Platform fee updated successfully!');
        console.log('Transaction signature:', signature);
        console.log('New Fee Amount:', feeAmount / 1e9, 'SOL');
        
    } catch (error: any) {
        console.error('❌ Failed to update platform fee:', error);
        if (error.transactionLogs) {
            console.error('Transaction logs:', error.transactionLogs);
        }
    }
}

main().catch(console.error); 