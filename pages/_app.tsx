import {
  connectorsForWallets,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { argentWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import type { AppProps } from "next/app";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { Chain, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import "../styles/global.css";
import "./global.css";

export const dexillaSepolia: Chain = {
  id: 1_954,
  name: "Dexilla",
  network: "dexilla",
  nativeCurrency: {
    decimals: 18,
    name: "Dexilla",
    symbol: "DXZ",
  },
  rpcUrls: {
    public: { http: ["https://rpc.dexilla.com"] },
    default: { http: ["https://rpc.dexilla.com"] },
  },
  blockExplorers: {
    default: { name: "Dexilla", url: "https://exp.dexilla.com" },
  },
  testnet: true,
};

const { chains, provider, webSocketProvider } = configureChains(
  [sepolia, dexillaSepolia],
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "Dexilla",
  chains,
});

const demoAppInfo = {
  appName: "Dexilla",
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [argentWallet({ chains }), trustWallet({ chains })],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        appInfo={demoAppInfo}
        chains={chains}
        initialChain={sepolia}
      >
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
