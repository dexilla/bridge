import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useSigner } from "wagmi";
import {
  L1StandardBridge__factory,
  ERC20__factory,
  L1StandardBridge,
  ERC20,
} from "../types/ethers-contracts";

const Home: NextPage = () => {
  // const [mounted, setMounted] = React.useState(false);
  // React.useEffect(() => setMounted(true), []);

  // const [totalMinted, setTotalMinted] = React.useState(0);
  // const { isConnected } = useAccount();

  // const { address } = useAccount()

  const { data: signer, isError, isLoading } = useSigner();
  const l1Token = "0x5869fC5118F88192C21C3F656A37f75E7f056319";
  const l2Token = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2";

  useEffect(() => {
    if (signer) {
      setContract(
        L1StandardBridge__factory.connect(
          // "0xAF142E6568B047AE210aF78C5e7771bE731c8B69",
          "0x08a5A1BfE0814D74cf14a68A5ecec05eEeB655e8",
          signer
        )
      );
      setl1TokenContract(ERC20__factory.connect(l1Token, signer));
    }
  }, [signer]);
  const [amount, setAmount] = useState("");
  const [isTxPending, setIsTxPending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");
  const [contract, setContract] = useState<L1StandardBridge | undefined>(
    undefined
  );
  const [l1TokenContract, setl1TokenContract] = useState<ERC20 | undefined>(
    undefined
  );

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleTransferClick = async () => {
    if (contract && l1TokenContract && signer) {
      try {
        setIsTxPending(true);
        const toSend = ethers.utils.parseEther(amount);
        const allowance = await l1TokenContract.allowance(
          signer.getAddress(),
          contract.address
        );
        if (allowance < toSend) {
          const tx = await l1TokenContract.approve(contract.address, toSend);
          await tx.wait();
        }
        const tx = await contract.depositERC20(
          l1Token,
          l2Token,
          toSend,
          BigNumber.from("200_000".split("_").join("")),
          []
        );
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
    }
  };

  return (
    <div>
      <h1>Dexilla Bridge</h1>

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
