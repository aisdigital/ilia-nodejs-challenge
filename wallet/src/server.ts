import { app as server } from "./app";
import { connectDB, disconnectDB } from "@database/index";

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  connectDB();
  console.log(`Listening on PORT: http://localhost:${PORT} 🚀.`);
});

process.on("SIGABRT", () => disconnectDB);
process.on("SIGTERM", () => disconnectDB);
process.on("SIGQUIT", () => disconnectDB);
