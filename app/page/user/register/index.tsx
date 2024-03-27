import React, { useState } from "react";
import { Input, Button, Form } from "antd";
import { Link, useNavigate } from "react-router-dom";
import styles from "../index.module.scss";
import { api } from "@/app/servers/api";
import { routePath } from "@/app/utils/url";
import { UserPath } from "@/app/constant";

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isCodeButtonDisabled, setIsCodeButtonDisabled] = useState(true);

  const handleSubmit = async (values: any) => {
    // 验证通过后的处理逻辑，可以将表单数据存储至React Redux和localStorage
    try {
      console.log("handleSubmit", values);
      const res = await api.register(values);
      navigate(routePath(UserPath.Login));
      console.log("res", res);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePhoneChange = (e) => {
    const phoneNumber = e.target.value;
    setIsCodeButtonDisabled(phoneNumber.length !== 11);
  };

  const handleSendCode = () => {
    // 发送验证码逻辑
    console.log("Sending verification code...");
  };

  return (
    <div className={styles["form_container"]}>
      <Form
        form={form}
        onFinish={handleSubmit}
        className={styles["custom_form"]}
      >
        <h2 className={styles["h2"]}>用户注册</h2>
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
        <Form.Item
          name="inviteCode"
          rules={[{ required: true, message: "请输入邀请码" }]}
        >
          <Input placeholder="请输入邀请码" />
        </Form.Item>
        {/* <Form.Item
          name="phoneNumber"
          rules={[
            { required: true, message: "请输入手机号" },
            {
              pattern: /^1[3-9]\d{9}$/,
              message: "请输入有效的手机号",
            },
          ]}
        >
          <Input placeholder="请输入手机号" onChange={handlePhoneChange} />
        </Form.Item> */}
        {/* <div className={styles["verificationArea"]}>
          <Form.Item
            name="verificationCode"
            className={styles["verificationCode"]}
            rules={[{ required: true, message: "请输入验证码" }]}
          >
            <Input placeholder="请输入验证码" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              className={styles["verificationCode_button"]}
              onClick={handleSendCode}
              disabled={isCodeButtonDisabled}
            >
              发送验证码
            </Button>
          </Form.Item>
        </div> */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles["submitButton"]}
          >
            立即注册
          </Button>
        </Form.Item>
        <div className={styles["toRouter"]}>
          {/* <Link to="/user/forgetPassword">忘记密码</Link> */}
          <span>
            已有账号?<Link to="/user/login">马上登录</Link>
          </span>
        </div>
      </Form>
    </div>
  );
};

export default Register;
