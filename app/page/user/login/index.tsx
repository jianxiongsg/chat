import React from "react";
import { Input, Button, Form } from "antd";
import { Link } from "react-router-dom";
import styles from "../index.module.scss";
import { api } from "@/app/servers/api";

const Login = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    // 验证通过后的处理逻辑，可以将表单数据存储至React Redux和localStorage
    console.log(values);
    // 验证通过后的处理逻辑，可以将表单数据存储至React Redux和localStorage
    try {
      console.log("handleLogin", values);
      const res = await api.login(values);
      const resJson = await res.json();
      console.log(resJson);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles["form_container"]}>
      <Form
        form={form}
        onFinish={handleSubmit}
        className={styles["custom_form"]}
      >
        <h2 className={styles["h2"]}>登录</h2>
        <Form.Item
          name="userName"
          rules={[
            { required: true, message: "请输入用户名" },
            { max: 16, message: "用户名不超过16位" },
            {
              pattern: /^(?:\d+|[a-zA-Z]+|[a-zA-Z\d]+)$/i,
              message: "用户名为纯数字、纯英文字母或数字与英文字母组合",
            },
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码最少6位" },
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles["submitButton"]}
          >
            登录
          </Button>
        </Form.Item>
        <div className={styles["toRouter"]}>
          {/* <Link to="/user/forgetPassword">忘记密码</Link> */}
          <span>
            没有账号?<Link to="/user/register">快速注册</Link>
          </span>
        </div>
      </Form>
    </div>
  );
};

export default Login;
