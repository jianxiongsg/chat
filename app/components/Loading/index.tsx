import { useState, useEffect, Fragment } from "react";

import BotIcon from "../Icons/bot.svg";
import LoadingIcon from "../Icons/three-dots.svg";
import styles from "./index.module.scss";
export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}
