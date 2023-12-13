import { Main } from "./page/index";

export default async function App() {
  return (
    <>
      <Main />
      {/* 网站数据分析用 */}
      {/* {serverConfig?.isVercel && <Analytics />} */}
    </>
  );
}
