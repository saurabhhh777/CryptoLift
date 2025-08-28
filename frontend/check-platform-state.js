import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT');

async function checkPlatformState() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    try {
        console.log('Checking platform state...');
        
        // Check with different seeds
        const seeds1 = [Buffer.from('platform_state')];
        const seeds2 = [Buffer.from('platform_state_v2')];
        
        const [platformStatePda1] = PublicKey.findProgramAddressSync(seeds1, PROGRAM_ID);
        const [platformStatePda2] = PublicKey.findProgramAddressSync(seeds2, PROGRAM_ID);
        
        console.log('Platform State PDA (platform_state):', platformStatePda1.toString());
        console.log('Platform State PDA (platform_state_v2):', platformStatePda2.toString());
        
        // Check both accounts
        const accountInfo1 = await connection.getAccountInfo(platformStatePda1);
        const accountInfo2 = await connection.getAccountInfo(platformStatePda2);
        
        if (accountInfo1) {
            console.log('\n✅ Platform state account found (platform_state)');
            console.log('Account data length:', accountInfo1.data.length);
            parsePlatformState(accountInfo1.data, 'platform_state');
        } else {
            console.log('\n❌ Platform state account not found (platform_state)');
        }
        
        if (accountInfo2) {
            console.log('\n✅ Platform state account found (platform_state_v2)');
            console.log('Account data length:', accountInfo2.data.length);
            parsePlatformState(accountInfo2.data, 'platform_state_v2');
        } else {
            console.log('\n❌ Platform state account not found (platform_state_v2)');
        }
        
    } catch (error) {
        console.error('❌ Error checking platform state:', error);
    }
}

function parsePlatformState(data, seedType) {
    if (data.length >= 96) { // 8 + 32 + 8 + 32 + 8 + 8 = 96 bytes
        const authority = new PublicKey(data.slice(8, 40));
        const feeAmount = data.readBigUInt64LE(40);
        const feeCollector = new PublicKey(data.slice(48, 80));
        const totalTokensCreated = data.readBigUInt64LE(80);
        const totalFeesCollected = data.readBigUInt64LE(88);
        
        console.log(`\n📊 Platform State Data (${seedType}):`);
        console.log('Authority:', authority.toString());
        console.log('Fee Amount:', Number(feeAmount), 'lamports');
        console.log('Fee Amount (SOL):', Number(feeAmount) / 1e9, 'SOL');
        console.log('Fee Collector:', feeCollector.toString());
        console.log('Total Tokens Created:', Number(totalTokensCreated));
        console.log('Total Fees Collected:', Number(totalFeesCollected), 'lamports');
        console.log('Total Fees Collected (SOL):', Number(totalFeesCollected) / 1e9, 'SOL');
        
    } else {
        console.log(`❌ Invalid data length for PlatformState (${seedType})`);
        console.log('Raw data (hex):', data.toString('hex'));
    }
}

checkPlatformState().catch(console.error); 