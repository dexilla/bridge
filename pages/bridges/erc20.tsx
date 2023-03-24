import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber, ethers } from "ethers";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSigner } from "wagmi";
import {
  L1StandardBridge__factory,
  L1StandardBridge,
  ERC20,
  ERC20__factory,
} from "../../types/ethers-contracts";

const L1_STANDARD_BRIDGE_ADDRESS = "0x08a5A1BfE0814D74cf14a68A5ecec05eEeB655e8";

export default function Erc20TokenBridge() {
  const { data: signer } = useSigner();

  const [amount, setAmount] = useState("");
  const [isTxPending, setIsTxPending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");

  const [bridgeAddress, setBridgeAddress] = useState(
    L1_STANDARD_BRIDGE_ADDRESS
  );
  const [l1TokenAddress, setL1TokenAddress] = useState("");
  const [l2TokenAddress, setL2TokenAddress] = useState("");

  const [bridgeContract, setBridgeContract] = useState<
    L1StandardBridge | undefined
  >(undefined);

  const [l1TokenContract, setL1TokenContract] = useState<ERC20 | undefined>(
    undefined
  );

  useEffect(() => {
    if (!signer) return;
    const contract = L1StandardBridge__factory.connect(bridgeAddress, signer);
    setBridgeContract(contract);
  }, [signer, bridgeAddress]);

  useEffect(() => {
    if (!signer) return;
    const l1TokenContract = ERC20__factory.connect(l1TokenAddress, signer);
    setL1TokenContract(l1TokenContract);
  }, [signer, l1TokenAddress]);

  const handleBridgeAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBridgeAddress(event.target.value);
  };

  const handleL1TokenAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setL1TokenAddress(event.target.value);
  };

  const handleL2TokenAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setL2TokenAddress(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleTransferClick = async () => {
    if (!signer) return;
    if (!bridgeContract) return;
    if (!l1TokenContract) return;

    try {
      setIsTxPending(true);

      const toSend = ethers.utils.parseEther(amount);
      const allowance = await l1TokenContract.allowance(
        signer.getAddress(),
        bridgeContract.address
      );
      if (allowance < toSend) {
        const tx = await l1TokenContract.approve(
          bridgeContract.address,
          toSend
        );

        setTxHash;
        await tx.wait();
      }

      const tx = await bridgeContract.depositERC20(
        l1TokenContract.address,
        l2TokenAddress,
        toSend,
        BigNumber.from("200_000".split("_").join("")),
        []
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
      <h1>Bridge ERC20 Token</h1>
      <ConnectButton />
      <label>
        L1 Standard Bridge Address:{" "}
        <input
          type="text"
          value={bridgeAddress}
          onChange={handleBridgeAddressChange}
        />
      </label>
      <hr />
      <label>
        L1 Token Address:{" "}
        <input
          type="text"
          value={l1TokenAddress}
          onChange={handleL1TokenAddressChange}
        />
      </label>
      <br />
      <label>
        L2 Token Address:{" "}
        <input
          type="text"
          value={l2TokenAddress}
          onChange={handleL2TokenAddressChange}
        />
      </label>{" "}
      <Link href="/bridges/create-optimism-mintable-erc-20">
        <button>Create OptimismMintableERC20 on L2</button>
      </Link>
      <br />
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
