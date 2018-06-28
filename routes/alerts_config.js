var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function (req, res, next) {

	anterius_settings_template = template_render.get_template("alerts_editor");

	var json_file = require('jsonfile');

	/* Shared Network Alert Threshold (Critical) */
	input = template_render.form_input('Shared Network Alert Threshold % (Critical)', '<input type="input" class="form-control" name="shared_network_critical_threshold" id="shared_network_critical_threshold" placeholder="95%" value="' + anterius_config.shared_network_critical_threshold + '">');

	/* Shared Network Alert Threshold (Warning) */
	input = input + template_render.form_input('Shared Network Alert Threshold % (Warning)', '<input type="input" class="form-control" name="shared_network_warning_threshold" id="shared_network_warning_threshold" placeholder="80" value="' + anterius_config.shared_network_warning_threshold + '">');

	/* Leases Per Minute Threshold */
	input = input + template_render.form_input('Alert when Leases Per Minute Reaches Below this Number', '<input type="input" class="form-control" name="leases_per_minute_threshold" id="leases_per_minute_threshold" placeholder="0" value="' + anterius_config.leases_per_minute_threshold + '">');

	// <div name="" id="anterius_settings_result"></div>

	form_data = template_render.form_body("anterius-alerts-form", input);

	anterius_settings_template = template_render.set_template_variable(anterius_settings_template, "c_content", form_data);

	/* Slack Webhook URL */
	input = template_render.form_input('Slack Webhook URL <img src="images/slack-icon.png" style="height:25px; width: auto;"> ', '<input type="input" class="form-control" name="slack_webhook_url" id="slack_webhook_url" placeholder="https://hooks.slack.com/services/xxx/xxx/xxx" value="' + anterius_config.slack_webhook_url + '">');

	/* Slack Channel */
	input = input + template_render.form_input('Slack Channel <img src="images/slack-icon.png" style="height:25px; width: auto;"> ', '<input type="input" class="form-control" name="slack_alert_channel" id="slack_alert_channel" placeholder="#channel" value="' + anterius_config.slack_alert_channel + '">');

	/* E-Mail Send To */
	input = input + template_render.form_input(
		'E-Mail Send To <i class="material-icons" style="font-size: 16px !important;">mail</i>',
		'<input type="input" class="form-control" name="email_alert_to" id="email_alert_to" placeholder="email@example.com, email2@example.com" value="' + anterius_config.email_alert_to + '">'
	);

	/* SMS Send To */
	input = input + template_render.form_input(
		'SMS Gateway E-Mails <i class="material-icons" style="font-size: 16px !important;">perm_phone_msg</i>',
		'<input type="input" class="form-control" name="sms_alert_to" id="sms_alert_to" placeholder="smsgatewayemail@example.com, smsgatewayemail@example.com" value="' + anterius_config.sms_alert_to + '">'
	);

	// <div name="" id="anterius_settings_result"></div>

	form_data = template_render.form_body("anterius-notifications-form", input);

	anterius_settings_template = template_render.set_template_variable(anterius_settings_template, "n_content", form_data);

	anterius_settings_template = template_render.set_template_variable(
		anterius_settings_template,
		"save_button",
		'<button type="button" class="btn btn-info waves-effect ant-btn" onclick="save_alarm_settings()"><i class="material-icons">add_alert</i> <span>Save Alert Settings</span></button>'
	);

	res.send(template_render.get_index_template(anterius_settings_template, req.url));
});

module.exports = router;