/* 描述: 登录模板
 *  作者: Jack Chen
 *  日期: 2020-08-05
 */

import React, { useState, useRef, useEffect, useMemo, Fragment } from "react";
import { Input, Button, Checkbox, message } from "antd";
// import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';
// import { login, register } from '@/store/actions';
// import logo from "@/assets/logo_2.png";
import styles from "./index.module.scss";
// import { validUserName, validPass } from '@/utils/valid';

export function Login() {
  const [typeView, setTypeView] = useState(0);
  return (
    <div className={styles["login-container"]}>
      <div className={styles["pageHeader"]}>
        {/* <img src={logo} alt="logo" /> */}
        <span>后台管理模板</span>
      </div>
      <div className={styles["login-box"]}>
        <div className={styles["login-text"]}>
          <span
            className={styles[typeView === 0 ? "active" : ""]}
            onClick={() => {
              setTypeView(0);
            }}
          >
            登录
          </span>
          <b>·</b>
          <span
            className={styles[typeView === 1 ? "active" : ""]}
            onClick={() => {
              setTypeView(1);
            }}
          >
            注册
          </span>
        </div>

        {typeView === 0 ? (
          <div className={styles["right-content"]}>
            <div className={styles["input-box"]}>
              <Input
                type="text"
                className={styles["input"]}
                value={"formLogin.userName"}
                onChange={(e: any) => {}}
                placeholder="请输入登录邮箱/手机号"
              />
              <Input
                type="password"
                className={styles["input"]}
                maxLength={20}
                value={"formLogin.userPwd"}
                onChange={(e: any) => {}}
                onPressEnter={(e: any) => {}}
                placeholder="请输入登录密码"
              />
            </div>
            <Button className={styles["loginBtn"]} type="primary">
              立即登录
            </Button>
            <div className="option">
              <Checkbox className={styles["remember"]} checked={true}>
                <span className={styles["checked"]}>记住我</span>
              </Checkbox>
              <span className={styles["forget-pwd"]}>忘记密码?</span>
            </div>
          </div>
        ) : (
          <div className={styles["right_content"]}>
            <div className={styles["input-box"]}>
              <Input
                type="text"
                className={styles["input"]}
                value={"formRegister.userName"}
                onChange={(e: any) => {}}
                placeholder="请输入注册邮箱/手机号"
              />
              <Input
                type="password"
                className={styles["input"]}
                maxLength={20}
                value={"formRegister.userPwd"}
                onChange={(e: any) => {}}
                placeholder="请输入密码"
              />
              <Input
                type="password"
                className={styles["input"]}
                maxLength={20}
                value={"formRegister.userPwd2"}
                onChange={(e: any) => {}}
                onPressEnter={(e: any) => {}}
                placeholder="请再次确认密码"
              />
            </div>
            <Button className={styles["loginBtn"]} type="primary">
              立即注册
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
