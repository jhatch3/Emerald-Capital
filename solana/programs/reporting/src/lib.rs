use anchor_lang::prelude::*;

pub mod state;
use crate::state::{NavReport, ReportingConfig};

declare_id!("HKGMwVUhp5Ue2Ldod2dur6TtXsFjc9zUTwVC3m5GNn5z");

#[program]
pub mod reporting {
    use super::*;

    /// Initialize reporting for a given vault.
    pub fn initialize(ctx: Context<Initialize>, _dummy: u8) -> Result<()> {
        let cfg = &mut ctx.accounts.reporting_config;
        cfg.authority = ctx.accounts.authority.key();
        cfg.vault = ctx.accounts.vault.key(); // <-- use .key() now
        cfg.bump = ctx.bumps.reporting_config;
        Ok(())
    }

    /// Post / upsert a daily NAV snapshot.
    pub fn submit_nav_report(
        ctx: Context<SubmitNavReport>,
        day: i64,
        nav: u64,
        total_shares: u64,
        pnl: i64,
    ) -> Result<()> {
        let report = &mut ctx.accounts.nav_report;
        report.vault = ctx.accounts.reporting_config.vault;
        report.day = day;
        report.nav = nav;
        report.total_shares = total_shares;
        report.pnl = pnl;
        report.bump = ctx.bumps.nav_report;
        Ok(())
    }
}

// --------------------------
// Accounts
// --------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        seeds = [ReportingConfig::SEED, vault.key().as_ref()],
        bump,
        space = ReportingConfig::LEN
    )]
    pub reporting_config: Account<'info, ReportingConfig>,

    /// Vault config account (we just care about its pubkey)
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(day: i64)]
pub struct SubmitNavReport<'info> {
    #[account(
        seeds = [ReportingConfig::SEED, reporting_config.vault.as_ref()],
        bump = reporting_config.bump
    )]
    pub reporting_config: Account<'info, ReportingConfig>,

    #[account(
        init,
        payer = authority,
        seeds = [
            NavReport::SEED_PREFIX,
            reporting_config.vault.as_ref(),
            &day.to_le_bytes(),
        ],
        bump,
        space = NavReport::LEN
    )]
    pub nav_report: Account<'info, NavReport>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
