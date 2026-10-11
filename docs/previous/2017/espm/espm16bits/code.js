$(document).ready(function(){

	var wordSize = 16;
	var maxAddr = Math.pow(16, (wordSize / 8) * 2 - 1);
	var instructions = [
		["JMP"],
		["JZ"],
		["JNZ"],
		["LV"],
		["ADD"],
		["SUB"],
		["MUL"],
		["DIV"],
		["LOAD"],
		["STOR"],
		["SC"],
		["RS"],
		["END"],
		["IN"],
		["OUT"],
		["NOP"]
	];
	var stack = [];

	$('#btnReset').click(function() { reset(); });
	$('#btnNextStep').click(function() { computeCycle(); });
	$('#btnCode').click(function() { code(); });

	var openHelp = true;
	$("#help").click(function() {
		$(this).animate({
			width : openHelp ? '24px' : '440px'
		}, 500);
		$("#help-text").css("display", openHelp ? "none" : "block");

		openHelp = !openHelp;
	});

	function init()
	{
		$('#version').html(document.lastModified);

		$('#program').empty();
		for (var i = 0; i < maxAddr; i += (wordSize / 8))
		{
			var addr = formatHex(i);

			var inputAddress = document.createElement('input');
			inputAddress.value = '0x' + addr.substring(1, addr.length);
			$(inputAddress).attr('tabindex', -1);
			$(inputAddress).attr('readonly', true);
			$(inputAddress).addClass('codeAddress');

			var inputMnemonic = document.createElement('input');
			$(inputMnemonic).addClass('codeMnemonic');
			$(inputMnemonic).on('change', function(event) {
				codeTransform($(this).parent()[0]);
			});

			var inputAssembly = document.createElement('input');
			$(inputAssembly).attr('tabindex', -1);
			$(inputAssembly).attr('readonly', true);
			$(inputAssembly).addClass('codeAssembly');

			var inputArea = document.createElement('div');
			inputArea.appendChild(inputAddress);
			inputArea.appendChild(inputMnemonic);
			inputArea.appendChild(inputAssembly);
			inputArea.id = addr;

			$(inputArea).addClass('codeLine');
			$(inputArea).appendTo('#program');

		}
	}

	function codeTransform(inputArea)
	{
		var from = $(inputArea).find(".codeMnemonic")[0];
		var to = $(inputArea).find(".codeAssembly")[0];

		var value = from.value.trim().toUpperCase();
		from.value = value;

		if (value.length == 0)
		{
			$(from).removeClass('fieldError');
			to.value = '';
			return;
		}
		if (!isValidMnemonic(value))
		{
			$(from).addClass('fieldError');
			to.value = '';
			return;
		}
		$(from).removeClass('fieldError');
		to.value = toAssembly(value);
	}

	function isValidMnemonic(value)
	{
		value = value.trim();
		if (value.length == 0) return false; 
		var parts = value.split(" ");
		var inst = getInstruction(parts[0]);
		return (inst == -1  && parts.length == 1 && isValidNumber(parts[0]))
		    || ((inst != 11 && inst != 12 && inst != 15) && parts.length == 2 && isValidAddress(parts[1]))
		    || ((inst == 11 || inst == 12 || inst == 15) && parts.length == 1);
	}

	function isValidAddress(value)
	{
		return value.length == 3;
	}

	function isValidNumber(value)
	{
		return value.length == 4;
	}

	function toAssembly(value)
	{
		var parts = value.split(" ");
		if (parts.length == 1 && isValidNumber(parts[0]))
		{
			return parts[0];
		}
		var inst = getInstruction(parts[0]);
		if (inst == -1)
		{
			return "ERROR";
		}
		switch (inst) {
			case 11:
			case 12:
			case 15: return Number(inst).toString(16).toUpperCase() + "000";
		}
		return Number(inst).toString(16).toUpperCase() + parts[1];
	}

	function getInstruction(mnemonic)
	{
		for (var i = 0; i < instructions.length; i++)
		{
			if (instructions[i][0] == mnemonic)
			{
				return i;
			}
		}
		return -1;
	}

	function readPosition(position)
	{
		return $($('#' + position).find('.codeAssembly')[0]).val();
	}

	function writePosition(position, value)
	{
		$($('#' + position).find('.codeMnemonic')[0]).val(value);
		$($('#' + position).find('.codeAssembly')[0]).val(value);
	}

	function reset()
	{
		$('#cycle').val( "0" );
		$('#reg_mdr').val( "" );
		$('#reg_ir').val( "" );
		$('#reg_op').val( "" );
		$('#reg_oi').val( "" );
		$('#reg_ra').val( "" );
		var ac = Number(Math.floor(Math.random() * Math.pow(16, 4))).toString(16).toUpperCase();
		ac = ac.length == 4 ? ac : ac.length == 3 ? "0" + ac : ac.length == 2 ? "00" + ac : "000" + ac;
		$('#reg_ac').val( ac );
		$('#reg_mar').val( "" );
		$('#reg_ic').val( "0000" );
	}

	function compute()
	{
		while (compute())
		{
		}
	}

	function computeCycle()
	{
		$('.codeLine').removeClass('codeHeader');

		var ic = $('#reg_ic').val();
		var mdr = readPosition( ic );
		var ir = mdr;
		var op = ir.substring(0, 1);
		var oi = ir.substring(1, 4);
		var ra = $('#reg_ic').val();
		var mar = $('#reg_mar').val();
		var ac = $('#reg_ac').val();

		$('#reg_mdr').val( mdr );
		$('#reg_ir').val( ir );
		$('#reg_op').val( op );
		$('#reg_oi').val( oi );
		$('#reg_ra').val( ra );

		$('#cycle').val( parseInt($('#cycle').val()) + 1 );

		$('#' + ic).addClass('codeHeader');

		switch( parseInt(op, 16) ) {
			case 0: // JMP
			{
				ic = "0" + oi;
				break;
			}
			case 1: // JZ
			{
				ic = parseInt( ac, 16 ) == 0
				   ? "0" + oi
				   : increaseIC( ic );
				break;
			}
			case 2: // JNZ
			{
				ic = parseInt( ac, 16 ) != 0
				   ? "0" + oi
				   : increaseIC( ic );
				break;
			}
			case 3: // LV
			{	
				ac = oi;
				ic = increaseIC( ic );
				break;
			}
			case 4: // ADD
			{
				var v = parseInt( readPosition( "0" + oi ), 16 );
				var r = parseInt( ac, 16 ) + v;
				ac = formatHex(r);
				ic = increaseIC( ic );
				break;
			}
			case 5: // SUB
			{
				var v = parseInt( readPosition( "0" + oi ), 16 );
				var r = parseInt( ac, 16 ) - v;
				ac = formatHex(r);
				ic = increaseIC( ic );
				break;
			}
			case 6: // MUL
			{
				var v = parseInt( readPosition( "0" + oi ), 16 );
				var r = parseInt( ac, 16 ) * v;
				ac = formatHex(r);
				ic = increaseIC( ic );
				break;
			}
			case 7: // DIV
			{
				var v = parseInt( readPosition( "0" + oi ), 16 );
				var r = Math.floor(parseInt( ac, 16 ) / v);
				ac = formatHex(r);
				ic = increaseIC( ic );
				break;
			}
			case 8: // LOAD
			{
				ac = readPosition( "0" + oi );
				ic = increaseIC( ic );
				break;
			}
			case 9: // STOR
			{
				mar = "0" + oi; 
				writePosition( "0" + oi, ac );
				ic = increaseIC( ic );
				break;
			}
			case 10: // SC
			{
				stack.push(ic);
				ic = "0" + oi;
				break;
			}
			case 11: // RS
			{
				ic = increaseIC( stack.pop() );
				break;
			}
			case 12: // END
			{
				return false;
			}
			case 13: // IN
			{
				ac = formatHex(prompt("Entre com um valor (hexadecimal)", ""));
				ic = increaseIC( ic );
				break;
			}
			case 14: // OUT
			{
				alert(ac);
				ic = increaseIC( ic );
				break;
			}
			case 15: // NOP
			{
				ic = increaseIC( ic );
				break;
			}
		}

		$('#reg_ac').val( ac );
		$('#reg_mar').val( mar );
		$('#reg_ic').val( ic );
		return true;
	}

	function increaseIC( ic )
	{
		return formatHex(parseInt( ic, 16 ) + (wordSize/8));
	}

	function formatHex( value )
	{
		var pos = Number(value).toString(16).toUpperCase();
		var l = pos.length;
		for (var i = 0; i < ((wordSize/4) - l); i++) {
			pos = "0" + pos;
		}
		return pos;
	}

	function code()
	{
		$('#dialog-code-download').empty();
		var textArea = $('<textarea spellcheck="false" style="resize:none;position:absolute;left:0;width:100%;bottom:0;top:0;"/>');
		for (var i = 0; i < maxAddr; i += (wordSize / 8))
		{
			var addr = formatHex(i);
			var val  = readPosition(addr);
			if (val.length > 0) {
				addr = addr.substring(1, addr.length);
				var line = "0x" + addr + "   " + val + "\n";
				textArea.val(textArea.val() + line);
			}
		}
		$('#dialog-code-download').append(textArea);
		$('#dialog-code-download').dialog({
			title: 'Código',
			autoOpen: true,
			resizable: false,
			width:"350",
			height:400,
			modal: true,
			buttons: {
				"Carregar": function() {
					load(textArea.val());
				},
				"Copiar": function() {
					textArea.focus();
					textArea.select();
					document.execCommand("copy");
				}
			}
		});
	}

	function load(code)
	{
		var lines = code.split("\n");
		for (var i = 0; i < lines.length; i++)
		{
			var parts = lines[i].split(" ").filter(function(el) {return el.length != 0});
			if (parts.length >= 2) {
				var addr  = parts[0].trim();
				var value = parts[1].trim();
				var h = addr.indexOf('x');
				if (h >= 0) {
					addr = addr.substring(h + 1, addr.length);
				}
				addr = formatHex( parseInt( addr, 16 ) );
				writePosition( addr, value );
			}
		}
	}

	init();
	reset();

});

