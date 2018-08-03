var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

function human_time(time) {
    var time = new Date(time);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var date1 = time.getDate();
    var hour = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();

    var hour = time.getHours();
    var minute = time.getMinutes();
    var amPM = (hour > 11) ? "PM" : "AM";
    if (hour > 12) {
        hour -= 12;
    } else if (hour == 0) {
        hour = "12";
    }
    if (minute < 10) {
        minute = "0" + minute;
    }

    return year + "-" + month + "-" + date1 + " " + hour + ":" + minute + ' ' + amPM;
}

/* Method to Save current config file to timestamped snapshot */
router.post('/', authorize.auth, function (req, res, next) {

    /* Create snapshot bckp folder if missing */
    try {

        bkp_dir = 'config_backups/' + global.anterius_config.current_server;
        if (!fs.existsSync(bkp_dir)) {
            fs.mkdirSync(bkp_dir);
        }
        var request = req.body;

        if (request.mode == 'save') {

            var json_file = require('jsonfile');
            var timestamp = new Date().getTime();
            var ss_filename = global.anterius_config.current_server + "_conf_snap_" + timestamp;

            dhcp_config_file = JSON.parse(request.dhcp_config_file);
            // console.log(ss_filename, human_time(timestamp), dhcp_config_file);

            json_file.writeFile(bkp_dir + '/' + ss_filename, dhcp_config_file, { spaces: 2 });
            res.send({ "message": global.anterius_config.current_server.toUpperCase() + ' Config snapshot created @ <br>< ' + human_time(timestamp) + ' >' });
        }
        else if (request.affirm) {
            fs.unlinkSync(bkp_dir + '/' + request.snapshot);
            res.send({ "message": 'Config snapshot deleted!' });
        }

    } catch (err) {
        console.error(err);
    }


});

/* Method to Fetch and display list of available snapshots with timestamp for current server */
router.get('/', authorize.auth, function (req, res, next) {

    var content = "";
    content = template_render.get_template("dhcp_config_snapshots");
    content = template_render.set_template_variable(content, "title", "DHCP Config Snaphots");

    /* Create snapshot bckp folder if missing */
    bkp_dir = 'config_backups/' + global.anterius_config.current_server;
    if (!fs.existsSync(bkp_dir)) {
        fs.mkdirSync(bkp_dir);

    }
    var backups = '';

    /* Parse bckp dir for existing config snapshots */
    fs.readdirSync(bkp_dir).forEach(function (file) {
        var stats = fs.statSync(bkp_dir + '/' + file);
        var mtime = human_time(stats.mtime);
        /* Add snapshot and timestamp to files list */
        backups = backups + "<tr><td><a style='cursor:pointer;' onclick='view_snapshot(" + JSON.stringify(file) + ")'>" + file + "</a></td><td>" + mtime + "</td>" +
            "<td> <button id='del_btn' type='button' class='btn btn-info waves-effect ant-btn' onclick='delete_config_snapshot(" + JSON.stringify(file) + ")'><i class='material-icons'>delete</i></button></td</tr>";
    });

    if (backups == '') {
        backups = 'There are no snapshots present at this time...';
    }

    content = template_render.set_template_variable(content, "c_content", backups);

    res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;