import Config from "./config/Config.js";
import Server from "./server/Server.js";
import MasterRoutes from "./routes/Master.routes.js";

Config.load();
const { PORT, HOST, USERS_SERVER_URL, ROOMS_SERVER_URL } = process.env;

const masterRoutes = new MasterRoutes(USERS_SERVER_URL, ROOMS_SERVER_URL);

const server = new Server(PORT, HOST, masterRoutes);

server.start();

console.log(process.env);
