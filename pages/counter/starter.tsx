import { useState, useEffect } from "react";
import * as web3 from "@solana/web3.js";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import CounterIDL from "../../programs/idls/counter.json";
import { Counter } from "../../programs/types/counter";
import { Keypair, PublicKey } from "@solana/web3.js";

const Starter = () => {
  const [counterKey, setCounterKey] = useState("");
  const [count, setCount] = useState(0);
  const [txSig, setTxSig] = useState("");

  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();

  const provider = new AnchorProvider(
    connection,
    wallet?.adapter as unknown as NodeWallet,
    AnchorProvider.defaultOptions()
  );

  const counterProgram = new Program(
    CounterIDL as unknown as Counter,
    provider
  );

  const getPreparedTransaction = async () => {
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    const txInfo = {
      feePayer: publicKey,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
    };
    const transaction = new web3.Transaction(txInfo);
    return transaction;
  };

  const handleInitializeCounter = async () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }
    const transaction = await getPreparedTransaction();
    const counterKeypair = Keypair.generate();
    const instruction = await counterProgram.methods
      .initialize()
      .accounts({
        payer: publicKey,
        counter: counterKeypair.publicKey,
      })
      .instruction();
    transaction.add(instruction);

    try {
      const signature = await provider.sendAndConfirm(
        transaction,
        [counterKeypair],
        {
          skipPreflight: true,
        }
      );
      setTxSig(signature);
      setCounterKey(counterKeypair.publicKey.toBase58());
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  const handleIncrementCounter = async () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    const transaction = await getPreparedTransaction();
    const instruction = await counterProgram.methods
      .increment()
      .accounts({
        counter: new PublicKey(counterKey),
      })
      .instruction();
    transaction.add(instruction);

    try {
      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });
      setTxSig(signature);
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  const handleDecrementCounter = async () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    const transaction = await getPreparedTransaction();
    const instruction = await counterProgram.methods
      .decrement()
      .accounts({
        counter: new PublicKey(counterKey),
      })
      .instruction();
    transaction.add(instruction);

    try {
      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });
      setTxSig(signature);
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey && counterKey) {
        try {
          const currentCount = await counterProgram.account.counter.fetch(
            new PublicKey(counterKey)
          );
          setCount(currentCount.count);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getInfo();
  }, [connection, publicKey, counterKey, txSig]);

  return (
    <main className="relative bg-[#161b19] min-h-[85vh] text-white flex justify-center items-center">
      <div className="w-full">
        <div className="text-center mx-auto md:w-2/4 lg:w-1/3 shadow shadow-white rounded-lg p-3 space-y-3">
          <div>
            <p className="text-gray-400 text-xl">Count</p>
            <h2 className="text-turbine-green text-9xl font-bold">{count}</h2>
          </div>

          <div>
            {counterKey ? (
              <div className="flex gap-3">
                <button
                  className="btn !text-5xl"
                  type="button"
                  onClick={handleIncrementCounter}
                >
                  +
                </button>
                <button
                  className="btn  !text-5xl"
                  type="button"
                  onClick={handleDecrementCounter}
                >
                  -
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={handleInitializeCounter}
              >
                Initialize
              </button>
            )}
          </div>
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
