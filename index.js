const socket = io('http://localhost:3000');

$('#div-chat').hide();

// let customConfig;

// $.ajax({
//   url: "https://service.xirsys.com/ice",
//   data: {
//     ident: "vanpho",
//     secret: "2b1c2dfe-4374-11e7-bd72-5a790223a9ce",
//     domain: "vanpho93.github.io",
//     application: "default",
//     room: "default",
//     secure: 1
//   },
//   success: function (data, status) {
//     // data.d is where the iceServers object lives
//     customConfig = data.d;
//     console.log(customConfig);
//   },
//   async: false
// });

socket.on('DANH_SACH_ONLINE', userOnline => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();
    $('#div-dang-nhap').hide();

    userOnline.forEach(user => {
        const { username, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${username}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const { username, peerId } = user;
        userOnline.push(user);
        $('#ulUser').append(`<li id="${peerId}">${username}</li>`);
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        const index = userOnline.findIndex(user => user.peerId === socket.peerId);
        userOnline.splice(index, 1);
        $(`#${peerId}`).remove();
    });

    peer.on('connection', function(conn){
        const username = userOnline.find(e=>e.peerId == conn.peer).username;
        conn.on('data',function(data){
            $('#chat-box').append(`<div style="clear: both; float: left; background-color: gray; margin: 2px;
            border-radius: 4px;">${username}: ${data}</div>`)
        });  
    });
});

socket.on('DANG_KY_THAT_BAI', (warning) => alert(warning));

socket.on('DANG_NHAP_THAT_BAI', (warning) => alert(warning));

// function openStream() {
//     const config = { audio: false, video: true };
//     return navigator.mediaDevices.getUserMedia(config);
// }

// function playStream(idVideoTag, stream) {
//     const video = document.getElementById(idVideoTag);
//     video.srcObject = stream;
//     video.play();
// }

// openStream()
// .then(stream => playStream('localStream', stream));

const peer = new Peer();

peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername-dangky').val();
        const password = $('#txtPassword-dangky').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { username: username, password: password, peerId: id });
    });
    $('#btnLogin').click(() => {
        const username = $('#txtUsername-dangnhap').val();
        const password = $('#txtPassword-dangnhap').val();
        socket.emit('NGUOI_DUNG_DANG_NHAP', { username: username, password: password, peerId: id });
    });
});

//Caller
// $('#btnCall').click(() => {
//     const id = $('#remoteId').val();
//     openStream()
//     .then(stream => {
//         playStream('localStream', stream);
//         const call = peer.call(id, stream);
//         call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
//     });
// });

// //Callee
// peer.on('call', call => {
//     openStream()
//     .then(stream => {
//         call.answer(stream);
//         playStream('localStream', stream);
//         call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
//     });
// });

// $('#ulUser').on('click', 'li', function() {
//     const id = $(this).attr('id');
//     console.log(id);
//     openStream()
//     .then(stream => {
//         playStream('localStream', stream);
//         const call = peer.call(id, stream);
//         call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
//     });
// });
$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    const username = $(this).text();
    
    var conn = peer.connect(id);
        // on open will be launch when you successfully connect to PeerServer
    conn.on('open', function(){
        console.log(peer.connections);
        document.getElementById('chat-to').innerText='Chat with: '+username;
        console.log('connect to: '+ username);
        // here you have conn.id
        $('#send').click(()=>{
            if(conn.open)
            {
                const mess=$('#messages').val();
                $('#chat-box').append(`<div style="clear: both; float: right; background-color: green; margin: 2px; border-radius: 4px;">you: ${mess}</div>`)
                conn.send(mess);
            }
        });
        $('#ulUser').on('click', 'li', function(){
            conn.close();
            console.log(conn);
        });
        $('#file').input(function(e){
            console.log(e.target.files);
            var file = e.target.files[0];
            var blob = new Blob(event.target.files, {type: file.type});

            this.state.conn.send({
                file: blob,
                filename: file.name,
                filetype: file.type
            });
        });
    });
});


