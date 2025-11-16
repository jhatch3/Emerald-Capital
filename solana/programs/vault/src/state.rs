use anchor_lang::prelude::*;

/// Config account for a single-asset vault (USDC → Vault Shares)
#[account]
pub struct VaultConfig {
    /// PDA bump
    pub bump: u8,

    /// Authority that can tweak params, pause, etc.
    pub authority: Pubkey,

    /// The underlying asset mint (e.g., USDC)
    pub underlying_mint: Pubkey,

    /// The LP / share mint issued to depositors
    pub share_mint: Pubkey,

    /// The vault's token account that holds underlying assets
    pub vault_underlying: Pubkey,

    /// Total shares outstanding (for price per share calc)
    pub total_shares: u64,
}

impl VaultConfig {
    pub const SEED_PREFIX: &'static [u8] = b"vault_config";

    pub const LEN: usize = 8 + // discriminator
        1 + // bump
        32 + // authority
        32 + // underlying_mint
        32 + // share_mint
        32 + // vault_underlying
        8; // total_shares
}
