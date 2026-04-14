import { createApp } from "./app.js";
import { runtimeConfig } from "./config/runtime.js";

const app = createApp();

app.listen(runtimeConfig.port, runtimeConfig.host, () => {
  console.log(
    `API listening at http://${runtimeConfig.host}:${runtimeConfig.port}`,
  );
});

