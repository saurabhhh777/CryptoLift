const { Connection, PublicKey } = require('@solana/web3.js');

const PROGRAM_ID = new PublicKey('HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT');

async function main() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Check the PDA that the frontend is using
    const frontendPda = new PublicKey("2SA1br9zQYN6JC3fZVDgDHStTC1rtz9G8hSCkh71WqZW");
    console.log('Frontend PDA:', frontendPda.toString());
    
    // Check if this account exists
    const accountInfo = await connection.getAccountInfo(frontendPda);
    if (accountInfo) {
        console.log('✅ Frontend PDA account exists');
        console.log('Owner:', accountInfo.owner.toString());
        console.log('Data length:', accountInfo.data.length);
    } else {
        console.log('❌ Frontend PDA account does not exist');
    }
    
    // Calculate PDAs with different seeds
    const [pdaV1] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform_state')],
        PROGRAM_ID
    );
    
    const [pdaV2] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform_state_v2')],
        PROGRAM_ID
    );
    
    console.log('\nCalculated PDAs:');
    console.log('platform_state seed:', pdaV1.toString());
    console.log('platform_state_v2 seed:', pdaV2.toString());
    
    // Check if either PDA exists
    const accountInfoV1 = await connection.getAccountInfo(pdaV1);
    const accountInfoV2 = await connection.getAccountInfo(pdaV2);
    
    console.log('\nAccount existence:');
    console.log('platform_state PDA exists:', !!accountInfoV1);
    console.log('platform_state_v2 PDA exists:', !!accountInfoV2);
}

main().catch(console.error); 