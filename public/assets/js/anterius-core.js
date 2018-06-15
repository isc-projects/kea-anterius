/*
© Anthrino > Cross Appn Core JS functions
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
    $('#modal-buttons').html('');
    $('#modal-title').html(title);
    $('#modal-body').html(content);

    // <button type="button" class="btn btn-link waves-effect">SAVE CHANGES</button>
    if (buttons != '') {
        $('#modal-buttons').html(buttons);
    }
    $('#mdModal').modal('show');
}

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
        query_string = query_string + "&" + $(this).attr('id') + "=" + encodeURIComponent(val);
    });
    return query_string;
}

//Toggle show/hide feature for side nav menu
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

function refresh_info() {
    source = window.location.href;
    get_stats();
    window.location = source;
    // window.location = source+'?v_ajax';

    // TODO: disable refresh button for unnecessary pages
    // if('nw_detail_info' in source){

    // }
}

function edit_params(mode) {
    source = window.location.href;
    info = source.split('?')[1].split('&');
    console.log(info);
    if (mode == 0)
        window.location.replace('/dhcp_config?network=' + info[0].split('type=')[1] + '&id=' + info[1].split('id=')[1]);
    else
        window.location.replace('/dhcp_config?network=reservations&id=' + mode);
}

function save_config() {
    anterius_settings = get_form_query_string("anterius-settings-form");

    $.post("/anterius_settings_save", anterius_settings, function (data) {
        $("#anterius_settings_result").html(data);
    });
}

function notification(text) {
    colorName = 'bg-black';
    animateEnter = 'animated fadeInDown';
    animateExit = 'animated fadeOutUp';
    var allowDismiss = true;

    $.notify({
        message: text
    },
        {
            type: colorName,
            allow_dismiss: allowDismiss,
            newest_on_top: true,
            timer: 1000,
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

function change_favicon(img) {
    var favicon = document.querySelector('link[rel="shortcut icon"]');

    if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'shortcut icon');
        var head = document.querySelector('head');
        head.appendChild(favicon);
    }

    favicon.setAttribute('type', 'image/png');
    favicon.setAttribute('href', img);
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