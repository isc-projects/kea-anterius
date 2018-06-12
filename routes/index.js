var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

/* GET home page. */
router.get('/', function (req, res, next) {
	console.log(req.url);

	counters = template_render.get_template("counters");

	/* Display Shared Networks table */
	content_shared_networks = template_render.get_template("shared_nw_table");

	/* Display Subnets table */
	content_subnets = template_render.get_template("subnet_table");
	content_subnets = template_render.set_template_variable(content_subnets, "title", "Subnets");
	content_subnets = template_render.set_template_variable(content_subnets, "table_id", "subnets");
	content_subnets = template_render.set_template_variable(content_subnets, "table_dim", "col-xs-12 col-sm-12 col-md-6 col-lg-6");
	// content_subnets = template_render.set_template_variable(content_subnets, "table_content", "");

	res.send(
		template_render.get_index_template(
			counters +
			'<div class="row clearfix">' +
			content_shared_networks + content_subnets +
			'</div>',
			req.url
		) + '<script type="text/javascript">get_stats(); </script>'

	);

});

module.exports = router;