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

	if (nw_type == 'reservations') {

		hr_addr = nw_id.split(':')[0];
		subnet_id = nw_id.split(':')[1];

		test_config_file['Dhcp4']['subnet4'].forEach(s => {
			if (s.id == subnet_id) {

				s['reservations'].forEach(h => {
					if (h['ip-address'] == hr_addr)
						configformData.forEach(fd => {
							if (fd.name.includes('_')) {
								tags = fd.name.split('_');
								h[tags[0]][tags[1]] = fd.value;
							}
							else
								h[fd.name] = fd.value;
						});
				});
				// TODO: make effecient
				// break;
				console.log(s)
			}
		});
	} else {
		if (nw_type == 'shared-networks')
			x = 'name';
		else
			x = 'id';
		test_config_file['Dhcp4'][nw_type].forEach(s => {
			if (s[x] == nw_id) {
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
	}

	dhcp_config.setValue(JSON.stringify(test_config_file, null, 4), -1);
	notification('Test config_file generated.');
	notification('Review changes via config file editor!');

	document.getElementById('test_btn').disabled = false;
	// $.post("/dhcp_config_update", dhcp_config_form_data, function (data) {
	// 	$("#dhcp_config_result").html(data);
	// });
}

function test_dhcp_config() {
	// Fetch changed config file data as query string for verification
	params = "mode=test&dhcp_config_file=" + encodeURIComponent(dhcp_config.getValue());

	$.post("/dhcp_config_update", params, function (data) {
		console.log(data.message);
		notification(data.message);
	});
}

function save_dhcp_config() {
	// Push updated config file data as query string to server 
	params = "mode=update&dhcp_config_file=" + encodeURIComponent(dhcp_config.getValue());

	$.post("/dhcp_config_update", dhcp_config_form_data, function (data) {
		$("#dhcp_config_result").html(data);
	});
}
