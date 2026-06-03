import { createApp } from "./app";
import { validateEnv } from "./config/validateEnv";

const app = createApp();
const port = process.env.PORT ?? 3001;

validateEnv()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });
  })
  .catch((err: Error) => {
    console.error(`Startup failed: ${err.message}`);
    process.exit(1);
  });
