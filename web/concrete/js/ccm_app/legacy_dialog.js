$.widget.bridge( "jqdialog", $.ui.dialog );

// wrap our old dialog function in the new dialog() function.
jQuery.fn.dialog = function() {
	// Pass this over to jQuery UI Dialog in a few circumstances
	if (arguments.length > 0) {
		$(this).jqdialog(arguments[0], arguments[1], arguments[2]);
		return;
	} else if ($(this).is('div')) {
		$(this).jqdialog();
		return;
	}
	// LEGACY SUPPORT
	return $(this).each(function() {
		$(this).unbind('click.make-dialog').bind('click.make-dialog', function(e) {
			var href = $(this).attr('href');
			var width = $(this).attr('dialog-width');
			var height =$(this).attr('dialog-height');
			var title = $(this).attr('dialog-title');
			var onOpen = $(this).attr('dialog-on-open');
			var onDestroy = $(this).attr('dialog-on-destroy');
			/*
			 * no longer necessary. we auto detect
				var appendButtons = $(this).attr('dialog-append-buttons');
			*/
			var onClose = $(this).attr('dialog-on-close');
			var onDirectClose = $(this).attr('dialog-on-direct-close');
			obj = {
				modal: true,
				href: href,
				width: width,
				height: height,
				title: title,
				onOpen: onOpen,
				onDestroy: onDestroy,
				onClose: onClose,
				onDirectClose: onDirectClose
			}
			jQuery.fn.dialog.open(obj);
			return false;
		});
	});
}

jQuery.fn.dialog.close = function(num) {
	num++;
	$("#ccm-dialog-content" + num).jqdialog('close');
}

jQuery.fn.dialog.open = function(obj) {
	jQuery.fn.dialog.showLoader();
	if (typeof($.fn.ccmmenu) != 'undefined') {
		$.fn.ccmmenu.hide();
	}
	var nd = $(".ui-dialog").length;
	nd++;
	$('body').append('<div id="ccm-dialog-content' + nd + '" style="display: none"></div>');
	
	if (typeof(obj.width) == 'string') {
		if (obj.width == 'auto') {
			w = 'auto';
		} else {
			if (obj.width.indexOf('%', 0) > 0) {
				w = obj.width.replace('%', '');
				w = $(window).width() * (w / 100);
				w = w + 50;
			} else {
				w = parseInt(obj.width) + 50;
			}
		}
	} else if (obj.width) { 
		w = parseInt(obj.width) + 50;
	} else {
		w = 550;
	}

	if (typeof(obj.height) == 'string') {
		if (obj.height == 'auto') {
			h = 'auto';
		} else {
			if (obj.height.indexOf('%', 0) > 0) {
				h = obj.height.replace('%', '');
				h = $(window).height() * (h / 100);
				h = h + 100;
			} else {
				h = parseInt(obj.height) + 100;
			}
		}
	} else if (obj.height) {
		h = parseInt(obj.height) + 100;
	} else {
		h = 400;
	}
	if (h !== 'auto' && h > $(window).height()) {
		h = $(window).height();
	}
	$("#ccm-dialog-content" + nd).jqdialog({
		'modal': true,
		'height': h,
		'width': w,
		'escapeClose': true,
		'title': obj.title,

		'create': function() {
			$(this).parent().addClass('ccm-dialog-opening');
		},

		'open': function() {
			$(this).parent().addClass('ccm-dialog-open');
			$("body").css("overflow", "hidden");
			var overlays = $('.ui-widget-overlay').length;
			$('.ui-widget-overlay').each(function(i, obj) {
				if ((i + 1) < overlays) {
					$(this).css('opacity', 0);
				}
			});
		},
		'beforeClose': function() {
			var nd = $(".ui-dialog").length;
			if (nd == 1) {
				$("body").css("overflow", "auto");		
			}
		},
		'close': function(ev, u) {
			$(this).jqdialog('destroy').remove();
			$("#ccm-dialog-content" + nd).remove();
			if (typeof obj.onClose != "undefined") {
				if ((typeof obj.onClose) == 'function') {
					obj.onClose();
				} else {
					eval(obj.onClose);
				}
			}
			if (typeof obj.onDirectClose != "undefined" && ev.handleObj && (ev.handleObj.type == 'keydown' || ev.handleObj.type == 'click')) {
				if ((typeof obj.onDirectClose) == 'function') {
					obj.onDirectClose();
				} else {
					eval(obj.onDirectClose);
				}
			}
			if (typeof obj.onDestroy != "undefined") {
				if ((typeof obj.onDestroy) == 'function') {
					obj.onDestroy();
				} else {
					eval(obj.onDestroy);
				}
			}
			var overlays = $('.ui-widget-overlay').length;
			$('.ui-widget-overlay').each(function(i, obj) {
				if ((i + 1) < overlays) {
					$(this).css('opacity', 0);
				} else {
					$(this).css('opacity', 1);
				}
			});

			nd--;
		}
	});		
	
	if (!obj.element) {
		$.ajax({
			type: 'GET',
			url: obj.href,
			success: function(r) {
				jQuery.fn.dialog.hideLoader();
				jQuery.fn.dialog.replaceTop(r);
				
				if (typeof obj.onOpen != "undefined") {
					if ((typeof obj.onOpen) == 'function') {
						obj.onOpen();
					} else {
						eval(obj.onOpen);
					}
				}
				
			}
		});			
	} else {
		jQuery.fn.dialog.hideLoader();
		jQuery.fn.dialog.replaceTop($(obj.element));
		if (typeof obj.onOpen != "undefined") {
			if ((typeof obj.onOpen) == 'function') {
				obj.onOpen();
			} else {
				eval(obj.onOpen);
			}
		}
	}
		
}

jQuery.fn.dialog.replaceTop = function(r) {
	var nd = $(".ui-dialog").length;
	if (typeof(r) == 'string') { 
		$("#ccm-dialog-content" + nd).html(r);
	} else {
		var r2 = r.clone(true, true).appendTo('#ccm-dialog-content' + nd);
		if (r2.css('display') == 'none') {
			r2.show();
		}
	}

	$("#ccm-dialog-content" + nd + " .dialog-launch").dialog();
	$("#ccm-dialog-content" + nd + " .ccm-dialog-close").click(function() {
		jQuery.fn.dialog.closeTop();
	});
	if ($("#ccm-dialog-content" + nd + " .dialog-buttons").length > 0) {
		$("#ccm-dialog-content" + nd).jqdialog('option', 'buttons', [{}]);
		$("#ccm-dialog-content" + nd).parent().find(".ui-dialog-buttonset").remove();
		$("#ccm-dialog-content" + nd).parent().find(".ui-dialog-buttonpane").html('');
		$("#ccm-dialog-content" + nd + " .dialog-buttons").appendTo($("#ccm-dialog-content" + nd).parent().find('.ui-dialog-buttonpane').addClass("ccm-ui"));
	}

	if ($("#tooltip-holder").length == 0) {
		$('<div />').attr('id','tooltip-holder').attr('class', 'ccm-ui').prependTo(document.body);
	}

	if ($("#ccm-dialog-content" + nd + " .dialog-help").length > 0) {
		$("#ccm-dialog-content" + nd + " .dialog-help").hide();
		var helpContent = $("#ccm-dialog-content" + nd + " .dialog-help").html();
		if (ccmi18n.helpPopup) {
			var helpText = ccmi18n.helpPopup;
		} else {
			var helpText = 'Help';
		}
		$("#ccm-dialog-content" + nd).parent().find('.ui-dialog-titlebar').addClass('ccm-ui').append('<button class="ui-dialog-titlebar-help ccm-menu-help-trigger"><i class="icon-info-sign"></i></button>');
		$("#ccm-dialog-content" + nd).parent().find('.ui-dialog-titlebar .ccm-menu-help-trigger').popover({content: function() {
			return helpContent;			
		}, placement: 'bottom', html: true, container: '#tooltip-holder', trigger: 'click'});
	}
}

jQuery.fn.dialog.showLoader = function(text) {
	if (typeof(imgLoader)=='undefined' || !imgLoader || !imgLoader.src) return false; 
	if ($('#ccm-dialog-loader').length < 1) {
		$("body").append("<div id='ccm-dialog-loader-wrapper' class='ccm-ui'><div class='progress progress-striped active' style='width: 300px'><div class='progress-bar progress-bar-info' style='width: 100%;'></div></div></div>");//add loader to the page
	}
	if (text != null) {
		$('#ccm-dialog-loader-text',$('#ccm-dialog-loader-wrapper')).remove();
		$("<div />").attr('id', 'ccm-dialog-loader-text').html(text).prependTo($("#ccm-dialog-loader-wrapper"));
	}

	var w = $("#ccm-dialog-loader-wrapper").width();
	var h = $("#ccm-dialog-loader-wrapper").height();
	var tw = $(window).width();
	var th = $(window).height();
	var _left = (tw - w) / 2;
	var _top = (th - h) / 2;
	$("#ccm-dialog-loader-wrapper").css('left', _left + 'px').css('top', _top + 'px');
	$('#ccm-dialog-loader-wrapper').show();//show loader
	//$('#ccm-dialog-loader-wrapper').fadeTo('slow', 0.2);
}

jQuery.fn.dialog.hideLoader = function() {
	$("#ccm-dialog-loader-wrapper").hide();
	$("#ccm-dialog-loader-text").remove();
}

jQuery.fn.dialog.closeTop = function() {
	var nd = $(".ui-dialog").length;
	$("#ccm-dialog-content" + nd).jqdialog('close');
}

jQuery.fn.dialog.closeAll = function() {
	$($(".ui-dialog-content").get().reverse()).jqdialog('close');
}


var imgLoader;
var ccm_dialogOpen = 0;
jQuery.fn.dialog.loaderImage = CCM_IMAGE_PATH + "/throbber_white_32.gif";

var ccmAlert = {  
    notice : function(title, message, onCloseFn) {
        $.fn.dialog.open({
            href: CCM_TOOLS_PATH + '/alert',
            title: title,
            width: 320,
            height: 160,
            modal: false, 
			onOpen: function () {
        		$("#ccm-popup-alert-message").html(message);
			},
			onDestroy: onCloseFn
        }); 
    },
    
    hud: function(message, time, icon, title) {
    	if ($('#ccm-notification-inner').length == 0) { 
    		$(document.body).append('<div id="ccm-notification" class="ccm-ui"><div id="ccm-notification-inner"></div></div>');
    	}
    	
    	if (icon == null) {
    		icon = 'edit_small';
    	}
    	
    	if (title == null) {	
	    	var messageText = message;
	    } else {
	    	var messageText = '<h3>' + title + '</h3>' + message;
	    }
    	$('#ccm-notification-inner').html('<img id="ccm-notification-icon" src="' + CCM_IMAGE_PATH + '/icons/' + icon + '.png" width="16" height="16" /><div id="ccm-notification-message">' + messageText + '</div>');
		
		$('#ccm-notification').show();
		
    	if (time > 0) {
    		setTimeout(function() {
    			$('#ccm-notification').fadeOut({easing: 'easeOutExpo', duration: 300});
    		}, time);
    	}
    	
    }
}      

$(document).ready(function(){   
	imgLoader = new Image();// preload image
	imgLoader.src = jQuery.fn.dialog.loaderImage;

});
