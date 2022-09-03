import { app as server } from "./app";
import { connectDB } from "./database";

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  connectDB();
  console.log(`Listening on PORT: http://localhost:${PORT} 🚀.`);
});
