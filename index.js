const express = require("express");
const app = express();
const notFound = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");
const dataRoutes = require("./api/routes");
const PORT = 8000;

app.use(express.json());

app.use("/data", dataRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`The application is running on ${PORT}`);
});

module.exports = app;
