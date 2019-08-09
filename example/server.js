const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const port = 3000;

app.use("/", express.static("public"));

app.get("*", (req, res) => {
    res.sendFile(path.resolve("public/index.html"));
});

app.listen(port, () => console.log(`listening on port ${port}!`));