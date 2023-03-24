import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: "1 1 auto" }}>
          <div style={{ padding: "24px 24px 24px 0" }}>
            <h1>L1 Standard Bridge</h1>
            <ConnectButton />
            <br />

            <br />
            <h2>Phaith</h2>
            <Link href="/phaith-native">Native</Link>
            <br />
            <Link href="/phaith-erc20">ERC20</Link>
            <br />

            <br />
            <h2>Bridges</h2>
            <Link href="/bridges/native">Native Token</Link>
            <br />
            <Link href="/bridges/erc20">ERC20 Token</Link>
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
