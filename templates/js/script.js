$(document).ready(function(){
	var canvas = document.getElementById("preview");
	var ctx = canvas.getContext("2d");

	canvas.width = 800;
	canvas.height = 600;
	canvas.style.display = 'none';
	ctx.width = canvas.width;
	ctx.height = canvas.height;
	var usuario;
	do{
		usuario = prompt("Ingresa tu usuario");
	}while (usuario.length === 0);
	var video = document.getElementById("video");
	var muestraVideo = true;
	$('#titulo').text(usuario.toUpperCase());
	//var socket = io.connect('https://envivoapp.herokuapp.com/',{ 'forceNew': true });
	//var socket2 = io.connect('https://envivoapp.herokuapp.com/',{ 'forceNew': true });
	var socket = io.connect('http://localhost:8000/',{ 'forceNew': true });
	var socket2 = io.connect('http://localhost:8000/',{ 'forceNew': true });
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

	function logger(msj){
		$('#logger').text(msj);
	}
	function loadCam(stream){
		logger('Cámara conectada correctamente.');
		if (muestraVideo)
			video.srcObject = stream;
	}

	function loadFail(){
		logger('Cámara no conectada. por favor enciendala.');
	}

	function viewVideo(video_, ctx_){
		ctx.drawImage(video_,0,0,ctx_.width,ctx_.height);
		if (muestraVideo)
			socket.emit('stream',{'img':canvas.toDataURL('image/webp'), 'user':usuario});
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
	    if(muestraVideo){
		    loadCam(stream);
		    setInterval(function(){
				viewVideo(video,ctx);
			}, 70);
		}
	  } catch(err) {
	    loadFail();
	  }
	}
	getMedia({video:true});

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
			muestraVideo = false;
			$('.mensajes').append('<div style="text-align: -webkit-right;"><div class = "msjDer">'+$(this).val()+'</div></div>');
			var texto = $(this).val();
			$(this).val("");
			$('.mensajes').scrollTop($('.mensajes').prop('scrollHeight'));
			socket.emit('mensaje',{'user':usuario,'msj':texto});
			muestraVideo = true;
		}
	});
});