use anchor_lang::prelude::*;

declare_id!("5VEwziqdtA8DLkhcfDvS3wSasoGrSy5ScX7bs68RXCXY");

#[program]
pub mod governance {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
