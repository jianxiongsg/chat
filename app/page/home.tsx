"use client";

require("../utils/polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "../components/Icons/bot.svg";
import LoadingIcon from "../components/Icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils/utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "../components/Error/index";

import { getISOLang, getLang } from "../locales";

import {
  HashRouter as Router,
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

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(
  async () => (await import("./settings/index")).Settings,
  {
    loading: () => <Loading noLogo />,
  },
);

const Chat = dynamic(async () => (await import("../page/chat")).Chat, {
  loading: () => <Loading noLogo />,
});

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  // const isAuth = location.pathname === Path.Auth;
  const isMobileScreen = useMobileScreen();
  const shouldTightBorder = config.tightBorder && !isMobileScreen;

  return (
    <div
      className={
        styles.container +
        ` ${shouldTightBorder ? styles["tight-container"] : styles.container} ${
          getLang() === "ar" ? styles["rtl-screen"] : ""
        }`
      }
    >
      {/* {isAuth ? (
        <>
          <AuthPage />
        </>
      ) : ( */}
      <>
        <SideBar className={isHome ? styles["sidebar-show"] : ""} />

        <div className={styles["window-content"]} id={SlotID.AppBody}>
          <Routes>
            <Route path={Path.Home} element={<Chat />} />
            <Route path={Path.Chat} element={<Chat />} />
            <Route path={Path.Settings} element={<Settings />} />
            <Route path={Path.ChatPage} element={<Chat />} />
          </Routes>
        </div>
      </>
      {/* )} */}
    </div>
  );
}

export function Home() {
  useSwitchTheme();
  useLoadData();
  useHtmlLang();

  // 首次进需要loading
  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}
