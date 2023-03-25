import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useSigner } from "wagmi";
import {
  L1StandardBridge,
  L1StandardBridge__factory,
} from "../../types/ethers-contracts";

const L1_STANDARD_BRIDGE_ADDRESS = "0x08a5A1BfE0814D74cf14a68A5ecec05eEeB655e8";

export default function NativeTokenBridge() {
  const { data: signer } = useSigner();

  const [bridgeAddress, setBridgeAddress] = useState(
    L1_STANDARD_BRIDGE_ADDRESS
  );

  const [amount, setAmount] = useState("");
  const [isTxPending, setIsTxPending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");
  const [contract, setContract] = useState<L1StandardBridge | undefined>(
    undefined
  );

  useEffect(() => {
    if (!signer) return;
    const contract = L1StandardBridge__factory.connect(bridgeAddress, signer);
    setContract(contract);
  }, [signer, bridgeAddress]);

  const handleBridgeAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBridgeAddress(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleTransferClick = async () => {
    if (!contract) return;
    try {
      setIsTxPending(true);

      const tx = await contract.depositETH(
        BigNumber.from("200_000".split("_").join("")),
        [],
        { value: ethers.utils.parseEther(amount) }
      );

      setTxHash(tx.hash);

      await tx.wait();

      setTxError("");
      setAmount("");
    } catch (error: any) {
      setTxError(error.message);
      setTxHash("");
    } finally {
      setIsTxPending(false);
    }
  };

  return (
    <div>
      <h1>Bridge Native Token</h1>

      <div className="relative mt-2 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <ConnectButton />
        </div>
      </div>

      <label>
        L1 Standard Bridge Address{" "}
        <input
          hidden
          type="text"
          value={bridgeAddress}
          onChange={handleBridgeAddressChange}
        />
      </label>
      <div>{bridgeAddress}</div>
      <br></br>

      <label>
        Amount:{" "}
        <input type="text" value={amount} onChange={handleAmountChange} />
      </label>

      <br />

      <button onClick={handleTransferClick} disabled={isTxPending}>
        {isTxPending ? "Bridging..." : "Bridge"}
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
}
