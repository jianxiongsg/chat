"use client";

require("../utils/polyfill");

import { useState, useEffect, Fragment } from "react";

import styles from "./index.module.scss";

import { getCSSVar, useMobileScreen } from "../utils/utils";

import dynamic from "next/dynamic";
import { HomePath, Path, SlotID } from "../constant";
import { ErrorBoundary } from "../components/Error/index";

import { getISOLang, getLang } from "../locales";

import {
  HashRouter as Router,
  // BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "../components/SideBar/index";
import { useAppConfig } from "../store/config";
import { api } from "../servers/api";
import { useSwitchTheme } from "../hooks/useSwitchTheme";
import { useLoadData } from "../hooks/useLoadData";
import { useHtmlLang } from "../hooks/useHtmlLang";
import { useHasHydrated } from "../hooks/useHasHydrated";
import { Loading } from "../components/Loading";

const Settings = dynamic(
  async () => (await import("./settings/index")).Settings,
  {
    loading: () => <Loading noLogo />,
  },
);

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});
const User = dynamic(async () => (await import("./user")).User, {
  loading: () => <Loading noLogo />,
});

export function Home() {
  useSwitchTheme();
  useLoadData();
  useHtmlLang();
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isMobileScreen = useMobileScreen();
  const shouldTightBorder = config.tightBorder && !isMobileScreen;

  return (
    <Fragment>
      <div
        id="home"
        className={
          styles.container +
          ` ${
            shouldTightBorder ? styles["tight-container"] : styles.container
          } ${getLang() === "ar" ? styles["rtl-screen"] : ""}`
        }
      >
        <SideBar className={isHome ? styles["sidebar-show"] : ""} />

        <div className={styles["window-content"]} id={SlotID.AppBody}>
          <Routes>
            <Route path={HomePath.Main} element={<Chat />} />
            <Route path={HomePath.Chat} element={<Chat />} />
            <Route path={HomePath.Settings} element={<Settings />} />
            <Route path={HomePath.ChatPage} element={<Chat />} />
          </Routes>
        </div>
      </div>
    </Fragment>
  );
}

export function Main() {
  // 首次进需要loading
  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path={Path.Main} element={<User />} />
          <Route path={Path.User} element={<User />} />
          <Route path={Path.Home} element={<Home />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
