import * as anchor from '@project-serum/anchor';
import dotenv from 'dotenv';
dotenv.config();

const vaultKey = process.env.VAULT_KEY;
const governanceKey = process.env.GOVERNANCE_KEY;
const reportingKey = process.env.REPORTING_KEY;

async function vault() {
    // Use Anchor.toml provider config (localnet + id.json)
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const idl = await anchor.Program.fetchIdl(new anchor.web3.PublicKey(vaultKey), provider);
    if (!idl) {
        throw new Error('Vault IDL not found. Did you run `anchor build` first?');
    }

    const program = new anchor.Program(idl, new anchor.web3.PublicKey(vaultKey), provider);

    // Call the initialize instruction (no accounts yet)
    const tx = await program.methods.initialize().rpc();
    console.log('initialize tx signature:', tx);
}

async function governance() {
    // Use Anchor.toml provider config (localnet + id.json)
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const idl = await anchor.Program.fetchIdl(new anchor.web3.PublicKey(governanceKey), provider);
    if (!idl) {
        throw new Error('Vault IDL not found. Did you run `anchor build` first?');
    }

    const program = new anchor.Program(idl, new anchor.web3.PublicKey(governanceKey), provider);

    // Call the initialize instruction (no accounts yet)
    const tx = await program.methods.initialize().rpc();
    console.log('initialize tx signature:', tx);
}

async function reporting() {
    // Use Anchor.toml provider config (localnet + id.json)
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const idl = await anchor.Program.fetchIdl(new anchor.web3.PublicKey(reportingKey), provider);
    if (!idl) {
        throw new Error('Vault IDL not found. Did you run `anchor build` first?');
    }

    const program = new anchor.Program(idl, new anchor.web3.PublicKey(reportingKey), provider);

    // Call the initialize instruction (no accounts yet)
    const tx = await program.methods.initialize().rpc();
    console.log('initialize tx signature:', tx);
}

async function main() {
    vault();
    governance();
    reporting();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
