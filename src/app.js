
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

    axios.get({
        url: '/speedtest/down',
        responseType: 'blob',
    })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'speedtestfile');
            document.body.appendChild(link);
            link.click();
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