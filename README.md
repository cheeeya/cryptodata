## Cryptodata - A visual guide to cryptocurrency

### Background and Overview

Cryptodata is a data visualization project that will introduce users to the world of cryptocurrency with easy to understand charts displaying the latest trends in cryptocurrency.

### Functionality and MVP

In Cryptodata, users will be able to
- [ ] learn the basics of how cryptocurrency works
- [ ] choose cryptocoins to follow
- [ ] see market trends of various cryptocoins
- [ ] toggle between represntation of trends from the past hour, day, week, month, year
- [ ] solve cryptohashes to become a miner!

### Wireframes
This app will use a single screen split up into a sidebar with a brief overview on cryptocurrencies and a main section with several charts showing market trends for the different cryptocoins. Users will be able to toggle the display to show data on different crypto coins, including all the live transactions for that currency.
![wireframe](cryptodata_wireframe.png)


### Architecture and Technologies
This project will be implemented with the following technologies:
- vanilla javascript for overall structure
- `highcharts.js` for live visualization of data
- a node backend for processing API requests
- `cryptocompare API` for market data
- `blockchain.info API` for live transaction data

### Implementation Timeline
#### Over the weekend
- [x] research cryptocurrency
- [x] research javascript libraries for visualizing data
- [x] research crypto api's
#### Day 1
- [ ] setup javascript project
- [ ] learn how connect api data with project
- [ ] write info secton
#### Day 2
- [ ] implement highcharts
- [ ] create basic graphs
#### Day 3
- [ ] render api data through highcharts
#### Day 4
- [ ] final touches to structure and styling
