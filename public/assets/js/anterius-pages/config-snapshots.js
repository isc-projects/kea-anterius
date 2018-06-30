function view_snapshot(snapshot) {
	$.post("/dhcp_config_snapshot_view", "snapshot=" + encodeURIComponent(snapshot), function (data) {

		$('#snapshot_grid').fadeOut(100).fadeIn(100);
		$('#snapshot_name').html("Snapshot '" + snapshot + "'");

		$('html, body').animate({
			scrollTop: $("#snapshot_grid").offset().top
		}, 500);

		config_snapshot = ace.edit("snapshot");
		config_snapshot.setTheme("ace/theme/terminal");
		config_snapshot.session.setValue(JSON.stringify(data, null, '\t'));
		config_snapshot.$blockScrolling = Infinity;


	});
}
function save_config_snapshot(snapshot) {

	var dhcp_config = ace.edit("dhcp-config");
	params = "dhcp_config_file=" + encodeURIComponent(dhcp_config.getValue());

	$.post("/dhcp_config_snapshots", params, function (data) {
		notification(data.message, 'bg-green', 3000);
	});
}
