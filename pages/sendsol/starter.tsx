import { useState, useEffect, FormEvent } from "react";
import * as web3 from "@solana/web3.js";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ExternalLinkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

const Starter = () => {
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [txSig, setTxSig] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleTransaction = async (e: FormEvent) => {
    e.preventDefault();
    if (amount > balance) {
      toast.error("Insufficient balance.");
      return;
    }
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const txInfo = {
      feePayer: publicKey,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
    };

    const instruction = web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      lamports: amount * web3.LAMPORTS_PER_SOL,
      toPubkey: new web3.PublicKey(account),
    });

    // initialising a new transaction with txInfo
    const transaction = new web3.Transaction(txInfo);
    // adding an instruction to the transaction
    transaction.add(instruction);

    try {
      const signature = await sendTransaction(transaction, connection);
      setTxSig(signature);

      const newBalance = balance - amount;
      setBalance(newBalance);
      toast.success("Transaction successful");
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey) {
        const info = await connection.getAccountInfo(publicKey);
        setBalance(info!.lamports / web3.LAMPORTS_PER_SOL);
      }
    };
    getInfo();
  }, [connection, publicKey]);

  return (
    <main className="relative bg-[#161b19] min-h-[85vh] text-white flex justify-center items-center">
      <div className="absolute top-5 left-3 shadow shadow-white rounded-lg p-3 overflow-x-auto">
        <p className="flex items-center gap-1">
          Balance:
          <span className="text-turbine-green text-xl"> {balance}</span>
        </p>
      </div>
      <div className="w-full">
        <div className="mx-auto md:w-2/4 lg:w-1/3 shadow shadow-white rounded-lg p-3 space-y-3">
          <h2 className="font-bold text-center text-3xl">Transfer Sol 💸</h2>

          <form className="space-y-5" onSubmit={handleTransaction}>
            <div className="space-y-1">
              <label htmlFor="wallet_address">Wallet address</label>
              <input
                type="text"
                name="wallet_address"
                id="wallet_address"
                placeholder="Paste reciever wallet address"
                onChange={(e) => setAccount(e.target.value)}
                required
                className="p-2 w-full rounded-md border border-gray-200 bg-transparent outline-none resize-none focus:outline-none "
              />
            </div>

            <div className="space-y-1 pb-10">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                name="amount"
                id="amount"
                min={0}
                autoComplete="false"
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="px-2 py-1 md:text-6xl font-semibold w-full bg-transparent focus:bg-none focus:outline-none border-b focus:border-b-4 border-gray-200 text-turbine-green duration-300 overflow-hidden"
              />
              {/* Shows a verification caution after form is filled */}
              {Boolean(amount && account.trim()) && (
                <div className="flex items-start gap-1">
                  <ExclamationCircleIcon
                    fontSize={10}
                    className="w-8 text-xs"
                  />
                  <span className="text-xs text-gray-100 ">
                    Please confirm the wallet address before transfer, this
                    action cannot be reversed and funds sent to wrong address
                    cannot be recovered.
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={Boolean(!account.trim())}
              className="w-full bg-turbine-green text-black py-2 rounded-md font-semibold text-lg disabled:cursor-not-allowed enabled:cursor-pointer enabled:active:scale-95 enabled:hover:shadow-lg duration-300 disabled:opacity-75"
            >
              Transfer
            </button>
          </form>
        </div>
        {txSig && (
          <div className="flex gap-1 justify-center pt-4 flex text-center">
            <p>Recent Transaction Signature: </p>
            <a
              href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex text-[#80ebff] italic hover:text-white transition-all duration-200`}
            >
              {txSig.toString().slice(0, 25)}
              <ExternalLinkIcon className="w-5 ml-1" />
            </a>
          </div>
        )}
      </div>
    </main>
  );
};

export default Starter;
