/*
© Anthrino > API call and result processing services
*/

var http = require('http');

module.exports = {

    // Generic fn for CA API Calls
    fire_kea_api: function (req_data, ca_addr, ca_port) {
        // console.log(req_data);
        var options = {
            host: ca_addr,
            port: ca_port,
            path: '/',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': req_data.length
            },
            method: 'POST'
        };
        return new Promise(function (resolve, reject) {
            var req = http.request(options, function (res) {
                // console.log('STATUS: ' + res.statusCode);
                // console.log('HEADERS: ' + JSON.stringify(res.headers));
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error('Status Code : ' + res.statusCode));
                }
                res.setEncoding('utf8');

                var body = '';
                res.on('data', function (chunk) {
                    // console.log('BODY: ' + chunk);
                    body += chunk;
                });
                res.on('end', function () {
                    try {
                        let response_data = JSON.parse(body)[0];
                        resolve(response_data);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            req.on('error', (e) => {
                console.error(`Request Error: ${e.message}`);
                reject(e);
            });
            req.write(req_data);
            req.end();
        });
    }
};                
