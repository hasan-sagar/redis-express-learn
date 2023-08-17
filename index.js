const express = require('express')
const app = express()
const redis = require('redis')
const axios = require('axios')
const client = redis.createClient(6379)

const bodyParser = require('body-parser')

app.use(bodyParser.json());

function setRes(username, email) {
    return `<h2>${username} has email ${email}</h2>`
}

const getSomething = async (req, res) => {
    try {
        const username = req.params.username
        const getcomments = await axios.get("https://jsonplaceholder.typicode.com/comments")
        const comments = getcomments.data
        // res.json(comments)

        const email = comments[0]['email'];

        //save in redis
        //TASK : 1. First take email from json. 2.Use setEx method from redis to save this data as (key,expiretime,value)
        //start redis server => sudo service redis-server start
        //start port => redis-cli
        //Get redis save key value fromcli => get {username as params} 
        await client.connect();
        client.setEx(username, 3600, email)
        res.send(setRes(username, email))
    } catch (error) {
        console.log(error.toString());
    }
}

app.get('/:username', getSomething)

app.listen(3333, () => {
    console.log("3000 port running");
})