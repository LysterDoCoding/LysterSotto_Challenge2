// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");


// Making a keypair and getting the private key
//const newPair = Keypair.generate();
//console.log(newPair);

// paste your secret that is logged here
const DEMO_FROM_SECRET_KEY = new Uint8Array(
  // paste your secret key array here
    [
        38, 136, 127, 181, 230, 188,  61, 230, 211, 202, 208,
      250,  52, 195,  35,  89,  18, 144, 144, 238,  86,  48,
      232,  60,  35, 124,  31,  66, 179, 142, 225,  98, 114,
       88,  51, 179, 186, 186, 231,  52, 250, 178, 175, 161,
      106,  99, 252,  60, 234, 128,   2, 136, 113,   8,  14,
      250, 132, 110, 118,  47, 179,  62, 147, 190
      ]            
);

// const newPair = Keypair.generate();
// console.log(newPair);

var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
const to = Keypair.generate();

const sendAirdrop = async () => {
  console.log('Airdopping some SOL tokens to Sender wallet!');
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const fromAirDropSignature = await connection.requestAirdrop(new PublicKey(from.publicKey), 2 * LAMPORTS_PER_SOL);
  // Latest blockhash (unique identifer of the block) of the cluster
  let latestBlockHash = await connection.getLatestBlockhash();
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });
  console.log('Airdrop completed for the Senders account');
};

const transferSol = async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Other things to try:
  // 1) Form array from userSecretKey
  // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
  // 2) Make a new Keypair (starts with 0 SOL)
  // const from = Keypair.generate();

  // Generate another Keypair (account we'll be sending to)
  // const to = Keypair.generate();

  // Send money from "from" wallet and into "to" wallet
  const fromCurrentBalance = await connection.getBalance(new PublicKey(from.publicKey));
  const calculatedLamports = fromCurrentBalance / 2;

  console.log(`Trasnferring  SOL Tokens to "To Wallet"`);
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: parseInt(calculatedLamports), //gumamit tayo division, ngayon me decimal kaya naging float siya, kaya need mo convert to int gamit ang parseInt()
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [from]);
  console.log('Signature is ', signature);
};

const logWalletBalance = async () => {
  try {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const fromWalletBalance = await connection.getBalance(new PublicKey(from.publicKey));
    const toWalletBalance = await connection.getBalance(new PublicKey(to.publicKey));
    console.log(`From Wallet balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`);
    console.log(`To Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.log(err);
  }
};

const mainFunction = async () => {
  await logWalletBalance();
  //await sendAirdrop(); //commented out due to internal error (-32603)
  await logWalletBalance();
  await transferSol();
  await logWalletBalance();
};

mainFunction();

