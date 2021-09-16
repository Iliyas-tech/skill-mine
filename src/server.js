const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');
const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//Database
const {db} = require('./models')

// db.sequelize.sync().then(()=>{
//     console.log("db connected");
// }).catch((err) =>{console.log(err);})

//Route
require('./routes')(app);
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.send('Hello World..');
})

app.use(haltOnTimedout);
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}


// mode can be access anywhre in the project
console.log(process.env.NODE_ENV);
mode = process.env.NODE_ENV;
const port = config.get(`${mode}.port`);
const host = config.get(`${mode}.host`);
app.listen(port, host, function() {
  console.log(`app is running ${host} at ${port}`);
});