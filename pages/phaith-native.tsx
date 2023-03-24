import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useSigner } from "wagmi";
import {
  L1StandardBridge__factory,
  L1StandardBridge,
} from "../types/ethers-contracts";

const Home: NextPage = () => {
  const { data: signer, isError, isLoading } = useSigner();

  useEffect(() => {
    if (signer) {
      setContract(
        L1StandardBridge__factory.connect(
          // "0xBB25cab018E6c5edD3b11c723159E4D38db7D01c",
          // "0xAF142E6568B047AE210aF78C5e7771bE731c8B69",
          "0x08a5A1BfE0814D74cf14a68A5ecec05eEeB655e8",
          signer
        )
      );
    }
  }, [signer]);
  const [amount, setAmount] = useState("");
  const [isTxPending, setIsTxPending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");
  const [contract, setContract] = useState<L1StandardBridge | undefined>(
    undefined
  );

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleTransferClick = async () => {
    if (contract) {
      try {
        setIsTxPending(true);
        const tx = await contract.depositETH(
          BigNumber.from("200_000".split("_").join("")),
          [],
          { value: ethers.utils.parseEther(amount) }
        );
        // const tx = await wagmi.transfer(recipient, amount)
        setTxHash(tx.hash);
        await tx.wait();
        setIsTxPending(false);
        setTxError("");
        setAmount("");
      } catch (error: any) {
        setIsTxPending(false);
        setTxHash("");
        setTxError(error.message);
      }
      alert(await contract.MESSENGER());
    }
  };

  return (
    <div>
      <h1>Bridge Native</h1>

      <label>
        Amount:
        <input type="text" value={amount} onChange={handleAmountChange} />
      </label>
      <br />
      <button onClick={handleTransferClick} disabled={isTxPending}>
        {isTxPending ? "Transferring..." : "Transfer"}
      </button>
      <br />
      {txHash && (
        <p>
          Transaction Hash:{" "}
          <a
            href={`https://goerli.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHash}
          </a>
        </p>
      )}
      {txError && <p style={{ color: "red" }}>{txError}</p>}
    </div>
  );
};

export default Home;
