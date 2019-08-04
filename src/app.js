
const axios = require('axios');

import Chart from 'chart.js';

var output = document.getElementById('output');

var ctx = document.getElementById('myChart');


Chart.defaults.global.defaultFontColor = "#aaa";

document.getElementById('upload').onclick = function () {

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    stopButtonHandler(source)
    setButtonStates()
    
    let uploadChart = createChart()

    let data = '0'.repeat(100000000)

    let timeStamp = Date.now();
    let prevProgress = 0;
    output.innerHTML = "Starting upload..."


    var config = {
        cancelToken: source.token,
        onUploadProgress: function (progressEvent) {
            var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

            if (percentCompleted !== prevProgress) {
                var time = Date.now() - timeStamp;
                var percent = (percentCompleted - prevProgress) / 100;
                var chunk = percent * 100000000;
                var speed = ((chunk / 1024 / 1024) / (time / 1000)).toFixed(2);

                timeStamp = Date.now();
                prevProgress = percentCompleted;

                console.info('speed', speed, '  MB/sec');

                console.log('percentCompleted', percentCompleted, ' %')

                output.innerHTML = "Upload speed: " + speed + " MB/sec"

                uploadChart.data.labels.push('');
                uploadChart.data.datasets.forEach((dataset) => {
                    dataset.data.push(speed);
                });
                uploadChart.update();
            }
        }
    };

    axios.post('/speedtest/up', data, config)
        .then(function (res) {
            //output.className = 'container';
            //output.innerHTML = res.data;
            document.getElementById("download").disabled = false;
            document.getElementById("upload").disabled = false;
        })
        .catch(function (thrown) {
            if (axios.isCancel(thrown)) {
                console.log('Request canceled', thrown.message);
            } else {
                output.className = 'text-red-500 mt-10';
                output.innerHTML = thrown.message;
            }
        })

};


document.getElementById('download').onclick = function () {

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    stopButtonHandler(source)
    setButtonStates()
    let downloadChart = createChart()

    output.innerHTML = "Starting download...";


    var startTime, endTime;

    startTime = (new Date()).getTime();

    axios.get('https://speedtest-files.bernis.dev/file/bn-general-storage/speedtest-file', {
        responseType: 'blob',
        cancelToken: source.token,
        onDownloadProgress: function (progressEvent) {
            endTime = (new Date()).getTime();

            let downloadSize = progressEvent.loaded

            var duration = (endTime - startTime) / 1000;
            var bitsLoaded = downloadSize * 8;
            var speedBps = (bitsLoaded / duration).toFixed(2);
            var speedKbps = (speedBps / 1024).toFixed(2);
            var speedMbps = (speedKbps / 1024).toFixed(2);
            var speedMBps = (speedKbps / 1024 / 8).toFixed(2);

            console.info('speed', speedMBps, '  MB/sec');

            output.innerHTML = "Download speed: " + speedMBps + " MB/sec"

            downloadChart.data.labels.push('');
            downloadChart.data.datasets.forEach((dataset) => {
                dataset.data.push(speedMBps);
            });
            downloadChart.update();

            console.log('download', progressEvent);
        },
    })

        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'speedtest-file'); //or any other extension
            document.body.appendChild(link);
            //link.click();
        })
        .catch(function (thrown) {
            if (axios.isCancel(thrown)) {
                console.log('Request canceled', thrown.message);
            } else {
                output.className = 'text-red-500 mt-10';
                output.innerHTML = thrown.message;
            }
        })
        .then(function (res) {
            //output.className = 'container';
            //output.innerHTML = res.data;

            document.getElementById("upload").disabled = false;
        })

};

function setButtonStates() {
    document.getElementById("stop").style.display = "block";
    document.getElementById("chart").style.visibility = "visible";

    document.getElementById("upload").disabled = false;
    document.getElementById("upload").style.opacity = "1";

    document.getElementById("download").disabled = false;
    document.getElementById("download").style.opacity = "1";
}


function stopButtonHandler(source) {
    document.getElementById('stop').onclick = function () {
        source.cancel('Operation canceled by the user.');

        document.getElementById("upload").disabled = false;
        document.getElementById("upload").style.opacity = "1";

        document.getElementById("download").disabled = false;
        document.getElementById("download").style.opacity = "1";
    };
}

function resetChart() {
    myChart.config.data = [];
}

function createChart() {
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'MB/s',
                data: [0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        display: false
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }]
            }
        }
    });

    return myChart
}