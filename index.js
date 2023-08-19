const express = require("express");
const app = express();
var cors = require("cors");
const redis = require("redis");
const axios = require("axios");
const client = redis.createClient({
  url: "redis://red-cjff8ginip6c73c60lc0:6379",
});
client.on("error", (err) => console.log("Redis Client Error", err));

client.connect();

const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

function setRes(username, email) {
  return `<h2>${username} has email ${email}</h2>`;
}

const getSomething = async (req, res) => {
  try {
    const username = req.params.username;
    const getcomments = await axios.get(
      "https://jsonplaceholder.typicode.com/comments"
    );
    const comments = getcomments.data;
    // res.json(comments)

    const email = comments[0]["email"];

    //save in redis
    //TASK : 1. First take email from json. 2.Use setEx method from redis to save this data as (key,expiretime,value)
    //start redis server => sudo service redis-server start
    //start port => redis-cli
    //Get redis save key value fromcli => get {username as params}
    client.setEx(username, 60, email);
    res.send(setRes(username, email));
  } catch (error) {
    console.log(error.toString());
  }
};

const getCacheData = async (req, res) => {
  try {
    const username = req.params.username;
    const data = await client.get(username);
    if (data === null) {
      res.send("null");
    } else {
      res.send(data);
    }
  } catch (error) {
    console.log(error.toString());
  }
};

const getTasks = async (req, res) => {
  try {
    const data = await client.get(req.params.username);
    if (data === null) {
      res.send("null");
    } else {
      res.send(data);
    }
  } catch (error) {
    console.log(error.toString());
  }
};

const saveTasks = async (req, res) => {
  try {
    console.log(req.body);

    await client.set(req.params.username, req.body);
    res.send(true);
  } catch (error) {
    console.log(error.toString());
  }
};

app.get("/:username", getSomething);
app.get("/getsome/:username", getCacheData);
app.get("/tasks/:username", getTasks);
app.post(
  "/tasks/:username",
  bodyParser.text({
    type: ["text"],
  }),
  saveTasks
);

app.listen(3000, "0.0.0.0", () => {
  console.log("3000 port running");
});
