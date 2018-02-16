const Highcharts = require('highcharts/highstock');
const fetch = require('node-fetch');
const numeral = require('numeral');
let tableData = [];
let pageStartRows = [];
let currentTablePage = 0;
let lastTablePage = 0;
const numRows = 5;
let lastCoin = "BTC";
let removeHandleArray = [];
let panelHidden = false;


const createChart = (coin, data) => {
  Highcharts.stockChart('chart-section', {
      title: {
        text: `${coin} Price`
      },

      navigator: {
        enabled: true
      },

      scrollbar: {
        enabled: true
      },

      rangeSelector: {
        buttons: [{
            type: 'hour',
            count: 1,
            text: '1h'
        }, {
            type: 'day',
            count: 1,
            text: '1D'
        }],
        selected: 0,
        inputEnabled: false
      },

      series: [{
        name: `${coin}`,
        data: data,
        gapSize: 5,
        tooltip: {
          valueDecimals: 2
        },
      }]
    });
}

const initializeTable = (data) => {
  tableData = data;
  for ( let i = 0; i < Math.ceil(tableData.length / numRows); i++) {
    pageStartRows.push(i * numRows);
  }
  createTable(numRows);
  updateTable();
}

const handleCoinSelect = (coinSym) => {
  return (e) => {
    if (lastCoin !== coinSym) {
      let lastRow = document.getElementById(lastCoin);
      if (lastRow) {
        lastRow.removeAttribute("class");
      }
      let currentRow = document.getElementById(coinSym);
      currentRow.setAttribute("class", "selected");
      lastCoin = coinSym;
      if (coinSym === "MIOTA") {
        coinSym = "IOT";
      }
      $.ajax({
        method: 'GET',
        url: `/coins/${coinSym}`
      }).then(data => createChart(coinSym, data));
    }
  }
}

const updateTable = () => {
  let allRows = document.getElementsByTagName("tr");

  for (let i = 0; i < 5; i++) {
    let tableIndex = i + pageStartRows[currentTablePage];
    let coin = tableData[tableIndex];
    let values = [coin.name, coin.price_usd, coin.market_cap_usd, coin.percent_change_24h];
    if (removeHandleArray[i]) {
      removeHandleArray[i]();
    }
    let coinSym = coin.symbol;
    let handle = handleCoinSelect(coinSym);
    let currentRow = allRows[i + 1];
    currentRow.setAttribute("id", coinSym)
    currentRow.addEventListener("click", handle);
    currentRow.removeAttribute("class");
    removeHandleArray[i] = () => currentRow.removeEventListener("click", handle);
    let cells = currentRow.children;
    for (let j = 0; j < values.length; j++) {
      let inner = values[j];
      let style = "";
      if (j > 0) {
        inner = format(values[j], j);
      }
      if (j === 3) {
        if (inner[0] === "-") {
          style = "color:red";
        } else {
          inner = `+${inner}`;
          style = "color:green";
        }
      }
      cells[j].setAttribute("style", style);
      cells[j].innerHTML = inner;
    }
  }
  let lastRow = document.getElementById(lastCoin);
  if (lastRow) {
    lastRow.setAttribute("class", "selected");
  }
}

const createTable = (numRows) => {
  let coinTable = document.createElement("table");
  coinTable.setAttribute("id", "coin-table")
  let headers = ["Name", "Price", "Market Cap", "24 Hr Change"];
  let classNames = ["name-th", "price-th", "cap-th", "change-th"];
  let headRow = document.createElement("tr");
  headRow.setAttribute("class", "header-row");
  for (let i = 0; i < headers.length; i++) {
    let header = `<th class=${classNames[i]}>${headers[i]}</th>`;
    headRow.innerHTML += header;
  }
  coinTable.appendChild(headRow);
  for (let i = 0; i < numRows; i++) {
    let row = document.createElement("tr");
    let classNames = ["name-td", "price-td", "cap-td", "change-td"];
    for (let j = 0; j < headers.length; j++) {
      let cell = `<td class=${classNames[j]}></td>`;
      row.innerHTML += cell;
    }
    coinTable.append(row);
  }
  let tableSection = document.getElementById("table-section");
  tableSection.appendChild(coinTable);
  tableSection.appendChild(createPagination());
}

const createPagination = () => {
  let pagination = document.createElement("div");
  pagination.setAttribute("class", "pagination");
  for (let i = 0; i < pageStartRows.length; i++) {
    let pageButton = document.createElement("button");
    pageButton.setAttribute("id", `page${i}`);
    if (i === 0) {
      pageButton.setAttribute("class", "page-button selected");
      pageButton.setAttribute("disabled", "");
    } else {
      pageButton.setAttribute("class", "page-button");
    }
    pageButton.innerHTML = i;
    pageButton.addEventListener("click", () => {
      let lastButton = document.getElementById(`page${lastTablePage}`);
      lastButton.removeAttribute("disabled");
      lastButton.setAttribute("class", "page-button");
      pageButton.setAttribute("disabled", "");
      pageButton.setAttribute("class", "page-button selected");
      currentTablePage = i;
      lastTablePage = i;
      updateTable();
    })
    pagination.appendChild(pageButton);
  }
  return pagination;
}

const format = (num, col) => {
  if (col === 1) {
    if (num >= 10) {
      return numeral(num).format('$0.00');
    }
    return numeral(num).format('$0.00[0000]')
  } else if (col === 2) {
    let string = numeral(num).format('$0.00 a');
    return string.slice(0, string.length - 1).concat(string[string.length - 1].toUpperCase());
  } else {
    return numeral(num).format('0.00') + " %";
  }
}


document.addEventListener('DOMContentLoaded', () => {
  $.ajax({
    method: 'GET',
    url: "/coins/BTC"
  }).then(data => {
    createChart("BTC", data);
  });
  $.ajax({
    method: 'GET',
    url: "/coinlist"
  }).then(d => {
    initializeTable(d);
  });

  let toggleAboutBtn = document.getElementById("toggle-panel-button");
  toggleAboutBtn.addEventListener("click", () => {
    let infoPanel = document.getElementById("about-panel");
    let mainEl = document.getElementsByTagName("main")[0];
    if (panelHidden) {
      infoPanel.removeAttribute("class");
      toggleAboutBtn.removeAttribute("style");
      panelHidden = false;
    } else {
      infoPanel.setAttribute("class", "hidden");
      toggleAboutBtn.setAttribute("style", "transform: rotate(180deg); left: 0px;")
      panelHidden = true;
    }
  });
});
