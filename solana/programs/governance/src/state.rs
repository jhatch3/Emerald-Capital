use anchor_lang::prelude::*;

#[account]
pub struct GovernanceConfig {
    /// Authority that can update config (multi-sig, DAO, or your admin for now)
    pub authority: Pubkey,
    /// The Vault this governance controls
    pub vault: Pubkey,
    /// Minimum total votes (yes + no) as basis points of total supply, e.g. 2000 = 20%
    pub quorum_bps: u16,
    /// Threshold of yes / (yes + no) to pass, e.g. 6000 = 60%
    pub pass_threshold_bps: u16,
    /// Voting period length in slots
    pub voting_period_slots: u64,
    /// Bump for PDA
    pub bump: u8,
    /// Monotonic counter for proposal indices
    pub next_proposal_index: u64,
}

impl GovernanceConfig {
    pub const SEED: &'static [u8] = b"governance_config";
    pub const LEN: usize = 8   // discriminator
        + 32                   // authority
        + 32                   // vault
        + 2                    // quorum_bps
        + 2                    // pass_threshold_bps
        + 8                    // voting_period_slots
        + 1                    // bump
        + 8; // next_proposal_index
}

#[account]
pub struct Proposal {
    pub governance: Pubkey,
    pub index: u64,
    pub creator: Pubkey,

    /// 32-byte hash of the AI proposal / strategy (e.g. keccak256(payload))
    pub strategy_hash: [u8; 32],

    /// e.g. IPFS CID or HTTPS URL, fixed-length encoded as bytes
    /// If shorter than 96 bytes, pad with zeros.
    pub metadata_uri: [u8; 96],

    pub yes_votes: u64,
    pub no_votes: u64,

    pub start_slot: u64,
    pub end_slot: u64,

    pub executed: bool,
    pub approved: bool,

    pub bump: u8,
}

impl Proposal {
    pub const SEED_PREFIX: &'static [u8] = b"proposal";
    pub const LEN: usize = 8   // discriminator
        + 32                   // governance
        + 8                    // index
        + 32                   // creator
        + 32                   // strategy_hash
        + 96                   // metadata_uri
        + 8                    // yes_votes
        + 8                    // no_votes
        + 8                    // start_slot
        + 8                    // end_slot
        + 1                    // executed
        + 1                    // approved
        + 1; // bump
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub support: bool, // true = YES, false = NO
    pub weight: u64,   // number of votes (e.g. LP shares at snapshot)
    pub bump: u8,
}

impl VoteRecord {
    pub const SEED_PREFIX: &'static [u8] = b"vote";
    pub const LEN: usize = 8   // discriminator
        + 32                   // proposal
        + 32                   // voter
        + 1                    // support
        + 8                    // weight
        + 1; // bump
}

/// Ticket that off-chain execution bot listens for.
/// One per approved proposal that is ready to execute.
#[account]
pub struct ExecutionTicket {
    pub proposal: Pubkey,
    pub governance: Pubkey,
    pub vault: Pubkey,
    pub creator: Pubkey,
    /// arbitrary 32-byte opaque value the bot can use (e.g. bridge request id)
    pub execution_hash: [u8; 32],
    pub consumed: bool,
    pub bump: u8,
}

impl ExecutionTicket {
    pub const SEED_PREFIX: &'static [u8] = b"exec_ticket";
    pub const LEN: usize = 8   // discriminator
        + 32                   // proposal
        + 32                   // governance
        + 32                   // vault
        + 32                   // creator
        + 32                   // execution_hash
        + 1                    // consumed
        + 1; // bump
}
