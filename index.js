const express = require("express");
const connectDB = require("./config/database");
const staticMiddleware = require("./middleware/static");
const errorHandler = require("./middleware/error");
const routes = require("./routes");
const config = require("./config/server");
const logger = require("./utils/logger");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

// Allow requests from localhost:3000
app.use(morgan("combined"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Enable cookies and authentication headers
  })
);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(staticMiddleware);

// Routes
app.use("/api", routes);
app.get("/", (req, res) => {
  return res.send("Hello world, hospital server is running...");
});

// Handle undefined routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Error Handler
app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  logger.info(
    `Server running in ${config.NODE_ENV} mode on http://localhost:${config.PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err);
  process.exit(1);
});
