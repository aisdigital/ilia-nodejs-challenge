import { app as server } from "./app/app";
import { initMongoDBConnection } from "./config/mongo-db-connection.config";

const serverPort = process.env.SERVER_PORT || 3001;

initMongoDBConnection()
  .then(() => {
    console.log(`MongoDB connected`);

    server.listen(serverPort, () => {
      console.log(`Server running on port ${serverPort}`);
    });
  })
  .catch((err) => {
    console.error(`MongoDB not connected - Error: ${err}`);
  });
