import { ChatOptions } from "./api";

export async function onSubmit(chatPayload: any, options: any) {
  try {
    let responseText = "";
    // let talk = options.messages[options.messages.length - 1].content;
    // console.log(talk, options);
    // fetch('http://127.0.0.1:7001/chat/?talk=' + talk)
    fetch("http://127.0.0.1:7001/chat/", {
      // fetch('https://chat-gpt-web-weld-eight.vercel.app/api/openai/v1/chat/completions', {
      ...chatPayload,
    })
      .then((response: any) => {
        if (!response) {
          console.log("没有数据", response);
          return;
        }
        const reader = response.body.getReader();

        return new ReadableStream({
          start(controller) {
            function read() {
              reader.read().then((data: any) => {
                const { done, value } = data;
                if (done) {
                  controller.close();
                  return;
                }
                const decoder = new TextDecoder("utf-8");

                try {
                  const utf8Val = decoder.decode(value, { stream: true });
                  const dataJson = JSON.parse(utf8Val);
                  responseText += dataJson?.choices?.[0].delta?.content;
                  console.log(
                    "........txt",
                    dataJson,
                    Date.now(),
                    responseText,
                  );
                  //@ts-ignore
                  options.onUpdate(
                    responseText,
                    dataJson?.choices?.[0].delta?.content,
                  );
                  console.log(dataJson?.choices?.[0].delta?.content);
                } catch (error) {
                  console.log(error);
                }
                // const dataJson = JSON.parse(utf8Val);
                // const content = dataJson?.choices?.[0].delta?.content;

                // 处理每个数据块
                controller.enqueue(value);
                read();
              });
            }

            read();
          },
        });
      })
      .then((stream) => new Response(stream))
      .then((response) => response.text())
      .then((data) => {
        // 处理完整的响应数据
        console.log("data:", data);
      })
      .catch((error) => {
        // 处理错误
        console.error(error);
      });
  } catch (error) {}
}
