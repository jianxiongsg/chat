// import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
  return (
    <>
      <Home />
      {/* 网站数据分析用 */}
      {/* {serverConfig?.isVercel && <Analytics />} */}
    </>
  );
}
