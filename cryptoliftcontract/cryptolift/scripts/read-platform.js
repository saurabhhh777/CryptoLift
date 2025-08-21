const { Connection, PublicKey } = require('@solana/web3.js');

const PROGRAM_ID = new PublicKey('HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT');

async function main() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // The existing platform state PDA
    const platformStatePda = new PublicKey("2SA1br9zQYN6JC3fZVDgDHStTC1rtz9G8hSCkh71WqZW");
    
    console.log('Reading platform state account:', platformStatePda.toString());
    
    const accountInfo = await connection.getAccountInfo(platformStatePda);
    if (!accountInfo) {
        console.log('❌ Platform state account does not exist');
        return;
    }
    
    console.log('✅ Platform state account exists');
    console.log('Owner:', accountInfo.owner.toString());
    console.log('Data length:', accountInfo.data.length);
    
    // Try to decode the data as PlatformState
    // PlatformState structure: authority (32) + fee_amount (8) + fee_collector (32) + total_tokens_created (8) + total_fees_collected (8)
    const data = accountInfo.data;
    
    if (data.length >= 88) { // 8 + 32 + 8 + 32 + 8 + 8 = 96 bytes
        const authority = new PublicKey(data.slice(8, 40));
        const feeAmount = data.readBigUInt64LE(40);
        const feeCollector = new PublicKey(data.slice(48, 80));
        const totalTokensCreated = data.readBigUInt64LE(80);
        const totalFeesCollected = data.readBigUInt64LE(88);
        
        console.log('\nPlatform State Data:');
        console.log('Authority:', authority.toString());
        console.log('Fee Amount:', Number(feeAmount), 'lamports');
        console.log('Fee Amount (SOL):', Number(feeAmount) / 1e9, 'SOL');
        console.log('Fee Collector:', feeCollector.toString());
        console.log('Total Tokens Created:', Number(totalTokensCreated));
        console.log('Total Fees Collected:', Number(totalFeesCollected), 'lamports');
        console.log('Total Fees Collected (SOL):', Number(totalFeesCollected) / 1e9, 'SOL');
    } else {
        console.log('❌ Invalid data length for PlatformState');
        console.log('Raw data (hex):', data.toString('hex'));
    }
}

main().catch(console.error); 