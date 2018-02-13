const Highcharts = require('highcharts/highstock');
const fetch = require('node-fetch');

document.addEventListener('DOMContentLoaded', () => {
fetch('https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym=USD&limit=365&aggregate=1&e=CCCAGG')
  .then(function(response) {
      return response.text();
  }).then(function(body) {
    results = JSON.parse(body)
      console.log(typeof body);
      console.log(body.length);
      console.log(JSON.parse(body)[0]);
      let data = results.Data.map(day => {
        let time = day.time*1000;
        let close = day.close;
        let day2 = { time, close };
        return Object.values(day2);
      });
      console.log(data.length);
      Highcharts.stockChart('bitcoin', {
        rangeSelector: {
              selected: 1
          },

          title: {
              text: 'BTC   Price'
          },

          series: [{
              name: 'BTC',
              data: data,
              tooltip: {
                  valueDecimals: 2
              }
          }]
        });
      });
  });
