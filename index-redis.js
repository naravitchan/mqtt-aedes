require('dotenv').config()
var redis = require('mqemitter-redis')
var aedesPersistenceRedis = require('aedes-persistence-redis');

var mq = redis({
    port: process.env.REDIS_PORT,   // Redis port
    host: process.env.REDIS_HOST,   // Redis host
    db: process.env.REDIS_DATABASE,
    password: process.env.REDIS_PASSWORD,
})

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

console.log(process.env.REDIS_PORT);

var aedes = require('aedes')({
    mq,
    persistence
})

var server = require('net').createServer(aedes.handle)

server.listen(1883, function () {
    console.log('start Mqtt with Redis Persistance!')
    // aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
})