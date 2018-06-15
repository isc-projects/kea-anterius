/*
© Anthrino > DHCP config update handler
*/

$('#dhcp_config').height($(window).height() * 0.6);

var dhcp_config = ace.edit("dhcp_config");
dhcp_config.setTheme("ace/theme/terminal");
dhcp_config.$blockScrolling = Infinity;


function gen_dhcp_config(nw_id, nw_type) {

	// Fetch config form options as query string
	// dhcp_config_form_data = get_form_query_string("dhcp_config_form");
	// dhcp_config_form_data += "&nw_entity=" + nw_entity + "&nw_type=" + nw_type;

	configformData = $("#config-form").serializeArray();
	// console.log(configformData)
	
	// Instantiate a temp test file
	test_config_file = JSON.parse(dhcp_config.getValue());
	// console.log(test_config_file['Dhcp4']['subnet4'][0]);

	if (nw_type == 'subnet') {
		test_config_file['Dhcp4']['subnet4'].forEach(s => {
			if (s.id == nw_id) {
				configformData.forEach(fd => {
					if (fd.name.includes('_')) {
						tags = fd.name.split('_');
						s[tags[0]][tags[1]] = fd.value;
					}
					else
						s[fd.name] = fd.value;
				});
				// TODO: make effecient
				// break;
				console.log(s)
			}
		});
	} else if (nw_type == 'shared') {

	} else {

	}

	dhcp_config.setValue(JSON.stringify(test_config_file, null, 4), -1);

	// $.post("/dhcp_config_update", dhcp_config_form_data, function (data) {
	// 	$("#dhcp_config_result").html(data);
	// });
}

function test_dhcp_config() {
	dhcp_config_form_data = get_form_query_string("dhcp_config_form");
	dhcp_config_form_data = dhcp_config_form_data + "&dhcp_config_data=" + encodeURIComponent(dhcp_config.getValue());

	$.post("/dhcp_config_update", dhcp_config_form_data, function (data) {
		$("#dhcp_config_result").html(data);
	});
}

function save_dhcp_config() {
	dhcp_config_form_data = get_form_query_string("dhcp_config_form");
	dhcp_config_form_data = dhcp_config_form_data + "&dhcp_config_data=" + encodeURIComponent(dhcp_config.getValue());

	$.post("/dhcp_config_update", dhcp_config_form_data, function (data) {
		$("#dhcp_config_result").html(data);
	});
}
