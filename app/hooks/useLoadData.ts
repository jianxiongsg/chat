import { useEffect } from "react";
import { api } from "../servers/api";
import { useAppConfig } from "../store";

export function useLoadData() {
  const config = useAppConfig();

  useEffect(() => {
    (async () => {
      // chatGpt模板
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
