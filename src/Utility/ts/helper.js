import { BN, Provider, utils } from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import * as spl from "@solana/spl-token";
import { Account } from "@solana/spl-token";

const MUN_CONFIG_SEED = "mun_config";
const MUN_SOL_VAULT_SEED = "mun_sol_vault";
const MUN_TAX_VAULT_SEED = "mun_tax_vault";
const MUN_NFT_VAULT_SEED = "mun_nft_vault";
const MUN_POOL_SEED = "mun_pool";
const MUN_ORDER_SEED = "mun_order";

/* // airdrop SOL
export const airdropSOL = async (
  provider: Provider,
  to: PublicKey,
  solAmount: number
): Promise<void> => {
  const signature = await provider.connection.requestAirdrop(
    to,
    solAmount * LAMPORTS_PER_SOL
  );
  await provider.connection.confirmTransaction(signature);
};

// create Token
export const createTokenMint = async (
  provider: Provider,
  payer: Keypair,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number
): Promise<PublicKey> => {
  return await spl.createMint(
    provider.connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );
};

// mint Token to account
export const mintTokenTo = async (
  provider: Provider,
  payer: Keypair,
  mint: PublicKey,
  to: PublicKey,
  authority: PublicKey,
  amount: number
): Promise<Account> => {
  const tokenAccount = await spl.getOrCreateAssociatedTokenAccount(
    provider.connection,
    payer,
    mint,
    to
  );
  await spl.mintTo(
    provider.connection,
    payer,
    mint,
    tokenAccount.address,
    authority,
    amount
  );
  return tokenAccount;
};
 */
// create NFT to account
/* export const createNFT = async (
  provider: Provider,
  payer: Keypair,
  to: PublicKey
): Promise<[PublicKey, Account]> => {
  // create nft mint
  const nftMint = await spl.createMint(
    provider.connection,
    payer,
    payer.publicKey,
    null,
    0
  );
  // create user`s nft account
  const userNFTAccount = await spl.getOrCreateAssociatedTokenAccount(
    provider.connection,
    payer,
    nftMint,
    to
  );
  // mint nft to user
  await spl.mintTo(
    provider.connection,
    payer,
    nftMint,
    userNFTAccount.address,
    payer.publicKey,
    1
  );

  return [nftMint, userNFTAccount];
};
 */
// stable coin account pda
export const deriveSCAccountPDA = async (
  scMint,
  programId
) => {
  return await PublicKey.findProgramAddress(
    [
      scMint.toBuffer(),
      Buffer.from(
        utils.bytes.utf8.encode(MUN_SOL_VAULT_SEED)
      ),
    ],
    programId
  );
};

export const deriveTaxAccountPDA = async (
  scMint,
  programId
) => {
  return await PublicKey.findProgramAddress(
    [
      scMint.toBuffer(),
      Buffer.from(
        utils.bytes.utf8.encode(MUN_TAX_VAULT_SEED)
      ),
    ],
    programId
  );
};

// configuration account pda
export const deriveConfigurationAccountPDA = async (
  scMint,
  programId
) => {
  return await PublicKey.findProgramAddress(
    [
      scMint.toBuffer(),
      Buffer.from(utils.bytes.utf8.encode(MUN_CONFIG_SEED)),
    ],
    programId
  );
};

// NFT account pda
export const deriveNFTAccountPDA = async (
  nftMint,
  orderId,
  programId
) => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(
        utils.bytes.utf8.encode(MUN_NFT_VAULT_SEED)
      ),
      Buffer.from(utils.bytes.utf8.encode(orderId.toString())),
      nftMint.toBuffer(),
    ],
    programId
  );
};

// pool account pda
export const derivePoolAccountPDA = async (
  configuration,
  poolId,
  programId
) => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(utils.bytes.utf8.encode(poolId.toString())),
      Buffer.from(
        utils.bytes.utf8.encode(MUN_POOL_SEED)
      ),
      configuration.toBuffer(),
    ],
    programId
  );
};

export const deriveOrderAccountPDA = async (
  configuration,
  orderId,
  programId
) => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(utils.bytes.utf8.encode(orderId.toString())),
      configuration.toBuffer(),
    ],
    programId
  );
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
