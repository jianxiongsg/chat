import { Home } from "./page/home";

export default async function App() {
  return (
    <>
      <Home />
      {/* 网站数据分析用 */}
      {/* {serverConfig?.isVercel && <Analytics />} */}
    </>
  );
}
