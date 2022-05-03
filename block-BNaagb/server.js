let express = require("express");
let redis = require("redis");
let axios = require("axios");

let url = "https://swapi.dev/api/people/";

let app = express();
let client = redis.createClient(6379);

client.on("error", (err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Welcome to Star Wars API");
});

var checkCache = (req, res, next) => {
  let id = req.params.id;
  client.get(id, async (err, data) => {
    if (err) throw err;
    if (!data) return next();
    res.json({ [id]: JSON.parse(data), info: "cache server" });
  });
};

app.get("/people/:id", checkCache, async (req, res, next) => {
  let { id } = req.params;
  let character = await axios.get(url + id);
  client.setex(id, 600, JSON.stringify(character.data));
  res.json({ [id]: character.data, info: "3rd party api" });
});

app.listen(3000, () => {
  console.log("server is connected on port 3k");
});
