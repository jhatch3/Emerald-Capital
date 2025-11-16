use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

pub mod state;
use crate::state::VaultConfig;

declare_id!("FTH14TtpbEBjvxLDqJ5V436hfpJ5aR6btgx89DQ4Yz8m");

#[program]
pub mod vault {
    use super::*;

    /// Initialize a new single-asset vault.
    ///
    /// - Creates a VaultConfig PDA
    /// - Creates a vault token account to hold USDC
    /// - Creates the share mint used as LP tokens
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault_config = &mut ctx.accounts.vault_config;

        vault_config.bump = ctx.bumps.vault_config;
        vault_config.authority = ctx.accounts.authority.key();
        vault_config.underlying_mint = ctx.accounts.underlying_mint.key();
        vault_config.share_mint = ctx.accounts.share_mint.key();
        vault_config.vault_underlying = ctx.accounts.vault_underlying.key();
        vault_config.total_shares = 0;

        Ok(())
    }

    /// Deposit `amount` of underlying (USDC) into the vault.
    /// Mints Vault Shares to user based on pool state.
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let vault_config = &mut ctx.accounts.vault_config;

        // 1) Read pool balance *before* deposit
        let vault_underlying_before = ctx.accounts.vault_underlying.amount;

        // 2) Pull underlying from user into vault
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.user_underlying_ata.to_account_info(),
            to: ctx.accounts.vault_underlying.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let transfer_cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_cpi_accounts,
        );
        token::transfer(transfer_cpi_ctx, amount)?;

        // 3) Compute how many shares to mint
        let shares_to_mint = if vault_config.total_shares == 0 || vault_underlying_before == 0 {
            // First liquidity: 1:1
            amount
        } else {
            // shares = amount * total_shares / pool_balance_before
            let numerator = (amount as u128)
                .checked_mul(vault_config.total_shares as u128)
                .ok_or(ErrorCode::MathOverflow)?;
            let shares = numerator
                .checked_div(vault_underlying_before as u128)
                .ok_or(ErrorCode::MathOverflow)?;
            shares as u64
        };

        // 3) Mint shares to user (vault_config PDA is mint authority)
        let seeds: &[&[u8]] = &[
            VaultConfig::SEED_PREFIX,
            vault_config.underlying_mint.as_ref(),
            &[vault_config.bump],
        ];
        let signer_seeds: &[&[&[u8]]] = &[seeds];

        let mint_cpi_accounts = MintTo {
            mint: ctx.accounts.share_mint.to_account_info(),
            to: ctx.accounts.user_share_ata.to_account_info(),
            authority: vault_config.to_account_info(),
        };
        let mint_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            mint_cpi_accounts,
            signer_seeds,
        );
        token::mint_to(mint_cpi_ctx, shares_to_mint)?;

        vault_config.total_shares = vault_config
            .total_shares
            .checked_add(shares_to_mint)
            .ok_or(ErrorCode::MathOverflow)?;

        Ok(())
    }

    /// Burn `shares` from user and send proportional underlying back.
    pub fn withdraw(ctx: Context<Withdraw>, shares: u64) -> Result<()> {
        let vault_config = &mut ctx.accounts.vault_config;

        require!(shares > 0, ErrorCode::ZeroAmount);
        require!(vault_config.total_shares > 0, ErrorCode::ZeroShares);

        let pool_balance = ctx.accounts.vault_underlying.amount;
        require!(pool_balance > 0, ErrorCode::EmptyPool);

        // amount = shares * pool_balance / total_shares
        let numerator = (shares as u128)
            .checked_mul(pool_balance as u128)
            .ok_or(ErrorCode::MathOverflow)?;
        let amount = numerator
            .checked_div(vault_config.total_shares as u128)
            .ok_or(ErrorCode::MathOverflow)? as u64;

        // 1) Burn user's shares (vault_config PDA is mint authority)
        let seeds: &[&[u8]] = &[
            VaultConfig::SEED_PREFIX,
            vault_config.underlying_mint.as_ref(),
            &[vault_config.bump],
        ];
        let signer_seeds: &[&[&[u8]]] = &[seeds];

        let burn_cpi_accounts = token::Burn {
            mint: ctx.accounts.share_mint.to_account_info(),
            from: ctx.accounts.user_share_ata.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let burn_cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            burn_cpi_accounts,
        );
        token::burn(burn_cpi_ctx, shares)?;

        // 2) Send underlying back to user (vault_config PDA signs)
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.vault_underlying.to_account_info(),
            to: ctx.accounts.user_underlying_ata.to_account_info(),
            authority: vault_config.to_account_info(),
        };
        let transfer_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_cpi_accounts,
            signer_seeds,
        );
        token::transfer(transfer_cpi_ctx, amount)?;

        // 3) Update total_shares
        vault_config.total_shares = vault_config
            .total_shares
            .checked_sub(shares)
            .ok_or(ErrorCode::MathOverflow)?;

        Ok(())
    }
}

// ------------------------------------
// Accounts
// ------------------------------------

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    /// VaultConfig PDA
    #[account(
        init,
        payer = authority,
        seeds = [VaultConfig::SEED_PREFIX, underlying_mint.key().as_ref()],
        bump,
        space = VaultConfig::LEN
    )]
    pub vault_config: Account<'info, VaultConfig>,

    /// Vault authority / admin / initializer
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Existing mint of underlying (e.g. USDC on devnet)
    pub underlying_mint: Account<'info, Mint>,

    /// The vault's token account that actually holds underlying
    #[account(
        init,
        payer = authority,
        token::mint = underlying_mint,
        token::authority = vault_config,
    )]
    pub vault_underlying: Account<'info, TokenAccount>,

    /// Mint for vault shares (LP token). USDC uses 6 decimals → we match that.
    #[account(
        init,
        payer = authority,
        mint::decimals = 6,
        mint::authority = vault_config,
    )]
    pub share_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [VaultConfig::SEED_PREFIX, vault_config.underlying_mint.as_ref()],
        bump = vault_config.bump
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(
        mut,
        constraint = vault_underlying.key() == vault_config.vault_underlying,
        constraint = vault_underlying.mint == vault_config.underlying_mint,
    )]
    pub vault_underlying: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = share_mint.key() == vault_config.share_mint
    )]
    pub share_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_underlying_ata.owner == user.key(),
        constraint = user_underlying_ata.mint == vault_config.underlying_mint,
    )]
    pub user_underlying_ata: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = user,
        associated_token::mint = share_mint,
        associated_token::authority = user
    )]
    pub user_share_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [VaultConfig::SEED_PREFIX, vault_config.underlying_mint.as_ref()],
        bump = vault_config.bump
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(
        mut,
        constraint = vault_underlying.key() == vault_config.vault_underlying,
        constraint = vault_underlying.mint == vault_config.underlying_mint,
    )]
    pub vault_underlying: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = share_mint.key() == vault_config.share_mint
    )]
    pub share_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_underlying_ata.owner == user.key(),
        constraint = user_underlying_ata.mint == vault_config.underlying_mint,
    )]
    pub user_underlying_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_share_ata.owner == user.key(),
        constraint = user_share_ata.mint == vault_config.share_mint,
    )]
    pub user_share_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// ------------------------------------
// Errors
// ------------------------------------

#[error_code]
pub enum ErrorCode {
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Cannot operate on zero amount")]
    ZeroAmount,
    #[msg("No shares in vault")]
    ZeroShares,
    #[msg("Vault is empty")]
    EmptyPool,
}
