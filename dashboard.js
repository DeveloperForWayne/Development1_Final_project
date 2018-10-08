const URLSite = "https://api.etherscan.io/api?";
const URLTotalSupply = "module=stats&action=ethsupply";
const URLLastPrice = "module=stats&action=ethprice";
const URLblockNum = "module=proxy&action=eth_blockNumber";
const URLblockinfo = "module=proxy&action=eth_getBlockByNumber&boolean=true";
const URLgasPrice = "module=proxy&action=eth_gasPrice";
const URLbalAdr = "module=account&action=balance&tag=latest";
const URLtxlist = "module=account&action=txlist&startblock=0&endblock=99999999&page=1&offset=10&sort=desc";
const myApiKey = "&apikey=92XWW7PZJVD59QXBRI6S6TUUWM7MG6QP3S";
const myAccntAdr = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const weiToEth = 1000000000000000000;

function getData(url) {
    return fetch(url)
        .then(function (response) {
            return response.json();
        })
        .catch(function (error) {
            console.log("Error:", error);
        });
}

// Number to words from Million, Billion, Trillion
function commarize(inputNum) {
    // Alter numbers larger than 1k
    if (inputNum >= 1e3) {
        var units = ["KILO", "MILLION", "BILLION", "TRILLION"];

        // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
        let unit = Math.floor(((inputNum).toFixed(0).length - 1) / 3) * 3;
        // Calculate the remainder
        var num = (inputNum / ('1e' + unit)).toFixed(3);
        var unitname = units[Math.floor(unit / 3) - 1];

        // output number remainder + unitname
        return num + " " + unitname;
    }

    // return formatted original number
    return inputNum.toLocaleString();
}

// Get and set Total Market Capitalization
function getMarketCapital() {
    // Get Total Supply of Ether
    getData(URLSite + URLTotalSupply + myApiKey)
        .then(function (result) {
            // Result returned in Wei, to get value in Ether divide resultAbove/1000000000000000000
            return result.result / weiToEth;
        }).then(function (result) {
            caculateTotalMktCap(result);
        });
}

// Get ETHER Last Price and caculate Total Market Capitalization
function caculateTotalMktCap(totalSupply) {
    getData(URLSite + URLLastPrice + myApiKey)
        .then(function (result) {
            // Get ETHER Last Price
            let lastPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(result.result.ethusd);
            let ethbtc = result.result.ethbtc;
            document.getElementById("LastPrice").innerHTML = lastPrice + " @ " + ethbtc + " BTC/ETH";
            // Caculate Total Market Capitalization
            let marketCap = commarize(totalSupply * result.result.ethusd);
            document.getElementById("TotalMktCap").innerHTML = "MARKET CAP OF $" + marketCap;
        });
}

// Get and set last block number
function getLastBlock() {
    getData(URLSite + URLblockNum + myApiKey)
        .then(function (result) {
            // Get the number of most recent block
            let lastBlockHex = result.result;
            let lastBlockNo = parseInt(lastBlockHex, 16);
            document.getElementById("LastBlockNo").innerHTML = lastBlockNo;
            return lastBlockHex;
        })
        .then(function (result) {
            getBlockInfo(result);
        });
}

// Get and set Difficulty
function getBlockInfo(lastBlockHex) {
    getData(URLSite + URLblockinfo + "&tag=" + lastBlockHex + myApiKey)
        .then(function (result) {
            // Get the difficulty of most recent block
            let difficulty = parseInt(result.result.difficulty, 16);
            let difficultyTera = difficulty / 1000000000000;
            document.getElementById("Difficulty").innerHTML = difficultyTera.toFixed(2) + " TH";
        });
}

// Get and set the current price per gas in Gwei
function getGasPrice() {
    getData(URLSite + URLgasPrice + myApiKey)
        .then(function (result) {
            // Get the current price per gas in wei
            let gasPrice = parseInt(result.result, 16);
            let gasPriceG = gasPrice / 1000000000;
            document.getElementById("GasPrice").innerHTML = gasPriceG + " Gwei";
        });
}

// Get and set the Account Balance
function getAccountBalance() {
    getData(URLSite + URLbalAdr + "&address=" + myAccntAdr + myApiKey)
        .then(function (result) {
            // Get the account balance
            let accountBalance = result.result / weiToEth;
            let accountBalanceDis = new Intl.NumberFormat("en-US", { maximumFractionDigits: 18 }).format(accountBalance) + " Ether";
            document.getElementById("accountBalance").innerHTML = accountBalanceDis;
            return accountBalance;
        }).then(function (result) {
            caculateEtherValue(result);
        });
}

// Get and set the Ether Value
function caculateEtherValue(balance) {
    getData(URLSite + URLLastPrice + myApiKey)
        .then(function (result) {
            // Caculate Ether Price
            let lastPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(result.result.ethusd);
            let EtherValue = result.result.ethusd * balance;
            let EtherValDis = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(EtherValue);
            document.getElementById("EtherValue").innerHTML = EtherValDis + " (@ " + lastPrice + "/ETH)";
        });
}

// Get and set the Transactions list
function getTXlist() {
    let table = document.getElementById("AccountTX");
    getData(URLSite + URLtxlist + "&address=" + myAccntAdr + myApiKey)
        .then(function (result) {
            for (let i = 0; i < result.result.length; i++) {
                let arr = result.result[i];

                let row = table.insertRow(i + 1);

                let TxHash = row.insertCell(0);
                let Block = row.insertCell(1);
                let From = row.insertCell(2);
                let To = row.insertCell(3);
                let Value = row.insertCell(4);
                let TxFee = row.insertCell(5);

                TxHash.innerHTML = arr.hash.substring(0, 18);
                Block.innerHTML = arr.blockNumber;
                From.innerHTML = arr.from.substring(0, 18);
                To.innerHTML = arr.to.substring(0, 18);
                Value.innerHTML = new Intl.NumberFormat("en-US", { maximumFractionDigits: 10 }).format(arr.value / weiToEth);
                TxFee.innerHTML = arr.gasPrice * arr.gasUsed / weiToEth;

            }
        });
}

// Get Dashboard and Account infotmation
function GetDashboard() {
    getMarketCapital();
    getLastBlock();
    getGasPrice();
    getAccountBalance();
    getTXlist();
}