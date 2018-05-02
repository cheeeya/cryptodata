const Highcharts = require('highcharts/highstock');
const fetch = require('node-fetch');
const numeral = require('numeral');
let tableData = [], priceData = [], changeData = [], alphabeticalData = [];
let currentTable = tableData;
let pageStartRows = [];
let currentTablePage = 1;
let lastTablePage = 1;
const numRows = 5;
let lastCoin = "BTC";
let removeHandleArray = [];
let removeTabHandleArray = [];
let panelHidden = false;


const createChart = (coin, data, daily) => {
  let rangeSelector = {};
  if (daily) {
    rangeSelector = {
      buttons: [{
          type: 'hour',
          count: 1,
          text: '1h'
      }, {
          type: 'day',
          count: 1,
          text: '1D'
      }],
      selected: 1,
      inputEnabled: false
    }
  } else {
    rangeSelector = {
      selected: 1,
      inputEnabled: false
    }
  }
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

      rangeSelector,

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
  priceData = data.slice(0).sort((a, b) => b.price_usd - a.price_usd);
  changeData = data.slice(0).sort((a,b) => b.percent_change_24h - a.percent_change_24h);
  alphabeticalData = data.slice(0).sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  for ( let i = 0; i < 100 / numRows; i++) {
    pageStartRows.push(i * numRows);
  }
  createTable(numRows);
  updateTable(tableData);
}

const handleCoinSelect = (coinSym) => {
  return (e) => {
    e.preventDefault();
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
      if (removeTabHandleArray) {
        removeTabHandleArray[0]();
        removeTabHandleArray[1]();
      }
      let dTab = document.getElementById("daily-tab");
      let aTab = document.getElementById("all-tab");
      setTabEventListener(coinSym);
      if (dTab.getAttribute("class") === "selected-tab tab-button") {
        return (minuteReq(coinSym));
      } else {
        return (allReq(coinSym));
      }
    }
  }
}

const updateTable = (data) => {
  let allRows = document.getElementsByTagName("tr");

  for (let i = 0; i < numRows; i++) {
    let tableIndex = i + pageStartRows[currentTablePage - 1];
    let coin = data[tableIndex];
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
      let color = "";
      if (j > 0) {
        inner = format(values[j], j);
      }
      if (j === 3) {
        if (inner[0] === "-") {
          color = "red";
        } else {
          inner = `+${inner}`;
          color = "green";
        }
      }
      cells[j].style.color = color;
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
  let classNames = ["name", "price", "cap", "change"];
  let headRow = document.createElement("tr");
  headRow.setAttribute("class", "header-row");
  for (let i = 0; i < headers.length; i++) {
    let header = document.createElement("th");
    header.setAttribute("class", `${classNames[i]}-th`);
    header.textContent = headers[i];
    let sort = document.createElement("div");
    sort.setAttribute("class", `${classNames[i]}-sort th-sort`);
    let sortUp = document.createElement("div");
    sortUp.setAttribute("class", "sort-up");
    sortUp.setAttribute("id", `${classNames[i]}-sort-up`)
    let sortDown = document.createElement("div");
    sortDown.setAttribute("class", "sort-down");
    sortDown.setAttribute("id", `${classNames[i]}-sort-down`)
    sort.appendChild(sortUp);
    sort.appendChild(sortDown);
    header.appendChild(sort);
    headRow.appendChild(header);
    header.addEventListener("click", sortTable(classNames[i]));
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
  for (let i = 0; i < pageStartRows.length + 0; i++) {
    let pageButton = document.createElement("button");
    pageButton.setAttribute("id", `page${i + 1}`);
    if (i === 0) {
      pageButton.setAttribute("class", "page-button selected");
      pageButton.setAttribute("disabled", "");
    } else {
      pageButton.setAttribute("class", "page-button");
    }
    pageButton.innerHTML = i + 1;
    pageButton.addEventListener("click", () => {
      let lastButton = document.getElementById(`page${lastTablePage}`);
      lastButton.removeAttribute("disabled");
      lastButton.setAttribute("class", "page-button");
      pageButton.setAttribute("disabled", "");
      pageButton.setAttribute("class", "page-button selected");
      let page = pageButton.innerHTML;
      currentTablePage = page;
      lastTablePage = page;
      updateTable(currentTable);
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

const minuteReq = (coinSym) => (
  $.ajax({
    method: 'GET',
    url: `/coins/${coinSym}/minute`
  }).then(data => {
    createChart(coinSym, data, true);
  })
);

const allReq = (coinSym) => (
  $.ajax({
    method: 'GET',
    url: `/coins/${coinSym}/day`
  }).then(data => {
    createChart(coinSym, data, false);
  })
);

const sortTable = (attribute) => {

  return (e) => {
    e.preventDefault();
    if (attribute === "price") {
      currentTable = priceData;
    } else if (attribute === "cap") {
      currentTable = tableData;
    } else if (attribute === "change") {
      currentTable = changeData;
    } else if (attribute === "name") {
      currentTable = alphabeticalData;
    }
    updateTable(currentTable);
  }
}

const setTabEventListener = (coinSym) => {
  let dTab = document.getElementById("daily-tab");
  let aTab = document.getElementById("all-tab");
  let handleDaily = (e) => {
    e.preventDefault();
    dTab.setAttribute("class", "selected-tab tab-button");
    dTab.setAttribute("disabled", "");
    aTab.setAttribute("class", "tab-button");
    aTab.removeAttribute("disabled");
    return (minuteReq(coinSym));
  };
  let handleAll = (e) => {
    e.preventDefault();
    aTab.setAttribute("class", "selected-tab tab-button ");
    aTab.setAttribute("disabled", "");
    dTab.setAttribute("class", "tab-button");
    dTab.removeAttribute("disabled");
    return (allReq(coinSym));
  }
  dTab.addEventListener('click', handleDaily);
  removeTabHandleArray[0] = () => dTab.removeEventListener('click', handleDaily);
  aTab.addEventListener('click', handleAll);
  removeTabHandleArray[1] = () => aTab.removeEventListener('click', handleAll);
}


document.addEventListener('DOMContentLoaded', () => {
  minuteReq("BTC");
  setTabEventListener("BTC");
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
      infoPanel.setAttribute("class", "out");
      toggleAboutBtn.removeAttribute("style");
      panelHidden = false;
    } else {
      infoPanel.setAttribute("class", "in");
      toggleAboutBtn.style = "transform: rotate(180deg); left: 0;";
      panelHidden = true;
    }
  });
});
