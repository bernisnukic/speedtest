
const axios = require('axios');

var output = document.getElementById('output');

document.getElementById('upload').onclick = function () {

    let data = '0'.repeat(100000000)

    let timeStamp = Date.now();
    let prevProgress = 0;
    output.innerHTML = "Starting upload..."

    var config = {
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
            }
        }
    };

    axios.post('/speedtest/up', data, config)
        .then(function (res) {
            //output.className = 'container';
            //output.innerHTML = res.data;
        })
        .catch(function (err) {
            output.className = 'text-2xl text-red-500 mt-10';
            output.innerHTML = err.message;
        });

};


document.getElementById('download').onclick = function () {

    output.innerHTML = "Starting download..."

    var startTime, endTime;

    startTime = (new Date()).getTime();
    //var downloadSize = 100000000;

    axios.get('https://speedtest.bernis.dev/speedtest/down?bytes=100000000', {
        responseType: 'blob',
        onDownloadProgress: function(progressEvent) {
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
        .then(function (res) {
            //output.className = 'container';
            //output.innerHTML = res.data;
        })
        .catch(function (err) {
            output.className = 'text-2xl text-red-500 mt-10';
            output.innerHTML = err.message;
        });

};