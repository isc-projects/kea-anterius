/*
© Anthrino > Cross Application Core JS functions
*/

var loader_html = '<div class="preloader"> \
    <div class="spinner-layer pl-light-blue"> \
    <div class="circle-clipper left"> \
    <div class="circle"></div> \
    </div> \
    <div class="circle-clipper right"> \
    <div class="circle"></div> \
    </div> \
    </div> \
    </div>';

/*
 * On initial document load events
 */

$(document).ready(function () {
    
    remove_init_form();

    /* Remove 'active' class from 'li' items */
    setTimeout(function () {
        $('li.active').removeClass("active");

        $('.list > li').each(function () {
            var href = $(this).find('a').attr("href");
            if (typeof href !== "undefined") {
                // console.log(href);
                // console.log(document.location.pathname);

                if (href == document.location.pathname) {
                    $(this).addClass("active");
                }
            }
        });


    }, 100);

    setTimeout(function () {
        handle_websocket_subscription_navigation();
    }, 100);
});

/*
 * When a sidebar item is clicked - let's make sure we set the active/inactive components
 */

$(document).on('on_pjax_click', function (e, href) {
    
    $('li.active').removeClass("active");
    href.parent('li').addClass("active");

    /* Unhook from all websocket events */
    websockets_unsubscribe_all_events();

});

/*
 * When a sidebar item is clicked in mobile - let's make sure we push the sidebar back in
 */
$(document).on('on_pjax_complete', function (e) {
    
    if ($('.ls-closed').length > 0) {
        $('body').removeClass('overlay-open');
        $('.overlay').css("display", "none");
    }

    handle_websocket_subscription_navigation();

    /*
     * Form input focus event
     */
    $('.form-control').focus(function () {
        $(this).parent().addClass('focused');
    });

    //On focusout event
    $('.form-control').focusout(function () {
        var $this = $(this);
        if ($this.parents('.form-group').hasClass('form-float')) {
            if ($this.val() == '') {
                $this.parents('.form-line').removeClass('focused');
            }
        }
        else {
            $this.parents('.form-line').removeClass('focused');
        }
    });

    //On label click
    $('body').on('click', '.form-float .form-line .form-label', function () {
        $(this).parent().find('input').focus();
    });

    //Not blank form
    $('.form-control').each(function () {
        if ($(this).val() !== '') {
            $(this).parents('.form-line').addClass('focused');
        }
    });

    remove_init_form();
});

function handle_websocket_subscription_navigation() {
    
    console.log(window.location.pathname);

    /* Stream dashboard stats */
    if (document.location.pathname == "/") {
        websockets_subscribe_event("dhcp_statistics");
    }
    else {
        websockets_unsubscribe_all_events();
    }
}

function remove_init_form() {
    
    setTimeout(function () {
        $('.form-line').removeClass("focused");
    }, 10);
}

function modal(title, content, buttons) {
    
    
    // console.log(title, buttons);
    $('#modal-buttons').html('');
    $('#modal-title').html(title);
    $('#modal-body').html(content);

    // <button type="button" class="btn btn-link waves-effect">SAVE CHANGES</button>
    if (buttons != '') {
        $('#modal-buttons').html(buttons);
    }
    $('#mdModal').modal('show');
}

/* Method to generate  query string from html form fields */
function get_form_query_string(form_id) {
    

    query_string = "";
    $('#' + form_id).find('input, select, textarea').each(function (key) {
        val = $(this).val();
        if (val == 'undefined') {
            val = '';
        }
        if ($(this).attr('type') == "checkbox") {
            if (!$(this).is(':checked')) {
                val = 0;
            }
        }
        if ($(this).attr('type') == "radio" && !$(this).is(':checked'))
            return;

        query_string = query_string + "&" + $(this).attr('name') + "=" + encodeURIComponent(val);
    });
    return query_string;
}

/* Toggle show/hide feature for side nav menu */
function navtoggle() {
    

    side_nav = document.getElementById("leftsidebar");
    logo = document.getElementById("logo");
    menuitems = document.getElementsByClassName("menuitems");
    content = document.getElementById("content");

    content.style.visibility = 'hidden';
    content.style.opacity = 0;
    logo.style.transition = "opacity 0.5s ease";
    content.style.transition = "opacity 0.5s ease";
    for (i = 0; i < menuitems.length; i++) {
        menuitems[i].style.transition = "opacity 0.5s ease";
    }

    if (side_nav.style.width == "300px" || side_nav.offsetWidth == 300) {
        for (i = 0; i < menuitems.length; i++) {
            menuitems[i].style.opacity = 0;
        }
        logo.style.opacity = 0;
        setTimeout(function () {
            side_nav.style.width = "0px";
        }, 350);
        setTimeout(function () {
            content.style.marginLeft = "15px";
            content.style.opacity = 1;
            content.style.visibility = 'visible';
        }, 600);
    } else {
        side_nav.style.width = "300px";
        setTimeout(function () {
            for (i = 0; i < menuitems.length; i++) {
                menuitems[i].style.opacity = 1;
            }
            logo.style.opacity = 1;
        }, 100);
        setTimeout(function () {
            content.style.opacity = 1;
            content.style.marginLeft = "315px";
            content.style.visibility = 'visible';
        }, 500);
    }
}

/* Reload page on refresh_stats user request  */
function refresh_info(delay = 0, message = 'Reloading..', source = window.location.href) {
    

    setTimeout(function () {
        console.log(source);
        window.location = source;
    }, delay);

    notification(message);
    // window.location = source+'?v_ajax';

    // TODO: disable refresh button for unnecessary pages
    // if('nw_detail_info' in source){

    // } 
}

/* Identify and forward add / edit requests for dhcp nw entities */
function edit_params(mode) {
    

    source = window.location.href;
    console.log(mode);

    if (mode == 0) {
        info = source.split('?')[1].split('&');
        window.location.replace('/dhcp_config?mode=edit&network=' + info[0].split('type=')[1] + '&id=' + info[1].split('id=')[1]);
    } else if (mode.includes('add'))
        window.location.replace('/dhcp_config?mode=add&network=' + mode.split('_')[1]);
    else
        window.location.replace('/dhcp_config?mode=edit&network=reservations&id=' + mode);
}

/* Forward and notify settings update request */
function save_config() {
    

    anterius_settings = get_form_query_string("anterius-settings-form");
    $.post("/anterius_settings_save", anterius_settings, function (data) {
        $("#anterius_settings_result").html(data);
    });
}

/* Common remote host variables */
var $hostname, $addr, $port;

/* Method to Replace server host values with input fields */
function edit_server_host(index) {
    

    $hostname = $('<input type="input" name="hostname" id="hostname" class="form-control"/>').val($('#h' + index).text());
    $addr = $('<input type="input" name="svr_addr" id="svr_addr" class="form-control"/>').val($('#a' + index).text());
    $port = $('<input type="input" name="svr_port" id="svr_port" class="form-control"/>').val($('#p' + index).text());

    $('#h' + index).replaceWith($hostname);
    $('#a' + index).replaceWith($addr);
    $('#p' + index).replaceWith($port);

    // console.log($('#b' + index).children())
    $('#b' + index).attr('onclick', 'save_server_host(' + index + ')');
    $('#b' + index).children().remove(".waves-ripple").text('save');
}

/* Method to save server host input field values */
function save_server_host(index) {
    

    $hostname = $('#hostname');
    $addr = $('#svr_addr');
    $port = $('#svr_port');

    svr_host = "index=" + index + "&hostname=" + $hostname.val() + "&addr=" + $addr.val() + "&port=" + $port.val();

    $.post("/anterius_settings_save", svr_host, function (data) {
        refresh_info(750, data);
    });

    var $h = $('<p data-editable id="h' + index + '"/>').text($hostname.val());
    var $a = $('<p data-editable id="a' + index + '"/>').text($addr.val());
    var $p = $('<p data-editable id="p' + index + '"/>').text($port.val());

    $hostname.replaceWith($h);
    $addr.replaceWith($a);
    $port.replaceWith($p);

    $('#b' + index).children().remove(".waves-ripple").text('edit');
    $('#b' + index).attr('onclick', 'edit_server_host(' + index + ')');

}
/* Method to delete server host entry */
function delete_server_host(index) {
    
    svr_host = "index=" + index + "&delete=true";

    $.post("/anterius_settings_save", svr_host, function (data) {
        refresh_info(750, data);
    });
}

/* Forward and notify current server host and server type change requests */
function select_server(mode, index = 0) {
    

    if (mode == 'host') {
        svrselect = 'mode=current_host_index&svrselect=' + index;
    } else {
        if (document.getElementById("run-status"))
            svrselect = 'mode=current_server' + get_form_query_string("run-status");
        else
            svrselect = 'mode=current_server&svrselect=' + $("input[name=svrselect]:checked").val();
    }
    // console.log(svrselect);

    $.post("/anterius_settings_save", svrselect, function (data) {
        $("#anterius_settings_result").html(data);
    });
}

/* Custom notification generator */
function notification(text, colorName = 'bg-black', delay = 2000, url = '#') {
    

    animateEnter = 'animated fadeInDown';
    animateExit = 'animated fadeOutUp';
    var allowDismiss = true;

    $.notify({
        message: text,
        url: url,
    },
        {
            type: colorName,
            allow_dismiss: allowDismiss,
            newest_on_top: false,
            offset: 10,
            spacing: 10,
            z_index: 1031,
            delay: delay,
            animate: {
                enter: animateEnter,
                exit: animateExit
            },
            template: '<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0} ' + (allowDismiss ? "p-r-35" : "") + '" role="alert">' +
                '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
                '<span data-notify="icon"></span> ' +
                '<span data-notify="title">{1}</span> ' +
                '<span data-notify="message">{2}</span>' +
                '<div class="progress" data-notify="progressbar">' +
                '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                '</div>' +
                '<a href="{3}" target="{4}" data-notify="url"></a>' +
                '</div>'
        });
}

$(document).on("click", ".option_data", function () {
    
    var lease = $(this).attr("lease");
    if ($("#" + lease).is(":visible")) {
        $("#" + lease).hide();
        $(this).text('Show');
    } else if ($("#" + lease).is(":hidden")) {
        $("#" + lease).show();
        $(this).text('Hide');
    }
});

$(document).on("keypress", "#lease_search_criteria", function (e) {
    
    if (e.which == 13) {
        $('#search_result').html(loader_html);
        $.post("/dhcp_lease_search", { search: $("#lease_search_criteria").val() }, function (result) {
            $("#search_result").html(result);

            if (typeof display_leases !== "undefined")
                display_leases.destroy();

            display_leases = $('#display-leases').DataTable({
                dom: 'tip',
                responsive: true,
                "pageLength": 100,
                "aaSorting": []
            });
        });
    }
});