use anchor_lang::prelude::*;

declare_id!("HKGMwVUhp5Ue2Ldod2dur6TtXsFjc9zUTwVC3m5GNn5z");

#[program]
pub mod reporting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
