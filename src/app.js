const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
//ABYME necessary to use .env variables
require('dotenv').config()
const { handleError } = require('./helpers/error')

const app = express()

app.use(morgan('combined'))

//ATTENTION only a single valid option
// var corsOptions = {
//   origin: "http://localhost:8080",
//   origin: "http://192.168.178.27:8080/",
//   origin: "http://192.168.1.109:8080/",
//   origin: 'https://client-oshwapp.herokuapp.com'
// };

// add URLs according to your needs
let whitelist = null
if (process.env.NODE_ENV === 'production') {
  whitelist = ['https://client-oshwapp.herokuapp.com', 'https://client-oshwapp.herokuapp.com:80']
} else {
  // client url for local development
  whitelist = [
    'http://localhost:8080',
    'http://192.168.178.21:8080',
     'http://192.168.1.109:8080',
     'http://192.168.1.110:8080'
  ]
}
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions))

// parse requests of content-type - application/json
app.use(bodyParser.json())
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//ABYME for images
app.use(express.static(__dirname + '/public'));

// old routes file
// require('./routes')(app)

require('./routes/AuthenticationRoutes')(app);
require('./routes/AdminRoutes')(app);
require('./routes/UserRoutes')(app);
require('./routes/AtomRoutes')(app);
//require('./routes/CompoundRoutes')(app);
require('./routes/AssemblyRoutes')(app);
require('./routes/ProductRoutes')(app);
require('./routes/ProjectRoutes')(app);
require('./routes/UploadRoutes')(app);
require('./routes/GuineaPigRoutes')(app);
require('./routes/TodoRoutes')(app);
require('./routes/TestRoutes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}.`);
});
//app.listen(process.env.PORT || 8081)
// console.log('process.env.PORT: '+ process.env.PORT)

//ABYME
// function to manage errors go to the end otherwise doesn't work!!!
app.use(function (err, req, res, next) {
  if (err.code === "LIMIT_BOM_FILE_TYPE") {
    res.status(422).json({ error: "Only csv files allowed" })
    return
  }
  if (err.code === "LIMIT_IMAGE_FILE_TYPE") {
    res.status(422).json({ error: "image file type not allowed" })
    return
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    console.log('File size not allowed')
    res.status(422).json({ error: "File size not allowed" })
    return
  }
  handleError(err, res);
})