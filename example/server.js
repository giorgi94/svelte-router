const path = require("path");
const express = require("express");
const AppRender = require("./public/server/App");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public"));

app.use("/dist", express.static("public/dist"));
app.use("/lib", express.static("public/lib"));
app.use("/img", express.static("public/img"));


app.get("*", (req, res) => {

    const rendered = AppRender.render({
        name: "World",
        url: req.url
    });

    res.render("index", {
        rendered
    });
});

app.listen(port, () => console.log(`listening on port ${port}!`));
