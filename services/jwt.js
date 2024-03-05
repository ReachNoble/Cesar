var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'secret_key';

exports.createToken=function(user){
    var payload={
        sub: user.id,
        name: user.name,
        role: user.role, // Corregido: Cambiado "rol" por "role"
        status: user.status,
        image: user.image,
        iat: moment().unix(), // Corregido: Cambiado "moment.unix()" por "moment().unix()"
        exp: moment().add(30, 'minutes').unix()
    }    
    return jwt.encode(payload,secret);
}