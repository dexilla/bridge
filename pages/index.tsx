import type { NextPage } from "next";
import NativeTokenBridge from "./bridges/native";
const Home: NextPage = () => {
  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: "1 1 auto" }}>
          <NativeTokenBridge />
        </div>
      </div>
    </div>
  );
};

export default Home;
