$(document).ready(function(){
	var canvas = document.getElementById("preview");
	var ctx = canvas.getContext("2d");

	canvas.width = 800;
	canvas.height = 600;
	canvas.style.display = 'none';
	ctx.width = canvas.width;
	ctx.height = canvas.height;
	var usuario = prompt("Ingresa tu usuario");
	var video = document.getElementById("video");

	var socket = io.connect('http://127.0.0.1:8000',{ 'forceNew': true });
	var socket2 = io.connect('http://127.0.0.1:8000',{ 'forceNew': true });

	socket2.on('streaming',function(data){
		if(data['user'] !== usuario){
			if ($('#'+data['user']).length === 0) {
				$('body').append('<img id="'+data['user']+'" width="400px" height="400px">');
			}
			
			$('#'+data['user']).attr('src',data['img']);
		}
	});

	function logger(msj){
		$('#logger').text(msj);
	}
	function loadCam(stream){
		logger('Cámara conectada correctamente.');
		video.srcObject = stream;
	}

	function loadFail(){
		logger('Cámara no conectada. por favor enciendala.');
	}

	function viewVideo(video_, ctx_){
		ctx.drawImage(video_,0,0,ctx_.width,ctx_.height);
		socket.emit('stream',{'img':canvas.toDataURL('image/webp'), 'user':usuario});
	}

	navigator.getUserMedia = (navigator.getUserMedia ||
	 navigator.webkitGetUserMedia || 
	 navigator.mozGetUserMedia || 
	 navigator.msgGetUserMedia);

	if (navigator.getUserMedia) {
		//atributos de uso, callbacks
		navigator.getUserMedia({video:true},loadCam,loadFail);
		setInterval(function(){
			viewVideo(video,ctx);
		}, 70);
	}
	//var socket2 = io.connect('http://127.0.0.1:8000');
});