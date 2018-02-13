const express = require('express');
const app = express();
// const http = require('http').Server(app)
const path = require('path');
const fetch = require('node-fetch');
const PORT = 8000;

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/bitcoin', (req, res) => {
  let results;
  fetch('https://min-api.cryptocompare.com/data/histohour?fsym=BTC&tsym=USD&limit=60&aggregate=24&e=CCCAGG')
    .then(function(response) {
        return response.text();
    }).then(function(body) {
      results = JSON.parse(body)
        console.log(typeof body);
        console.log(body.length);
        console.log(JSON.parse(body)[0]);
        let data = results.Data.map(day => {
          let time = day.time;
          let close = day.close;
          let day2 = { time, close };
          return Object.values(day2);

          //other implementation;
          // let dayArr = [];
          // dayArr.push(day.time);
          // dayArr.push(day.close);
          // return dayArr;
        });
        res.send(data);
    });

});

app.get('/coinlist', (req, res) => {
  let results
  fetch('https://min-api.cryptocompare.com/data/all/coinlist')
    .then(function(response) {
      return response.text();
    }).then(function(body) {
      results = JSON.parse(body);
        console.log(typeof body);
        console.log(body.length);
        console.log(JSON.parse(body)[0]);
        res.send(results);
    });
});

app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`listening on ${PORT}`);
});
