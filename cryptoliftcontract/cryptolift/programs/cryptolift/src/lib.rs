use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    associated_token::AssociatedToken,
};

declare_id!("HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT");

#[program]
pub mod cryptolift {
    use super::*;

    /// Initialize the CryptoLift platform with fee settings
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        fee_amount: u64,
        fee_collector: Pubkey,
    ) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.authority = ctx.accounts.authority.key();
        platform_state.fee_amount = fee_amount;
        platform_state.fee_collector = fee_collector;
        platform_state.total_tokens_created = 0;
        platform_state.total_fees_collected = 0;
        
        msg!("CryptoLift platform initialized with fee: {} lamports", fee_amount);
        Ok(())
    }

    /// Create a new token with fee payment
    pub fn create_token(
        ctx: Context<CreateToken>,
        token_name: String,
        token_symbol: String,
        decimals: u8,
        initial_supply: u64,
    ) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        
        // Verify fee payment
        require!(
            ctx.accounts.fee_payment.lamports() >= platform_state.fee_amount,
            CryptoLiftError::InsufficientFee
        );

        // Transfer fee to collector using System Program
        let fee_amount = platform_state.fee_amount;
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.fee_payment.key(),
            &ctx.accounts.fee_collector.key(),
            fee_amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.fee_payment.to_account_info(),
                ctx.accounts.fee_collector.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update platform statistics
        platform_state.total_tokens_created += 1;
        platform_state.total_fees_collected += fee_amount;

        // Create token record
        let token_record = &mut ctx.accounts.token_record;
        token_record.creator = ctx.accounts.creator.key();
        token_record.mint = ctx.accounts.mint.key();
        token_record.token_name = token_name;
        token_record.token_symbol = token_symbol;
        token_record.decimals = decimals;
        token_record.initial_supply = initial_supply;
        token_record.created_at = Clock::get()?.unix_timestamp;

        msg!("Token created successfully! Fee collected: {} lamports", fee_amount);
        msg!("Token: {} ({})", token_record.token_name, token_record.token_symbol);
        
        Ok(())
    }

    /// Update platform fee (only authority can call)
    pub fn update_fee(
        ctx: Context<UpdateFee>,
        new_fee_amount: u64,
    ) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        
        require!(
            ctx.accounts.authority.key() == platform_state.authority,
            CryptoLiftError::Unauthorized
        );

        platform_state.fee_amount = new_fee_amount;
        msg!("Platform fee updated to: {} lamports", new_fee_amount);
        
        Ok(())
    }

    /// Update fee collector (only authority can call)
    pub fn update_fee_collector(
        ctx: Context<UpdateFeeCollector>,
        new_fee_collector: Pubkey,
    ) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        
        require!(
            ctx.accounts.authority.key() == platform_state.authority,
            CryptoLiftError::Unauthorized
        );

        platform_state.fee_collector = new_fee_collector;
        msg!("Fee collector updated to: {}", new_fee_collector);
        
        Ok(())
    }

    /// Withdraw collected fees (only authority can call)
    pub fn withdraw_fees(
        ctx: Context<WithdrawFees>,
        amount: u64,
    ) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        
        require!(
            ctx.accounts.authority.key() == platform_state.authority,
            CryptoLiftError::Unauthorized
        );

        require!(
            ctx.accounts.fee_collector.lamports() >= amount,
            CryptoLiftError::InsufficientFunds
        );

        **ctx.accounts.fee_collector.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.try_borrow_mut_lamports()? += amount;

        msg!("Withdrew {} lamports from fee collector", amount);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 32 + 8 + 8,
        seeds = [b"platform_state_v2"],
        bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(decimals: u8)]
pub struct CreateToken<'info> {
    #[account(
        mut,
        seeds = [b"platform_state_v2"],
        bump,
        has_one = fee_collector
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(
        init,
        payer = creator,
        mint::decimals = decimals,
        mint::authority = creator,
        mint::freeze_authority = creator,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = creator,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 32 + 50 + 10 + 1 + 8 + 8,
        seeds = [b"token_record", mint.key().as_ref()],
        bump
    )]
    pub token_record: Account<'info, TokenRecord>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(mut)]
    pub fee_payment: SystemAccount<'info>,
    
    #[account(mut)]
    pub fee_collector: SystemAccount<'info>,
    
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateFee<'info> {
    #[account(
        mut,
        seeds = [b"platform_state_v2"],
        bump,
        has_one = authority
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateFeeCollector<'info> {
    #[account(
        mut,
        seeds = [b"platform_state_v2"],
        bump,
        has_one = authority
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(
        seeds = [b"platform_state_v2"],
        bump,
        has_one = authority
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub fee_collector: SystemAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PlatformState {
    pub authority: Pubkey,
    pub fee_amount: u64,
    pub fee_collector: Pubkey,
    pub total_tokens_created: u64,
    pub total_fees_collected: u64,
}

#[account]
pub struct TokenRecord {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub token_name: String,
    pub token_symbol: String,
    pub decimals: u8,
    pub initial_supply: u64,
    pub created_at: i64,
}

#[error_code]
pub enum CryptoLiftError {
    #[msg("Insufficient fee payment")]
    InsufficientFee,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}
