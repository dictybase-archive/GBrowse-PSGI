/** This nice bit of software is used courtesy of the webtoolkit group; the file 
    was renamed to be more informative. **/

/**
*
*  AJAX IFRAME METHOD (AIM)
*  http://www.webtoolkit.info/
*
**/

var Ajax_Status_Updater;
 
AIM = {
 
	frame : function(c) {
 
		var n = 'f' + Math.floor(Math.random() * 99999);
		var d = document.createElement('DIV');
		d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\')"></iframe>';
		document.body.appendChild(d);
 
		var i = document.getElementById(n);
		if (c && typeof(c.onComplete) == 'function') {
			i.onComplete = c.onComplete;
		}
 
		return n;
	},
 
	form : function(f, name) {
		f.setAttribute('target', name);
	},
 
	submit : function(f, c) {
		AIM.form(f, AIM.frame(c));
		if (c && typeof(c.onStart) == 'function') {
			return c.onStart();
		} else {
			return true;
		}
	},
 
	loaded : function(id) {
		var i = document.getElementById(id);
		if (i.contentDocument) {
			var d = i.contentDocument;
		} else if (i.contentWindow) {
			var d = i.contentWindow.document;
		} else {
			var d = window.frames[id].document;
		}
		if (d.location.href == "about:blank") {
			return;
		}
 
		if (typeof(i.onComplete) == 'function') {
			i.onComplete(d.body.innerHTML);
		}
	}
 
}

function startAjaxUpload() {
  $('upload_indicator').innerHTML = "<image src='/gbrowse2/images/spinner.gif' />";
  $('upload_status').innerHTML    = '<b>Uploading...</b>';
  $('ajax_upload').hide();
  Ajax_Status_Updater = new Ajax.PeriodicalUpdater($('upload_status'),
                                                       '#',
						       {parameters:{action:'upload_status'}});
  return true;
}

function completeAjaxUpload(response) {
    var r = response.evalJSON(true);

    if (r.success) {
	Controller.add_tracks(r.tracks,
			      function() { 
				  Controller.update_sections(
				  new Array(userdata_table_id,track_listing_id),
				      '',false,false,
                                      function() {
				          if (Ajax_Status_Updater!=null)
					  	Ajax_Status_Updater.stop();
				          $('upload_indicator').innerHTML = '';
					  $('ajax_upload').remove();
					  $('upload_status').innerHTML = '';
                                      })
					}
			      );
    } else {
        if (Ajax_Status_Updater!=null) Ajax_Status_Updater.stop();
	$('upload_indicator').innerHTML = '';
	var uploadName = r.uploadName;
    	var msg =  '<div style="background-color:pink">'+'<b>'+uploadName+'</b>: '+r.error_msg+'<br>'
    	         + '<a href="javascript:void(0)" onClick="$(\'upload_status\').innerHTML=\'\'">[Remove Message]</a>'+'</div>';
    	$('upload_status').innerHTML = msg;
    }
    return true;
}

function deleteUploadTrack (trackName) {
   var indicator = trackName + "_stat";
   $(indicator).innerHTML = "<image src='/gbrowse2/images/spinner.gif' />";
   new Ajax.Request(document.URL, {
        method:      'post',
        parameters:  {action: 'delete_upload',
	              track:  trackName
		      },
        onSuccess:   function (transport) {
	       var tracks = transport.responseJSON.tracks;
	       if (tracks != null)
		   tracks.each(function(tid) { Controller.delete_track(tid) });
	       Controller.update_sections(new Array(userdata_table_id,userimport_table_id,track_listing_id));
	    }
        }
   );
}

function addAnUploadorImportField(status_element,html) {
       var f       = 'f' + Math.floor(Math.random() * 99999);
       var d       = new Element('div',{id:f}).update(html);
       var el      = $(status_element);
       el.insert({after:d});
}

function startAjaxImport() {
  $('import_indicator').innerHTML = "<image src='/gbrowse2/images/spinner.gif' />";
  $('import_status').innerHTML    = '<b>Importing...</b>';
  $('ajax_import').hide();
   Ajax_Status_Updater = new Ajax.PeriodicalUpdater($('import_status'),
                                                      '#',
						      {parameters:{action:'import_status'}}
                                                     );
  return true;
}

function completeAjaxImport(response) {
    var r = response.evalJSON(true);

    if (r.success) {
	Controller.add_tracks(r.tracks,
			      function() { 
				  Controller.update_sections(
				  new Array(userimport_table_id,track_listing_id),
				      '',false,false)
					}
			      );
    	$('import_status').innerHTML = '';
    } else {
	var importName = r.importName;
    	var msg =  '<div style="background-color:pink">'+'<b>'+importName+'</b>: '+r.error_msg+'<br>'
    	         + '<a href="javascript:void(0)" onClick="$(\'import_status\').innerHTML=\'\'">[Remove Message]</a>'+'</div>';
    	$('import_status').innerHTML = msg;
    }

    if (Ajax_Status_Updater!=null)
	Ajax_Status_Updater.stop();
    $('import_indicator').innerHTML = '';
    $('ajax_import').remove();
    return true;
}



