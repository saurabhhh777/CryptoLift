const { Connection, Keypair, PublicKey, SystemProgram, Transaction } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const PROGRAM_ID = new PublicKey('HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT');

async function main() {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load wallet
    const walletPath = path.join(process.env.HOME || '', '.config/solana/id.json');
    const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
    );
    
    console.log('Wallet address:', walletKeypair.publicKey.toString());
    console.log('Program ID:', PROGRAM_ID.toString());
    
    // Create platform state PDA
    const [platformStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform_state')],
        PROGRAM_ID
    );
    
    console.log('Platform State PDA:', platformStatePda.toString());
    
    // Create fee collector (using wallet as fee collector for now)
    const feeCollector = walletKeypair.publicKey;
    const feeAmount = 10_000_000; // 0.01 SOL in lamports
    
    // Create instruction data for initialize_platform
    // Instruction discriminator for initialize_platform (first 8 bytes)
    const initializePlatformDiscriminator = Buffer.from([
        0x77, 0xc9, 0x65, 0x2d, 0x4b, 0x7a, 0x59, 0x03
    ]);
    
    // Serialize parameters: fee_amount (u64) + fee_collector (Pubkey)
    const feeAmountBuffer = Buffer.alloc(8);
    feeAmountBuffer.writeBigUInt64LE(BigInt(feeAmount), 0);
    
    const feeCollectorBuffer = feeCollector.toBuffer();
    
    const instructionData = Buffer.concat([
        initializePlatformDiscriminator,
        feeAmountBuffer,
        feeCollectorBuffer
    ]);
    
    // Create transaction
    const transaction = new Transaction().add({
        keys: [
            { pubkey: platformStatePda, isSigner: false, isWritable: true },
            { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
    });
    
    try {
        const signature = await connection.sendTransaction(transaction, [walletKeypair], {
            commitment: 'confirmed'
        });
        
        console.log('✅ Platform initialized successfully!');
        console.log('Transaction signature:', signature);
        console.log('Platform State PDA:', platformStatePda.toString());
        console.log('Fee Amount:', feeAmount / 1e9, 'SOL');
        console.log('Fee Collector:', feeCollector.toString());
        
    } catch (error) {
        console.error('❌ Failed to initialize platform:', error);
    }
}

main().catch(console.error); 