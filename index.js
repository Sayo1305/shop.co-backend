var express = require("express");
var logger = require("morgan");
var cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
var bodyParser = require("body-parser");
const { connectDatabase } = require("./utilities/dbconnect");
var logger = require('morgan');

const app = express();
var corsOptions = {
   origin: [process.env.FRONT_END_URL , "http://localhost:3000/"],
   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
 }

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(logger("dev"));
app.use(cors(corsOptions));

const indexRouter = require('./routes/index');


app.use('/' , indexRouter);

app.get("/", async (req, res) => {
   return res.status(200).json({ ok: true, msg: "Backend working properly"});
});

app.listen(8080, () => {
   console.log(`Example app listening on port ${8080}`);
});
