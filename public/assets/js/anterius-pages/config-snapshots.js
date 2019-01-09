/*
© Anthrino > DHCP Config Snapshot request handler
*/

'use strict';

var snap_config_copy;

/* Method to receive view snapshot requests from snapshots page */
function view_snapshot(snapshot) {
	$.post("/dhcp_config_snapshot_view", "snapshot=" + encodeURIComponent(snapshot), function (data) {

		/* Initialize title and Restore btn */
		$('#snapshot_grid').fadeOut(100).fadeIn(100);
		$('#snapshot_name').html("Snapshot '" + snapshot + "'");
		$('#snapshot_btn').html(' <button id="test_btn" type="button" class="btn btn-info waves-effect ant-btn" style="margin: 2%; width: 20%;"' +
			'onclick="test_dhcp_config()"><i class="material-icons">system_update_alt</i><span>Test Config</span></button>' +
			'<button id="update_btn" type="button" class="btn btn-info waves-effect ant-btn" disabled style="margin: 2%;  width: 20%;"' +
			'onclick="upload_dhcp_config()"><i class="material-icons">system_update_alt</i><span>Restore Config</span></button>');

		$('html, body').animate({
			scrollTop: $("#snapshot_grid").offset().top
		}, 500);

		/* Load selected snapshot onto Ace editor */
		var config_snapshot = ace.edit("dhcp-config");
		config_snapshot.setTheme("ace/theme/terminal");
		config_snapshot.session.setValue(JSON.stringify(data, null, '\t'));
		config_snapshot.$blockScrolling = Infinity;

		snap_config_copy = config_snapshot.session.doc.getAllLines();

	});
}

/* Method to receive save snapshot requests from dhcp config page */
function save_config_snapshot() {

	var params = "mode=save&dhcp_config_file=" + encodeURIComponent(dhcp_config.getValue());

	$.post("/dhcp_config_snapshots", params, function (data) {
		if (data.message)
			notification(data.message, 'bg-black', 3000);
		else
			notification("Error creating snapshot : " + data.error, 'bg-red', 3000);

	});
}

/* Method to delete saved snapshots */
function delete_config_snapshot(snapshot) {

	var affirm = confirm("Confirm: Delete Config Snapshot: " + snapshot + "?");
	var params = "mode=delete&affirm=" + affirm + "&snapshot=" + encodeURIComponent(snapshot);

	$.post("/dhcp_config_snapshots", params, function (data) {
		if (data.message)
			notification(data.message, 'bg-black', 3000);
		else
			notification("Error deleting snapshot : " + data.error, 'bg-red', 3000);
		refresh_info(750);
	});
}

/* Method to invoke file editor changes highlighting */
function snap_highlight() {

	/* Instantiate a temp test file and Copy to identify file changes*/
	// console.log(dhcp_config)
	// snap_config_copy.forEach(line => { console.log(line) });
	highlightEditedLineNumbers(dhcp_config, snap_config_copy);
}