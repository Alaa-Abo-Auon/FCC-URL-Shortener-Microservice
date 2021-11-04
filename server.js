require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns')
const urlparser = require('url')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect('mongodb+srv://test:test@cluster0.feeli.mongodb.net/cluster0?retryWrites=true&w=majority',{
  useNewUrlParser: true,
  useUnifiedTopology: true
  })
console.log(mongoose.connection.readyState)

const schema = new mongoose.Schema({ url: {type: String, require: true}});
const Url = mongoose.model('Url', schema)

app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(req.body);
  const bodyurl = req.body.url;

  const something = dns.lookup(urlparser.parse(bodyurl).hostname,(error, address) => {
    if(!address) {
      res.json({error: "Invalid URL"})
    }else{
      const Aurl = new Url({url: bodyurl})
      Aurl.save((err, data) => {
        res.json({
          original_url: data.url,
          short_url: data.id
        })
      }
      )
    }
    console.log("dns", error);
    console.log("address", address);
  });
  console.log("something", something);
});


app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id
  Url.findById(id, (err, data) => {
    if(!data) {
      res.json({error:"Invalid URL"})
    }else{
      res.redirect(data.url)
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
