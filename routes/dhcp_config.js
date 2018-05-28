var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function(req, res, next) {

	var content = "";

	content = template_render.get_template("dhcp_config");

	/* Read Config */
	var json_file = require('jsonfile');
	var anterius_config = json_file.readFileSync('config/anterius_config.json');

	content = template_render.set_template_variable(content, "title", "DHCP Config");
	content = template_render.set_template_variable(content, "c_content", "");
	content = template_render.set_template_variable(content, "dhcp_config_location", anterius_config.config_file);

	var dhcp_config = fs.readFileSync(anterius_config.config_file, 'utf8');
	content = template_render.set_template_variable(content, "dhcp_config_content", dhcp_config);

	res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;