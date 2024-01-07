import React, { useState } from "react";
import { IconButton } from "../BaseButton";
import ResetIcon from "../Icons/reload.svg";
import Locale from "../../locales";
import { showConfirm } from "../UiLib";
import { useNavigate } from "react-router-dom";

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<any, IErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Update state with error details
    console.log("componentDidCatch", error);
    this.setState({ hasError: true, error, info });
  }

  clearAndSaveData() {}

  render() {
    if (this.state.hasError) {
      // Render error message 页面异常
      return (
        <div className="error">
          <h2>Oops, something went wrong!</h2>
          <pre>
            <code>{this.state.error?.toString()}</code>
            <code>{this.state.info?.componentStack}</code>
          </pre>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton
              icon={<ResetIcon />}
              text="Clear All Data"
              onClick={async () => {
                if (await showConfirm(Locale.Settings.Danger.Reset.Confirm)) {
                  this.clearAndSaveData();
                }
              }}
              bordered
            />
          </div>
        </div>
      );
    }
    // if no error occurred, render children
    return this.props.children;
  }
}
