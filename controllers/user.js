var bcrypt =require('bcrypt-nodejs');
const conn = require('mysql2');//libreria para conectar a la base de datos
var jwt = require('../services/jwt'); //importamos el servicio de token
var fs = require('fs');//manejo de archivos
var path = require('path');//rutas o ubicaciones

const conexion = conn.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "mydb",
});


module.exports={
    save(req, res) {
        const data = req.body;
        const username = data.username;
        const password = data.password;
        const email = data.email;
        const name = data.name;
        if (data.password!='' && data.password!=null) {
        bcrypt.hash(password, null, null, function (err, hash) {
            if (err) {
                return res.status(500).send({ message: "Inténtalo nuevamente." });
            }
            passwordHashed = hash;
            conexion.query(
                'INSERT INTO user (username, password, email, name) VALUES (?, ?, ?, ?)',
                [username, passwordHashed, email, name],
                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        return res.status(200).send({ message: 'Error, inténtalo más tarde.' });
                    } else {
                        return res.status(200).send({ message: 'Datos guardados.' });
                    }
                }
            );
        })
    }else{
        res.status(200).send({message:"POR FAVOR INGRESA CONTRASEÑA"})
    }           
},

list(req, res) {
    var user = req.user
    var sql = ''
    console.log(user)
    if (user.role == 'admin') {
        sql = 'SELECT * FROM user'
    } else {
        sql = 'SELECT * FROM user WHERE id=' + user.sub
    }
    console.log(req.user)
    conexion.query(sql, function (err, results, fields) {
            if (results) {
                res.status(200).send({ results })
            } else {
                res.status(500).send({ message: 'Error: intentalo mas tarde' })
            }
        }
    );
    },

listuser(req , res){
    var user = req.user
    conexion.query('SELECT * FROM user WHERE id='+user.sub,function(err,results,fields){
        if (results) {
            res.status(200).send({ data: results });
        } else {
            res.status(500).send({ message: 'Error: intentalo mas tarde' });
        }
    })
},
list_User(req , res){
    var user = req.user;
    conexion.query('SELECT * FROM user WHERE id='+user.sub,function(err,results,fields){
        if (results) {
            res.status(200).send({ data: results }); // Usar la clave 'data' en lugar de 'results'
        } else {
            res.status(500).send({ message: 'Error: intentalo mas tarde' });
        }
    });
},
    login(req,res){
        var data = req.body;
        var username = data.username;
        var password = data.password;
        var token = data.token;
        conexion.query('SELECT * FROM user WHERE username = "'+username+'" LIMIT 1',
        function(err,results,fields){
            console.log(results)
            if(results.length==1){
            if(!err){
                console.log(results);
                bcrypt.compare(password,results[0].password,function(err,check){
                    if(check){
                        if(token){
                            res.status(200).send({message:'Bienvendido a la app de musica',token:jwt.createToken(results[0])})
                        }else{
                            res.status(200).send({message:'Datos incorrectos'})
                        }
                        
                    }else{
                        res.status(200).send({message:'Datos incorrectos'})
                    }
                })
            }else{
                res.status(500).send({message:"Intentalo mas tarde"})
            }
        }else{
            res.status(200).send({message:"Todos los campos son requeridos"})
        }
        }
        );
    },

    delete(req, res) {
        const userId = req.params.id;
        const requestingUserId = req.user.id; // Supongamos que tienes el ID del usuario que hace la solicitud en req.user.id
        const requestingUserRole = req.user.role; // Supongamos que tienes el rol del usuario que hace la solicitud en req.user.role
    
        if (requestingUserRole === 'admin') {
            conexion.query('DELETE FROM user WHERE id =' + userId, function (err, results, fields) {
                if (!err) {
                    if (results.affectedRows != 0) {
                        res.status(200).send({ message: "Registro eliminado" });
                    } else {
                        res.status(200).send({ message: "No se eliminó ningún registro" });
                    }
                } else {
                    console.log(err);
                    res.status(500).send({ message: "Inténtalo más tarde" });
                }
            });
        } else if (parseInt(userId) === requestingUserId) {
            conexion.query('DELETE FROM user WHERE id =' + userId, function (err, results, fields) {
                if (!err) {
                    if (results.affectedRows != 0) {
                        res.status(200).send({ message: "Registro eliminado" });
                    } else {
                        res.status(200).send({ message: "No se eliminó ningún registro" });
                    }
                } else {
                    console.log(err);
                    res.status(500).send({ message: "Inténtalo más tarde" });
                }
            });
        } else {
            res.status(403).send({ message: "No tienes permiso para eliminar este perfil" });
        }
    },
    

    update(req, res) {
        const userId = req.params.id;
        const requestData = req.body;
        const requestingUserId = req.user.id; // Supongamos que tienes el ID del usuario que hace la solicitud en req.user.id
        const requestingUserRole = req.user.role; // Supongamos que tienes el rol del usuario que hace la solicitud en req.user.role
        // Construir la consulta SQL
        let sql = 'UPDATE user SET ? WHERE id=?';
        if (requestData.password) {
            bcrypt.hash(requestData.password, null, null, function (err, hash) {
                if (!err) {
                    requestData.password = hash;
                    executeUpdateQuery();
                }
            });
        } else {
            executeUpdateQuery();
        }
        function executeUpdateQuery() {
            if (requestingUserRole === 'admin') {
                conexion.query(sql, [requestData, userId], function (err, results, fields) {
                    if (!err) {
                        console.log(results);
                        res.status(200).send({ message: "Perfil actualizado" });
                    } else {
                        console.log(err);
                        res.status(500).send({ message: "Inténtalo más tarde" });
                    }
                });
            } else if (parseInt(userId) === requestingUserId) {
                conexion.query(sql, [requestData, userId], function (err, results, fields) {
                    if (!err) {
                        console.log(results);
                        res.status(200).send({ message: "Perfil actualizado" });
                    } else {
                        console.log(err);
                        res.status(500).send({ message: "Inténtalo más tarde" });
                    }
                });
            } else {
                res.status(403).send({ message: "No tienes permiso para actualizar este perfil" });
            }
        }
    },
    










    uploadImage(req, res){
        var id = req.params.id;
        var file = 'Sin imagen...';
        if (req.files) {
            var file_path = req.files.image.path;
            var file_split = file_path.split('\\'); 
            var file_name = file_split[2]; 
            var ext = file_name.split('\.');
            var file_ext = ext[1];
            if (file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'jpeg'||file_ext=='png') { 
                conexion.query('UPDATE user SET imagen="' + file_name + '" WHERE id=' + id, 
                function (err, results, fields) {
                    if (!err) {
                        if (results.affectedRows !== 0) {
                            res.status(200).send({ message: 'Imagen actualizada' });
                        } else {
                            res.status(200).send({ message: 'Imagen NO actualizada' });
                        }
                    } else {
                        console.log(err);
                        res.status(500).send({ message: 'Inténtalo más tarde' }); 
                    }
                }); 
            } else {
                res.status(400).send({ message: 'Error de extensión' }); 
            }
        }
    },


 




    getImage(req,res){
        var image = req.params.image;
        var path_file='./uploads/users/'+image;
        console.log(path_file);
        if(fs.existsSync(path_file)){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(404).send({message:'No existe el archivo'})
        }
    },










// sincronas y asincronas unlinksync
// hacer la actualizacion de null cuando se borre la imagen
delImage(req, res) {
    const id = req.params.id;
    const sql = "SELECT imagen FROM user WHERE id=" + id;

    conexion.query(sql, function (err, results, fields) {
        if (!err) {
            if (results.length !== 0) {
                if (results[0].imagen !== null) {
                    const path_file = './uploads/users/' + results[0].imagen;
                    try {
                        fs.unlinkSync(path_file);
                        // Actualizar la tabla estableciendo la columna "imagen" a null
                        const updateSql = "UPDATE user SET imagen = null WHERE id=" + id;
                        conexion.query(updateSql, function (updateErr, updateResults, updateFields) {
                            if (!updateErr) {
                                res.status(200).send({ message: 'Imagen eliminada y tabla actualizada' });
                            } else {
                                console.error(updateErr);
                                res.status(500).send({ message: 'Error al actualizar la tabla' });
                            }
                        });
                    } catch (error) {
                        console.error(error);
                        res.status(500).send({ message: 'Imagen NO eliminada' });
                    }
                } else {
                    res.status(404).send({ message: 'No encontrada' });
                }
            } else {
                res.status(404).send({ message: 'No encontrada' });
            }
        } else {
            console.log(err);
            res.status(500).send({ message: 'No se pudo eliminar. Intenta más tarde' });
        }
    });
}

}
