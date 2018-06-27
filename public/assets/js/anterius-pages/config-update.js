/*
© Anthrino > DHCP config update handler
*/

$('#dhcp-config').height($(window).height() * 0.6);

var dhcp_config = ace.edit("dhcp-config");
dhcp_config.setTheme("ace/theme/terminal");
dhcp_config.$blockScrolling = Infinity;

var Range = ace.require('ace/range').Range;
var config_copy = dhcp_config.session.doc.getAllLines();
var markedList = [];

function gen_dhcp_config(nw_id, nw_type, subnet_list) {

	/* Fetch config form options as query string */
	// dhcp_config_form_data = get_form_query_string("dhcp_config_form");
	// dhcp_config_form_data += "&nw_entity=" + nw_entity + "&nw_type=" + nw_type;

	configformData = $("#config-form").serializeArray();
	// console.log(configformData)

	/* Instantiate a temp test file and Copy to identify file changes*/
	config_copy = dhcp_config.session.doc.getAllLines();
	test_config_file = JSON.parse(dhcp_config.getValue());

	// console.log(test_config_file['Dhcp4']['subnet4'][0]);
	// console.log(subnet_list);

	if (nw_type == 'reservations') {

		hr_addr = nw_id.split(':')[0];
		subnet_id = nw_id.split(':')[1];

		target_sn_list = [];

		/* Check if subnet lies under shared nw */
		if (subnet_list[subnet_id - 1].shared_nw_name)
			test_config_file['Dhcp4']['shared-networks'].forEach(shnw => {
				if (shnw.name == subnet_list[subnet_id - 1].shared_nw_name)
					target_sn_list = shnw.subnet4;
			});
		else
			target_sn_list = test_config_file['Dhcp4']['subnet4'];

		target_sn_list.forEach(s => {
			if (s.id == subnet_id) {
				s['reservations'].forEach(h => {
					if (h['ip-address'] == hr_addr)
						configformData.forEach(fd => {
							if (fd.value != null && fd.value != 'undefined') {
								if (!isNaN(fd.value))
									fd.value = parseInt(fd.value);
								if (fd.name.includes('_')) {
									tags = fd.name.split('_');
									if (h[tags[0]][tags[1]] != fd.value) {
										h[tags[0]][tags[1]] = fd.value;
									}
								}
								else
									if (h[fd.name] != fd.value) {
										h[fd.name] = fd.value;
									}
							}
						});
				});
				// TODO: make effecient
				// break;
				console.log(s);
			}
		});
	} else {

		target_sn_list = test_config_file['Dhcp4'][nw_type];

		if (nw_type == 'shared-networks')
			x = 'name';
		else {
			if (subnet_list[nw_id - 1].shared_nw_name)
				test_config_file['Dhcp4']['shared-networks'].forEach(shnw => {
					if (shnw.name == subnet_list[nw_id - 1].shared_nw_name)
						target_sn_list = shnw.subnet4;
				});
			x = 'id';
		}
		// console.log(target_sn_list);

		target_sn_list.forEach(s => {
			if (s[x] == nw_id) {
				configformData.forEach(fd => {
					if (fd.value != null && fd.value != 'undefined') {
						if (!isNaN(fd.value))
							fd.value = parseInt(fd.value);
						if (fd.name.includes('_')) {
							tags = fd.name.split('_');
							if (s[tags[0]][tags[1]] != fd.value) {
								s[tags[0]][tags[1]] = fd.value;
							}
						}
						else
							if (s[fd.name] != fd.value) {
								s[fd.name] = fd.value;
							}
					}
				});
				// TODO: make effecient
				// break;
				// console.log(s)
				target_sn_list.push();
			}
		});
	}

	/* Set test config to editor and highlight changed lines */
	dhcp_config.setValue(JSON.stringify(test_config_file, null, 4), -1);
	highlightEditedLineNumbers(dhcp_config, config_copy);

	notification('Test config_file generated.', 'bg-green', 100);
	notification('Switch to config file editor (second tab) to review changes');

	document.getElementById('test_btn').disabled = false;
	// $.post("/dhcp_config_update", dhcp_config_form_data, function (data) {
	// 	$("#dhcp_config_result").html(data);
	// });
}

function test_dhcp_config() {
	// Fetch changed config file data as query string for verification
	params = "mode=test&affirm=true&dhcp_config_file=" + encodeURIComponent(dhcp_config.getValue());

	$.post("/dhcp_config_update", params, function (data) {
		// console.log(data.message);
		if (data.status == 0) {
			notification(data.message, 'bg-green', 3000);
			document.getElementById('update_btn').disabled = false;
		} else
			notification(data.message, 'bg-red', 3000);
	});
}

function save_dhcp_config() {
	// Push updated config file data as query string to server 
	var affirm = confirm("Confirm: Apply changed config to server?");
	params = "mode=update&affirm=" + affirm + "&dhcp_config_file=" + encodeURIComponent(dhcp_config.getValue());

	$.post("/dhcp_config_update", params, function (data) {
		if (data.status == 0) {
			notification(data.message, 'bg-green', 3000);
			document.getElementById("gen_btn").disabled = true;
			document.getElementById('update_btn').disabled = true;
			document.getElementById('test_btn').disabled = true;
		} else
			notification(data.message, 'bg-red', 3000);
	});
}

/* Method to invoke file editor changes highlighting */
function file_highlight() {

	/* Instantiate a temp test file and Copy to identify file changes*/
	highlightEditedLineNumbers(dhcp_config, config_copy);
}

/* Method to highlight lines with changes in config params */
function highlightEditedLineNumbers(editor, config_og) {
	var lines = editor.session.doc.getAllLines();
	markedList.forEach(mid => {
		dhcp_config.session.removeMarker(mid);
	})

	markedList = [];
	// console.log(markedList);

	for (var i = 0, l = lines.length; i < l; i++) {
		target_line = lines[i];

		// TODO: Figure out way to highlight actual changes
		if (!config_copy.includes(target_line)) {
			// editor.session.insert({ row: i }, target_line.replace('>>>', ''));
			markedList.push(dhcp_config.session.addMarker(new Range(i, 0, i, 1), "editMarker", "fullLine"));
		}

	}
}