import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useEffect, useState } from "react";
import { useSigner } from "wagmi";
import {
  ERC20,
  ERC20__factory,
  OptimismMintableERC20Factory__factory,
  OptimismMintableERC20Factory,
} from "../../types/ethers-contracts";

const OPTIMISM_MINATABLE_ERC_20_FACTORY =
  "0x4200000000000000000000000000000000000012";

export default function Erc20TokenBridge() {
  const { data: signer } = useSigner();

  const [isTxPending, setIsTxPending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");

  const [factoryAddress, setFactoryAddress] = useState(
    OPTIMISM_MINATABLE_ERC_20_FACTORY
  );
  const [l1TokenAddress, setL1TokenAddress] = useState("");
  const [l2TokenAddress, setL2TokenAddress] = useState("");

  const [factoryContract, setFactoryContract] = useState<
    OptimismMintableERC20Factory | undefined
  >(undefined);
  const [l1TokenContract, setL1TokenContract] = useState<ERC20 | undefined>(
    undefined
  );

  useEffect(() => {
    if (!signer) return;
    const contract = OptimismMintableERC20Factory__factory.connect(
      factoryAddress,
      signer
    );
    setFactoryContract(contract);
  }, [signer, factoryAddress]);

  useEffect(() => {
    if (!signer) return;
    const l1TokenContract = ERC20__factory.connect(l1TokenAddress, signer);
    setL1TokenContract(l1TokenContract);
  }, [signer, l1TokenAddress]);

  const handleFactoryAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFactoryAddress(event.target.value);
  };

  const handleL1TokenAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setL1TokenAddress(event.target.value);
  };

  const handleTransferClick = async () => {
    if (!signer) return;
    if (!factoryContract) return;
    if (!l1TokenContract) return;

    try {
      setIsTxPending(true);

      const tx = await factoryContract.createOptimismMintableERC20(
        l1TokenContract.address,
        l1TokenContract.name(),
        l1TokenContract.symbol()
      );

      setTxHash(tx.hash);

      const receipt = await tx.wait();

      const l2TokenAddress: string | undefined = receipt.events?.find(
        (event) => event.event == "OptimismMintableERC20Created"
      )?.args?.localToken;

      setL2TokenAddress(l2TokenAddress || "");
      setTxError("");
    } catch (error: any) {
      setTxError(error.message);
      setTxHash("");
    } finally {
      setIsTxPending(false);
    }
  };

  return (
    <div>
      <h1>Create OptimismMintableERC20 for specific L1 token</h1>
      <ConnectButton />
      <label>
        Optimism Mintable ERC 20 Factory Address:{" "}
        <input
          type="text"
          value={factoryAddress}
          onChange={handleFactoryAddressChange}
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
      <button onClick={handleTransferClick} disabled={isTxPending}>
        {isTxPending ? "Creating..." : "Create"}
      </button>
      <br />
      {l2TokenAddress && <p>Created L2 Token Address: {l2TokenAddress}</p>}
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
