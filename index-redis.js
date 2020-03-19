require('dotenv').config()
var redis = require('mqemitter-redis')
var aedesPersistenceRedis = require('aedes-persistence-redis');

// set mq
var mq = redis({
    port: process.env.REDIS_PORT,   // Redis port
    host: process.env.REDIS_HOST,   // Redis host
    db: process.env.REDIS_DATABASE,
    password: process.env.REDIS_PASSWORD,
})

// set persistence
var persistence = aedesPersistenceRedis({
    port: process.env.REDIS_PORT,   // Redis port
    host: process.env.REDIS_HOST,   // Redis host
    family: 4,           // 4 (IPv4) or 6 (IPv6)
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DATABASE,
    maxSessionDelivery: 100, // maximum offline messages deliverable on client CONNECT, default is 1000
    packetTTL: function (packet) { // offline message TTL, default is disabled
        return 10 //seconds
    }
})

var aedes = require('aedes')({
    mq,
    persistence
})

//  authenticate user / password
aedes.authenticate = function (client, username, password, callback) {
    var authorized = (username == 'mqtt' && password.toString() == 'password');
    if (authorized) client.user = username;
    callback(null, authorized);
}

// create server
var server = require('net').createServer(aedes.handle)
server.listen(1883, function () {
    console.log('start Mqtt with Redis Persistance!')
    aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
})

aedes.on('clientError', function (client, err) {
    console.log('client error', client.id, err.message, err.stack)
})

aedes.on('connectionError', function (client, err) {
    console.log('client error', client, err.message, err.stack)
})

aedes.on('publish', function (packet, client) {
    if (client) {
        console.log('message from client', client.id)
    }
    switch (packet.topic) {
        case 'test':
            return console.log('test get : ' + packet.payload.toString())
    }
})

aedes.on('subscribe', function (subscriptions, client) {
    if (client) {
        console.log('subscribe from client', subscriptions, client.id)
    }
})

aedes.on('client', function (client) {
    console.log('new client', client.id)
})