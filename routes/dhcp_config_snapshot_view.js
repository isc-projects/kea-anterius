var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.post('/', authorize.auth, function (req, res, next) {
	var request = req.body;
	res.send(JSON.parse(fs.readFileSync(bkp_dir + '/' + request.snapshot, 'utf8')));
});

module.exports = router;