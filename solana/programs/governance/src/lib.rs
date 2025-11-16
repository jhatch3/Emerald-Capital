use anchor_lang::prelude::*;

pub mod state;
use crate::state::{ExecutionTicket, GovernanceConfig, Proposal, VoteRecord};

declare_id!("5VEwziqdtA8DLkhcfDvS3wSasoGrSy5ScX7bs68RXCXY"); // replace via anchor keys sync

#[program]
pub mod governance {
    use super::*;

    /// Initialize governance for a specific vault.
    pub fn initialize_governance(
        ctx: Context<InitializeGovernance>,
        quorum_bps: u16,
        pass_threshold_bps: u16,
        voting_period_slots: u64,
    ) -> Result<()> {
        require!(quorum_bps <= 10_000, GovernanceError::InvalidBps);
        require!(pass_threshold_bps <= 10_000, GovernanceError::InvalidBps);

        let cfg = &mut ctx.accounts.governance_config;
        cfg.authority = ctx.accounts.authority.key();
        cfg.vault = ctx.accounts.vault.key();
        cfg.quorum_bps = quorum_bps;
        cfg.pass_threshold_bps = pass_threshold_bps;
        cfg.voting_period_slots = voting_period_slots;
        cfg.bump = ctx.bumps.governance_config;
        cfg.next_proposal_index = 0;

        Ok(())
    }

    /// Create a new AI-generated proposal.
    ///
    /// The off-chain AI / Gemini engine should:
    /// - hash the proposal details into `strategy_hash`
    /// - encode metadata URI into `metadata_uri` bytes
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        strategy_hash: [u8; 32],
        metadata_uri: [u8; 96],
    ) -> Result<()> {
        let cfg = &mut ctx.accounts.governance_config;
        let clock = Clock::get()?;

        let index = cfg.next_proposal_index;
        cfg.next_proposal_index = cfg
            .next_proposal_index
            .checked_add(1)
            .ok_or(GovernanceError::MathOverflow)?;

        let proposal = &mut ctx.accounts.proposal;
        proposal.governance = cfg.key();
        proposal.index = index;
        proposal.creator = ctx.accounts.creator.key();
        proposal.strategy_hash = strategy_hash;
        proposal.metadata_uri = metadata_uri;
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.start_slot = clock.slot;
        proposal.end_slot = clock
            .slot
            .checked_add(cfg.voting_period_slots)
            .ok_or(GovernanceError::MathOverflow)?;
        proposal.executed = false;
        proposal.approved = false;
        proposal.bump = ctx.bumps.proposal;

        Ok(())
    }

    /// Cast a vote (YES / NO) on a proposal.
    ///
    /// NOTE: For now we accept `weight` from the client.
    /// In a production system you'd read vault LP balance at snapshot instead.
    pub fn cast_vote(ctx: Context<CastVote>, support_yes: bool, weight: u64) -> Result<()> {
        require!(weight > 0, GovernanceError::ZeroWeight);

        let cfg = &ctx.accounts.governance_config;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        // Check voting period
        require!(
            clock.slot >= proposal.start_slot && clock.slot <= proposal.end_slot,
            GovernanceError::VotingClosed
        );

        // Initialize vote record (PDA ensures one vote per (proposal, voter))
        let vr = &mut ctx.accounts.vote_record;
        vr.proposal = proposal.key();
        vr.voter = ctx.accounts.voter.key();
        vr.support = support_yes;
        vr.weight = weight;
        vr.bump = ctx.bumps.vote_record;

        // Accumulate votes
        if support_yes {
            proposal.yes_votes = proposal
                .yes_votes
                .checked_add(weight)
                .ok_or(GovernanceError::MathOverflow)?;
        } else {
            proposal.no_votes = proposal
                .no_votes
                .checked_add(weight)
                .ok_or(GovernanceError::MathOverflow)?;
        }

        Ok(())
    }

    /// Finalize a proposal: check quorum + threshold and mark approved or rejected.
    ///
    /// `total_voting_power` should be, e.g., vault total_shares at snapshot, supplied by client.
    /// In a production system you’d read this from the vault PDA directly.
    pub fn finalize_proposal(
        ctx: Context<FinalizeProposal>,
        total_voting_power: u64,
    ) -> Result<()> {
        let cfg = &ctx.accounts.governance_config;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        // Must be after end_slot
        require!(
            clock.slot > proposal.end_slot,
            GovernanceError::VotingStillOpen
        );

        let total_votes = proposal
            .yes_votes
            .checked_add(proposal.no_votes)
            .ok_or(GovernanceError::MathOverflow)?;

        // Check quorum
        let quorum_votes = (total_voting_power as u128)
            .checked_mul(cfg.quorum_bps as u128)
            .ok_or(GovernanceError::MathOverflow)?
            / 10_000u128;

        require!(
            (total_votes as u128) >= quorum_votes,
            GovernanceError::NoQuorum
        );

        // Check pass threshold
        let yes_times_10k = (proposal.yes_votes as u128)
            .checked_mul(10_000u128)
            .ok_or(GovernanceError::MathOverflow)?;
        let yes_ratio_bps = yes_times_10k / (total_votes as u128);

        let approved = yes_ratio_bps >= cfg.pass_threshold_bps as u128;
        proposal.approved = approved;

        Ok(())
    }

    /// Emit an ExecutionTicket for an approved proposal that off-chain bot can consume.
    /// This is what your Polymarket bot will watch for.
    pub fn create_execution_ticket(
        ctx: Context<CreateExecutionTicket>,
        execution_hash: [u8; 32],
    ) -> Result<()> {
        let proposal = &ctx.accounts.proposal;
        require!(proposal.approved, GovernanceError::NotApproved);
        require!(!proposal.executed, GovernanceError::AlreadyExecuted);

        let ticket = &mut ctx.accounts.execution_ticket;
        ticket.proposal = proposal.key();
        ticket.governance = ctx.accounts.governance_config.key();
        ticket.vault = ctx.accounts.governance_config.vault;
        ticket.creator = ctx.accounts.creator.key();
        ticket.execution_hash = execution_hash;
        ticket.consumed = false;
        ticket.bump = ctx.bumps.execution_ticket;

        Ok(())
    }

    /// Mark an execution ticket as consumed (called by an authorized executor / bot).
    pub fn consume_execution_ticket(ctx: Context<ConsumeExecutionTicket>) -> Result<()> {
        let ticket = &mut ctx.accounts.execution_ticket;
        let proposal = &mut ctx.accounts.proposal;

        require!(!ticket.consumed, GovernanceError::AlreadyConsumed);
        require!(proposal.approved, GovernanceError::NotApproved);

        ticket.consumed = true;
        proposal.executed = true;

        Ok(())
    }
}

// --------------------------
// Accounts
// --------------------------

#[derive(Accounts)]
pub struct InitializeGovernance<'info> {
    #[account(
        init,
        payer = authority,
        seeds = [GovernanceConfig::SEED, vault.key().as_ref()],
        bump,
        space = GovernanceConfig::LEN
    )]
    pub governance_config: Account<'info, GovernanceConfig>,

    /// CHECK: Vault config PDA – we only care about its pubkey
    #[account()]
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        mut,
        seeds = [GovernanceConfig::SEED, governance_config.vault.as_ref()],
        bump = governance_config.bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        init,
        payer = creator,
        seeds = [
            Proposal::SEED_PREFIX,
            governance_config.key().as_ref(),
            &governance_config.next_proposal_index.to_le_bytes(),
        ],
        bump,
        space = Proposal::LEN
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(
        seeds = [GovernanceConfig::SEED, governance_config.vault.as_ref()],
        bump = governance_config.bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [
            Proposal::SEED_PREFIX,
            governance_config.key().as_ref(),
            &proposal.index.to_le_bytes(),
        ],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = voter,
        seeds = [
            VoteRecord::SEED_PREFIX,
            proposal.key().as_ref(),
            voter.key().as_ref(),
        ],
        bump,
        space = VoteRecord::LEN
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(
        seeds = [GovernanceConfig::SEED, governance_config.vault.as_ref()],
        bump = governance_config.bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [
            Proposal::SEED_PREFIX,
            governance_config.key().as_ref(),
            &proposal.index.to_le_bytes(),
        ],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
}

#[derive(Accounts)]
pub struct CreateExecutionTicket<'info> {
    #[account(
        seeds = [GovernanceConfig::SEED, governance_config.vault.as_ref()],
        bump = governance_config.bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [
            Proposal::SEED_PREFIX,
            governance_config.key().as_ref(),
            &proposal.index.to_le_bytes(),
        ],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = creator,
        seeds = [
            ExecutionTicket::SEED_PREFIX,
            proposal.key().as_ref(),
        ],
        bump,
        space = ExecutionTicket::LEN
    )]
    pub execution_ticket: Account<'info, ExecutionTicket>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConsumeExecutionTicket<'info> {
    #[account(
        seeds = [GovernanceConfig::SEED, governance_config.vault.as_ref()],
        bump = governance_config.bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [
            Proposal::SEED_PREFIX,
            governance_config.key().as_ref(),
            &proposal.index.to_le_bytes(),
        ],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [
            ExecutionTicket::SEED_PREFIX,
            proposal.key().as_ref(),
        ],
        bump = execution_ticket.bump
    )]
    pub execution_ticket: Account<'info, ExecutionTicket>,

    /// Executor / bot signer – can be restricted to a specific authority if you want.
    pub executor: Signer<'info>,
}

// --------------------------
// Errors
// --------------------------

#[error_code]
pub enum GovernanceError {
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Invalid basis points value")]
    InvalidBps,
    #[msg("Voting period is closed")]
    VotingClosed,
    #[msg("Voting period is still open")]
    VotingStillOpen,
    #[msg("Vote weight must be > 0")]
    ZeroWeight,
    #[msg("Quorum not reached")]
    NoQuorum,
    #[msg("Proposal not approved")]
    NotApproved,
    #[msg("Proposal already executed")]
    AlreadyExecuted,
    #[msg("Execution ticket already consumed")]
    AlreadyConsumed,
}
