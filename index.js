const io = require('socket.io')(process.env.PORT || 3000);

let userOnline = [];

let db_User = [
    {username: 'nhan', password: '1234'},
    {username: 'nguyen', password: '2345'},
    {username: 'thinh', password: '1345'},
    {username: 'phat', password: '2454'},
    {username: 'toan', password: '2354'},
];

io.on('connection', socket => {
    socket.on('NGUOI_DUNG_DANG_KY', user => {
        const isExist = 
            db_User.some(e => {return e.username == user.username});
        socket.peerId = user.peerId;
        if (isExist) 
        {
            return socket.emit('DANG_KY_THAT_BAI', 'username da ton tai!');
        }
        else
        {
            const new_user = {
                username: user.username,
                password: user.password
            };
            const new_Online = {
                username: user.username,
                peerId: user.peerId,
            };
            db_User.push(new_user);
            userOnline.push(new_Online);
            socket.emit('DANH_SACH_ONLINE', userOnline);
            socket.broadcast.emit('CO_NGUOI_DUNG_MOI', new_Online);
        }
    });

    socket.on('NGUOI_DUNG_DANG_NHAP', user =>{
        const isExist = db_User.some(e => {return e.username == user.username
            && e.password == user.password});
        socket.peerId = user.peerId;
        if(!isExist) 
        {
            return socket.emit('DANG_NHAP_THAT_BAI', 'thong tin dang nhap sai!');
        }
        else
        {
            const isOnline = userOnline.some(e => {return e.username == user.username});
            if(isOnline)
            {
                return socket.emit('DANG_NHAP_THAT_BAI', 'nguoi dung khac dang dang nhap!');
            }
            else
            {
                const new_Online = {
                    username: user.username,
                    peerId: user.peerId,
                };
                userOnline.push(new_Online);
                socket.emit('DANH_SACH_ONLINE', userOnline);
                socket.broadcast.emit('CO_NGUOI_DUNG_MOI', new_Online);
            }
        }
    });

    socket.on('disconnect', () => {
        const index = userOnline.findIndex(user => user.peerId == socket.peerId);
        userOnline.splice(index, 1);
        io.emit('AI_DO_NGAT_KET_NOI', socket.peerId);
    });
});


