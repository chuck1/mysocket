
var hot = null;
var csrftoken = null;

function replaceTag(tag) {
	var tagsToReplace = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	};
	console.log('replaceTag',tag);
	return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str) {
	console.log('safe_tags_replace',str);
	return str.replace(/[&<>]/g, replaceTag);
}

function customRenderer (instance, td, row, col, prop, value, cellProperties) {
	console.log('customRenderer');
	console.log('  value      ',value);
	console.log('  value type ',typeof value);
	if(typeof value == 'string') {
		var j = JSON.parse(value);
		console.log('  object     ',j);
		//var escaped = Handsontable.helper.stringify(j[1]);
		//var escaped = escape(j[1]);
		//var escaped = j[1];
		var escaped = safe_tags_replace(j[1]);
		console.log('  escaped    ',escaped);
		td.innerHTML = escaped;
     	} else if(value == null) {
		// encountered when dragging to create new rows
     		td.innerHTML = '';
	} else {
		td.innerHTML = value[0];
	}

	//Handsontable.renderers.TextRenderer.apply(this, arguments);
}

function apply_data(data_new) {
	console.log(data_new.cells);

	data.splice(0,data.length);

	data_new.cells.forEach(function(c){
			data.push(c);
			});

	hot.render();
}
function apply_sheet_data(data_new) {
	console.log(data_new);
        apply_data(data_new);
        $("#script").val(data_new.script);
        $("#script_output").val(data_new.script_output);
}

function add_column() {
	var post_data = {
		"sheet_key": sheet_key,
		'i': null, 
		'csrfmiddlewaretoken': csrftoken
	};
	$.post(url_add_column, post_data, apply_data);
}
function add_row() {
	var post_data = {
		"sheet_key": sheet_key,
		'i': null, 
		'csrfmiddlewaretoken': csrftoken
	};
	$.post(url_add_row, post_data, apply_data);
}
function set_script_pre() {
	var text = $("#script").val();
        var post_data = {'text':text, 'csrfmiddlewaretoken':csrftoken};
	$.post(url_set_exec, post_data, apply_sheet_data);
}
function sheet_page_load() {

	csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();

	var container = document.getElementById('tablediv');

	var hooks = Handsontable.hooks.getRegistered();

	console.log(hooks);

	hot = new Handsontable(container, {
		data: data,
		rowHeaders: true,
		colHeaders: true,
		cells: function (row, col, prop) {
			this.renderer = customRenderer;
		}
		//columns: [{renderer:customRenderer}]
	});

	hot.addHook('afterBeginEditingTEST', function() {
		console.log('onBeginEditing -----------------------');
	});
	hot.addHook('modifyData', function() {
		if(arguments[3] == 'set') {
			console.log('modifyData -----------------------');
			console.log(arguments);
			var o = arguments[2];
			o.value = JSON.stringify([o.value,'']);
		}
	});
	hot.addHook('afterSetDataAtCell', function() {
		console.log('afterSetDataAtCell -----------------------');
	});
	hot.addHook('beforeValidate', function() {
		console.log('beforeValidate -----------------------');
	});
	hot.addHook('afterValidate', function() {
		console.log('afterValidate -----------------------');
	});

	hot.addHook('afterBeginEditing', function() {
		console.log('afterBeginEditing ------------------------');
		//console.log(arguments);
		r = arguments[0];
		c = arguments[1];
		d = data[r][c];
		//console.log(d);
		//data[r][c] = 'hello';
		//hot.render();
	});

	hot.addHook('afterChange', function() {
		console.log('afterChange ------------------------');
		arguments[0].forEach(function(args) {
			console.log(args);

			var post_data = {
				"sheet_key": sheet_key,
				'csrfmiddlewaretoken': csrftoken,
				'r': args[0],
				'c': args[1],
				's': args[3]
			};

			$.post(url_set_cell, post_data, apply_data);
		});
	});
}
