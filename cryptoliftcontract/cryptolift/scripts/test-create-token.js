const { Connection, Keypair, PublicKey, SystemProgram, Transaction } = require('@solana/web3.js');
const { createHash } = require('crypto');
const { readFileSync } = require('fs');
const { join } = require('path');

const PROGRAM_ID = new PublicKey('HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT');
const PLATFORM_STATE_PDA = new PublicKey("2SA1br9zQYN6JC3fZVDgDHStTC1rtz9G8hSCkh71WqZW");
const FEE_COLLECTOR = new PublicKey("FiULaF42tPHhrQwvbKUnpjHdXGytQPos7Sp3nVcikqGQ");
const FEE_AMOUNT = 0.01 * 1e9; // 0.01 SOL

// Generate instruction discriminator
function getInstructionDiscriminator(instructionName) {
    const data = `global:${instructionName}`;
    const hash = createHash('sha256').update(data).digest();
    return hash.slice(0, 8);
}

// Convert string to buffer
function stringToBuffer(str) {
    return Buffer.from(str, 'utf8');
}

// Convert number to buffer
function numberToBuffer(num, bytes) {
    const buffer = Buffer.alloc(bytes);
    if (bytes === 1) {
        buffer.writeUInt8(num, 0);
    } else if (bytes === 4) {
        buffer.writeUInt32LE(num, 0);
    } else if (bytes === 8) {
        buffer.writeBigUInt64LE(BigInt(num), 0);
    }
    return buffer;
}

async function main() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load wallet
    const walletPath = join(process.env.HOME || '', '.config/solana/id.json');
    const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(walletPath, 'utf-8')))
    );
    
    console.log('Wallet address:', walletKeypair.publicKey.toString());
    console.log('Program ID:', PROGRAM_ID.toString());
    console.log('Platform State PDA:', PLATFORM_STATE_PDA.toString());
    console.log('Fee Collector:', FEE_COLLECTOR.toString());
    
    // Test parameters
    const tokenName = "TestToken";
    const tokenSymbol = "TEST";
    const decimals = 6;
    const initialSupply = 1000000;
    
    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    console.log('Mint keypair:', mintKeypair.publicKey.toString());
    
    // No need for separate fee payment account - we'll use the wallet directly
    
    // Get associated token account
    const { getAssociatedTokenAddress } = require('@solana/spl-token');
    const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        walletKeypair.publicKey,
        false
    );
    console.log('Associated token account:', associatedTokenAccount.toString());
    
    // Get token record PDA
    const [tokenRecordPda] = PublicKey.findProgramAddressSync(
        [stringToBuffer("token_record"), mintKeypair.publicKey.toBuffer()],
        PROGRAM_ID
    );
    console.log('Token record PDA:', tokenRecordPda.toString());
    
    // Create instruction data for create_token
    const createTokenDiscriminator = getInstructionDiscriminator('create_token');
    console.log('Create token discriminator:', Array.from(createTokenDiscriminator).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    // Serialize parameters: token_name (String) + token_symbol (String) + decimals (u8) + initial_supply (u64)
    const tokenNameBuffer = stringToBuffer(tokenName);
    const tokenNameLengthBuffer = numberToBuffer(tokenNameBuffer.length, 4);
    
    const tokenSymbolBuffer = stringToBuffer(tokenSymbol);
    const tokenSymbolLengthBuffer = numberToBuffer(tokenSymbolBuffer.length, 4);
    
    const decimalsBuffer = numberToBuffer(decimals, 1);
    const initialSupplyBuffer = numberToBuffer(initialSupply, 8);

    const instructionData = Buffer.concat([
        createTokenDiscriminator,
        tokenNameLengthBuffer,
        tokenNameBuffer,
        tokenSymbolLengthBuffer,
        tokenSymbolBuffer,
        decimalsBuffer,
        initialSupplyBuffer
    ]);

    console.log('Instruction data length:', instructionData.length);
    console.log('Instruction data (hex):', instructionData.toString('hex'));
    
    // Create transaction
    const transaction = new Transaction();

    // Add instruction to transfer fee from user to fee collector
    const transferFeeInstruction = SystemProgram.transfer({
        fromPubkey: walletKeypair.publicKey,
        toPubkey: FEE_COLLECTOR,
        lamports: FEE_AMOUNT,
    });

    transaction.add(transferFeeInstruction);

    // Add create_token instruction
    const createTokenInstruction = {
        keys: [
            { pubkey: PLATFORM_STATE_PDA, isSigner: false, isWritable: true },
            { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
            { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
            { pubkey: tokenRecordPda, isSigner: false, isWritable: true },
            { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: walletKeypair.publicKey, isSigner: false, isWritable: true }, // fee_payment (use user's wallet)
            { pubkey: FEE_COLLECTOR, isSigner: false, isWritable: true },
            { pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
    };

    console.log('\nCreate token instruction accounts:');
    const accountNames = [
        "platform_state", "mint", "token_account", "token_record", 
        "creator", "fee_payment", "fee_collector", "associated_token_program", 
        "token_program", "system_program", "rent"
    ];
    createTokenInstruction.keys.forEach((key, index) => {
        console.log(`${index}: ${accountNames[index]} - ${key.pubkey.toString()} (signer: ${key.isSigner}, writable: ${key.isWritable})`);
    });

    transaction.add(createTokenInstruction);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletKeypair.publicKey;

    // Sign the transaction
    transaction.sign(mintKeypair);
    
    // Simulate transaction
    try {
        console.log('\nSimulating transaction...');
        const simulation = await connection.simulateTransaction(transaction);
        console.log('Simulation result:', simulation);
        
        if (simulation.value.err) {
            console.error('❌ Simulation failed:', simulation.value.err);
            if (simulation.value.logs) {
                console.log('Transaction logs:');
                simulation.value.logs.forEach(log => console.log(log));
            }
        } else {
            console.log('✅ Simulation successful');
        }
    } catch (error) {
        console.error('❌ Simulation error:', error);
    }
}

main().catch(console.error); 