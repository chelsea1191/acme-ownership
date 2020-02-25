const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");
app.use(express.json());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use("/assets", express.static("assets"));
const morgan = require("morgan");

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

////////////////////////////////GET/////////////////////////////
app.get("/api/users", async (req, res, next) => {
  await db
    .readUsers()
    .then(users => res.send(users))
    .catch(next);
});
app.get("/api/things", async (req, res, next) => {
  await db
    .readThings()
    .then(things => res.send(things))
    .catch(next);
});
app.get("/api/user_things", async (req, res, next) => {
  await db
    .readUserThings()
    .then(userThings => res.send(userThings))
    .catch(next);
});

///////////////////////////////POST/////////////////////////////

app.post("/api/users", (req, res, next) => {
  db.createUser(req.body)
    .then(user => res.send(user))
    .catch(next);
});
app.post("/api/things", (req, res, next) => {
  db.createThing(req.body)
    .then(thing => res.send(thing))
    .catch(next);
});
app.post("/api/user_things", (req, res, next) => {
  db.createUserThing(req.body)
    .then(userThing => res.send(userThing))
    .catch(next);
});

///////////////////////////////DELETE///////////////////////////
app.delete("/api/users/:id", (req, res, next) => {
  db.deleteUsers(req.params.id)
    .then(() => res.sendStatus(204)) //since no return
    .catch(next);
});
app.delete("/api/things/:id", (req, res, next) => {
  db.deleteThing(req.params.id)
    .then(() => res.sendStatus(204)) //since no return
    .catch(next);
});
app.delete("/api/user_things/:id", (req, res, next) => {
  db.deleteUserThing(req.params.id)
    .then(() => res.sendStatus(204)) //since no return
    .catch(next);
});

////////////////////////////////USE///////////////////////////////
app.use((req, res, next) => {
  next({
    status: 404,
    message: `Page not found for ${req.method} ${req.url}`
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    message: err.message || JSON.stringify(err)
  });
});

const port = process.env.PORT || 3000;

db.sync().then(() => {
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
});
