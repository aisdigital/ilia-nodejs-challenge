import { app as server } from "./app/app";

const serverPort = process.env.SERVER_PORT || 3001;

server.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});
