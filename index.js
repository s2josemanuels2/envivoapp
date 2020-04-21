var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8000;

app.use(express.static('templates'));

app.get('/', function(req, res) {
	res.redirect('index.html');
});

io.on('connection',function(socket){
	console.log('nuevo usuario');
	socket.on('stream',function(data){
		socket.broadcast.emit('streaming',data);
	});

	socket.on('mensaje',function(data){
		socket.broadcast.emit('newmsj',data);
	});
});

http.listen(port,function(){
	console.log('Servidor corriendo');
});
