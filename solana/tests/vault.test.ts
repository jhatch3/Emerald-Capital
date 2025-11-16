import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Vault } from '../target/types/vault';

describe('vault liquidity pool', () => {
    // Anchor provider (uses Anchor.toml provider config)
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Vault as Program<Vault>;

    it('initializes vault, deposits, and withdraws', async function () {
        this.timeout(20_000);
        const connection = provider.connection;
        const wallet = provider.wallet as anchor.Wallet;

        // 1) Create a fake USDC mint (6 decimals) for localnet
        const mintAuthority = wallet.payer; // same key as test wallet
        const decimals = 6;

        const underlyingMint = await createMint(
            connection,
            mintAuthority, // fee payer
            mintAuthority.publicKey, // mint authority
            null, // freeze authority
            decimals
        );

        // 2) Create user USDC ATA and mint some to them
        const userUnderlyingAta = await getOrCreateAssociatedTokenAccount(
            connection,
            mintAuthority,
            underlyingMint,
            wallet.publicKey
        );

        // Mint 1,000 USDC (with 6 decimals => 1_000_000000)
        const depositAmount = 1_000_000000; // 1000 * 10^6
        await mintTo(
            connection,
            mintAuthority,
            underlyingMint,
            userUnderlyingAta.address,
            mintAuthority,
            Number(depositAmount)
        );

        // 3) Derive PDA for VaultConfig: seeds = ["vault_config", underlying_mint]
        const [vaultConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from('vault_config'), underlyingMint.toBuffer()],
            program.programId
        );

        // 4) Generate keypairs for vault_underlying token account & share mint
        const vaultUnderlying = anchor.web3.Keypair.generate();
        const shareMint = anchor.web3.Keypair.generate();

        // 5) Call initialize_vault
        await program.methods
            .initializeVault()
            .accounts({
                vaultConfig: vaultConfigPda,
                authority: wallet.publicKey,
                underlyingMint: underlyingMint,
                vaultUnderlying: vaultUnderlying.publicKey,
                shareMint: shareMint.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            } as any)
            .signers([vaultUnderlying, shareMint])
            .rpc();

        // 6) Compute user's share ATA (for vault share mint)
        const userShareAta = await getAssociatedTokenAddress(shareMint.publicKey, wallet.publicKey);

        // 7) Deposit some USDC into vault
        const depositAmountU64 = 500_000_000; // 500 USDC with 6 decimals

        await program.methods
            .deposit(new anchor.BN(depositAmountU64))
            .accounts({
                vaultConfig: vaultConfigPda,
                vaultUnderlying: vaultUnderlying.publicKey,
                shareMint: shareMint.publicKey,
                user: wallet.publicKey,
                userUnderlyingAta: userUnderlyingAta.address,
                userShareAta: userShareAta,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            } as any)

            .rpc();

        // 8) Fetch balances after deposit
        const vaultUnderlyingAccountAfterDeposit = await connection.getTokenAccountBalance(
            vaultUnderlying.publicKey
        );
        const userUnderlyingAfterDeposit = await connection.getTokenAccountBalance(
            userUnderlyingAta.address
        );
        const userShareAccount = await connection.getTokenAccountBalance(userShareAta);

        console.log(
            'Vault underlying after deposit:',
            vaultUnderlyingAccountAfterDeposit.value.uiAmountString
        );
        console.log(
            'User underlying after deposit:',
            userUnderlyingAfterDeposit.value.uiAmountString
        );
        console.log('User shares after deposit:', userShareAccount.value.uiAmountString);

        // 9) Withdraw some shares (here: all shares)
        const sharesToWithdraw = Number(userShareAccount.value.amount); // u64 as string

        await program.methods
            .withdraw(new anchor.BN(sharesToWithdraw))
            .accounts({
                vaultConfig: vaultConfigPda,
                vaultUnderlying: vaultUnderlying.publicKey,
                shareMint: shareMint.publicKey,
                user: wallet.publicKey,
                userUnderlyingAta: userUnderlyingAta.address,
                userShareAta: userShareAta,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            } as any)

            .rpc();

        // 10) Balances after withdraw
        const vaultUnderlyingAfterWithdraw = await connection.getTokenAccountBalance(
            vaultUnderlying.publicKey
        );
        const userUnderlyingAfterWithdraw = await connection.getTokenAccountBalance(
            userUnderlyingAta.address
        );
        const userSharesAfterWithdraw = await connection.getTokenAccountBalance(userShareAta);

        console.log(
            'Vault underlying after withdraw:',
            vaultUnderlyingAfterWithdraw.value.uiAmountString
        );
        console.log(
            'User underlying after withdraw:',
            userUnderlyingAfterWithdraw.value.uiAmountString
        );
        console.log('User shares after withdraw:', userSharesAfterWithdraw.value.uiAmountString);

        // Basic sanity checks
        console.log(Number(userSharesAfterWithdraw.value.amount), '\n Expect: 0');
        console.log(Number(vaultUnderlyingAfterWithdraw.value.amount)), '\n Expect <= 1'; // dust
    });
});
