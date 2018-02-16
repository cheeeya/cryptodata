const express = require('express');
const app = express();
// const http = require('http').Server(app)
const path = require('path');
const fetch = require('node-fetch');
const PORT = process.env.PORT || 8000;
const _ = require('lodash');

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/coins/:coin', (req, res) => {
  let results;
  let coin = req.params.coin;
  fetch(`https://min-api.cryptocompare.com/data/histominute?fsym=${coin}&tsym=USD&limit=2000&aggregate=1&e=CCCAGG`)
    .then(function(response) {
        return response.text();
    }).then(function(body) {
      results = JSON.parse(body);
        let data = results.Data.map(day => {
          let time = (day.time - 28800) * 1000;
          let close = day.close;
          let day2 = { time, close };
          return Object.values(day2);
        });
        res.send(data);
    });

});

app.get('/coinlist', (req, res) => {
  let results;
  fetch('https://api.coinmarketcap.com/v1/ticker/')
    .then(function(response) {
      return response.text();
    }).then(function(body) {
      results = JSON.parse(body);
        res.send(results);
    });
});

app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`listening on ${PORT}`);
});
