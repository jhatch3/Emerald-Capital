use anchor_lang::prelude::*;

#[account]
pub struct ReportingConfig {
    pub authority: Pubkey, // who can post reports (you, or governance PDA)
    pub vault: Pubkey,
    pub bump: u8,
}

impl ReportingConfig {
    pub const SEED: &'static [u8] = b"reporting_config";
    pub const LEN: usize = 8 + 32 + 32 + 1;
}

/// Daily NAV / PnL snapshot for a vault.
#[account]
pub struct NavReport {
    pub vault: Pubkey,
    pub day: i64, // unix day (e.g. floor(timestamp / 86400))
    pub nav: u64, // NAV in underlying units (e.g. USDC 6 decimals)
    pub total_shares: u64,
    pub pnl: i64, // signed PnL in underlying units
    pub bump: u8,
}

impl NavReport {
    pub const SEED_PREFIX: &'static [u8] = b"nav_report";
    pub const LEN: usize = 8  // disc
        + 32                  // vault
        + 8                   // day
        + 8                   // nav
        + 8                   // total_shares
        + 8                   // pnl
        + 1; // bump
}
