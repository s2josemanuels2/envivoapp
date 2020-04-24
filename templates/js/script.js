$(document).ready(function(){
	var canvas = document.getElementById("preview");
	var ctx = canvas.getContext("2d");

	canvas.width = 800;
	canvas.height = 600;
	canvas.style.display = 'none';
	ctx.width = canvas.width;
	ctx.height = canvas.height;
	var usuario = '';
	var emoticones = [[":\\)",'&#128512;'],[":D",'&#128513;'],['xD','&#128518;'],
	['jeje','&#128513;'],['jaja','&#128514;'],['ups','&#128517;'],[';\\)','&#128521;']
	,['0:\\)','&#128519;'],['3:\\)','&#128520;'],['7u7','&#128527;'],['B\\)','&#128526;'],
	['&#60;3','&#128147;'],['&#60;\/3','&#128148;'],[':\\(','&#128532;'],[":'\\(",'&#128557;']
	,[':\\*','&#128536;']];
	do{
		usuario = prompt("Ingresa tu usuario");
	}while (usuario === null || usuario.length === 0);
	var video = document.getElementById("video");
	var muestraVideo = true;
	let context;
	let gumStream;
	let muted = false;
	let rec;
	$('#titulo').text(usuario.toUpperCase());
	var socket = io.connect('https://envivoapp.herokuapp.com/',{ 'forceNew': true });
	var socket2 = io.connect('https://envivoapp.herokuapp.com/',{ 'forceNew': true });
	//var socket = io.connect('http://localhost:8000/',{ 'forceNew': true });
	//var socket2 = io.connect('http://localhost:8000/',{ 'forceNew': true });
	socket2.on('streaming',function(data){
		if(data['user'] && data['user'] !== usuario){
			if ($('#'+data['user']).length === 0) {
				$('.usuarios').append('<div class="col-sm-4"><h2 class="titulouser">'+data['user'].toUpperCase()+'</h2><br><img width="100%" id="'+data['user']+'"></div>');
			}
			$('#'+data['user']).attr('src',data['img']);
		}
	});

	socket2.on('newmsj', function(data){
		if(data['user'] && data['user'] !== usuario){
			$('.mensajes').append('<div><div class = "msjIzq">'+data['msj']+'</div></div>');
			$('.mensajes').scrollTop($('.mensajes').prop('scrollHeight'));
		}
	});

	socket2.on('newaudio',function(data){
		if(data['user'] && data['user'] !== usuario){
			$('#audio').attr('src',data['voz']);
			$('#audio').removeAttr('muted');
			
		}
	});

	function logger(msj){
		$('#logger').text(msj);
	}
	function loadCam(stream){
		logger('Cámara conectada correctamente.');
		if (muestraVideo)
			video.srcObject = stream;
	}

	function loadFail(err){
		logger('Cámara no conectada. por favor enciendala.\n'+err);
	}

	function viewVideo(video_, ctx_){
		ctx.drawImage(video_,0,0,ctx_.width,ctx_.height);
		if (muestraVideo)
			socket.emit('stream',{'img':canvas.toDataURL('image/webp'), 'user':usuario});
	}
	function sendAudio(){
		if (!muted) {
			rec.exportWAV(sendWAVtoServer);
		}
	}
	$('#apaga').click(function(){
		if (muestraVideo) {
			muestraVideo = false;
			video.style.display = 'none';
			$(this).html("Encender webcam");
		}else{
			muestraVideo = true;
			video.style.display = '';
			$(this).html("Apagar webcam");
		}
	});
	/*
	navigator.getUserMedia = ( 
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || 
		navigator.msGetUserMedia);
	if (navigator.getUserMedia) {
		//atributos de uso, callbacks
		if(muestraVideo){
			navigator.getUserMedia({video:true},loadCam,loadFail);
			setInterval(function(){
					viewVideo(video,ctx);
			}, 70);
		}
	}*/
	
	async function getMedia(constraints) {
	  let stream = null;
	  try {
	    stream = await navigator.mediaDevices.getUserMedia(constraints);
	    context = new AudioContext();
		var microphone = context.createMediaStreamSource(stream);
		var volume = context.createGain();
		gumStream = stream;

		microphone.connect(volume);
		volume.connect(context.destination);
		volume.gain.value = 0;

		rec = new Recorder(microphone,{numChannels:1});
		//start the recording process
		rec.record();
	    if(muestraVideo){
		    loadCam(stream);
		    setInterval(function(){
				viewVideo(video,ctx);
			}, 500);
			setInterval(function(){
				sendAudio();
			}, 2000);
		}
	  } catch(err) {
	    loadFail(err);
	  }
	}
	getMedia({video:true,audio:true});
	$('#mute').click(function(){
		if(!muted){
			muted = true;
			rec.stop();
			rec.clear();
			$(this).text('Activar sonido');
		}else{
			muted = false;
			rec.record();
			$(this).text('Desactivar sonido');
		}
	});
	$('.chat').on('click','.equis',function(){
		if ($('.chat').css('height') === '30px') {
			$('.chat').css('height','350px');
			$('.equis').html('-');
		}else{
			$('.chat').css('height','30px');
			$('.equis').html('^');
		}
	});
	$('.cajaMsj').on('keypress',function(event){
		if(event.which === 13 && $(this).val().length !== 0 ){
			var aux = muestraVideo;
			muestraVideo = false;
			var texto = $(this).val().replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
		       return '&#'+i.charCodeAt(0)+';';
		    });
		    //var texto = encodedStr.replace(/&/gim, '&amp;');
		    for (var i = 0; i < emoticones.length; i++) {
		    	var re = new RegExp(emoticones[i][0],"gi");
		    	texto = texto.replace(re,emoticones[i][1]);
		    }
		    var cad = '<div style="text-align: -webkit-right;"><div class = "msjDer">'+texto+'</div></div>';
			$('.mensajes').append(cad);
			$(this).val("");
			$('.mensajes').scrollTop($('.mensajes').prop('scrollHeight'));
			socket.emit('mensaje',{'user':usuario,'msj':texto});
			muestraVideo = aux;
		}
	});
	function sendWAVtoServer(blob) {
		rec.stop();
		var url = URL.createObjectURL(blob);
		socket.emit('audio',{'voz':url,'user':usuario});
		rec.clear();
		rec.record();
	}
});