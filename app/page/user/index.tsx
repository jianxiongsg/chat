import React, { Fragment } from "react";
import { Input, Button, Form } from "antd";
import { Link, Route, Routes } from "react-router-dom";
import dynamic from "next/dynamic";
import { Loading } from "@/app/components/Loading";
import { UserPath } from "@/app/constant";

const Login = dynamic(async () => await import("./login"), {
  loading: () => <Loading noLogo />,
});

const Register = dynamic(async () => await import("./register"), {
  loading: () => <Loading noLogo />,
});

const ForgetPassword = dynamic(async () => await import("./forgetPassword"), {
  loading: () => <Loading noLogo />,
});
export function User() {
  return (
    <Fragment>
      <Routes>
        <Route path={UserPath.User} element={<Login />} />
        <Route path={UserPath.Login} element={<Login />} />
        <Route path={UserPath.Register} element={<Register />} />
        <Route path={UserPath.ForgetPassword} element={<ForgetPassword />} />
      </Routes>
    </Fragment>
  );
}
