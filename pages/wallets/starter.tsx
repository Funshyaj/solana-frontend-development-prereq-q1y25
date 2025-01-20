import { useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";
require("@solana/wallet-adapter-react-ui/styles.css");
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Starter = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [balance, setBalance] = useState<number | null>(0);

  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey) {
        // if connection is established and publicKey is available then fetch user info
        const info = await connection.getAccountInfo(publicKey);
        setBalance(info!.lamports / web3.LAMPORTS_PER_SOL);
      }
    };
    getInfo();
  }, [connection, publicKey]);

  return (
    <main className="bg-[#161b19] min-h-[85vh] text-white flex justify-center items-center">
      <div className=" mx-auto md:w-2/4 lg:w-1/3 shadow shadow-white rounded-lg p-3">
        {publicKey ? (
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold">Wallet balance</h2>
            <p className="text-turbine-green text-6xl font-bold">{balance}</p>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold">No Wallet Connected!</h2>
            <WalletMultiButton className="!bg-turbine-green hover:!bg-black transition-all duration-200 !rounded-lg" />
          </div>
        )}
      </div>
    </main>
  );
};

export default Starter;
