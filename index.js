var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const cors = require('cors');

const fs = require('fs');

//se importan las librerias y las credenciales 
//const mysql = require('mysql');
const aws_keys = require('./creds_template');


var corsOptions = { origin: true, optionsSuccessStatus: 200 };
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))




app.get('/', function (req, res ) {

    res.json({messaje: 'Hola Seminario'})

})

var port = 9000;
app.listen(port);
console.log("Escuchando en el puerto", port)




// se manda a llamar las credenciales de Mysql 
//const db_credentials = require('./db_creds');
//var conn = mysql.createPool(db_credentials);

//Se inicializa el sdk para menejar los servicios de AWS 
var AWS = require('aws-sdk');

//instanciamos los servicios a utilizar con sus respectivos accesos.
const s3 = new AWS.S3(aws_keys.s3);
//const ddb = new AWS.DynamoDB(aws_keys.dynamodb);
const rek = new AWS.Rekognition(aws_keys.rekognition);

const textract = new AWS.Textract(aws_keys.textract);

const sns = new AWS.SNS(aws_keys.sns);


//*********************************************ALMACENAMIENTO****************************************************
// ruta que se usa para subir una foto 
/*
app.post('/subirfoto', function (req, res) {

    var id = req.body.id;
    var foto = req.body.foto;
    //carpeta y nombre que quieran darle a la imagen

    var nombrei = "fotos/" + id + ".jpg"; // fotos -> se llama la carpeta 
    //se convierte la base64 a bytes
    let buff = new Buffer.from(foto, 'base64');



    AWS.config.update({
        region: 'us-east-1', // se coloca la region del bucket 
        accessKeyId: '',
        secretAccessKey: ''
    });

    var s3 = new AWS.S3(); // se crea una variable que pueda tener acceso a las caracteristicas de S3
    // metodo 1
    const params = {
        Bucket: "ejemplosemi",
        Key: nombrei,
        Body: buff,
        ContentType: "image"
    };
    const putResult = s3.putObject(params).promise();
    res.json({ mensaje: putResult })

});

app.post('/obtenerfoto', function (req, res) {
    var id = req.body.id;
    var nombrei = id + ".png";

    console.log(nombrei)

    AWS.config.update({
        region: 'us-east-2', // se coloca la region del bucket 
        accessKeyId: '',
        secretAccessKey: ''
    });

    var S3 = new AWS.S3();

    var getParams =
    {
        Bucket: "almacenamientofer",
        Key: nombrei
    }

    S3.getObject(getParams, function (err, data) {
        if (err) {
            res.json(error)
        } else {
            var dataBase64 = Buffer.from(data.Body).toString('base64'); //resgresar de byte a base
            res.json({ mensaje: dataBase64 })
        }

    })

});

/***************************BASE DE DATOS ************** */
///DYNAMO 
//subir foto y guardar en dynamo
/*
app.post('/saveImageInfoDDB', (req, res) => {
    let body = req.body;

    let name = body.name;
    let base64String = body.base64;
    let extension = body.extension;

    //Decodificar imagen
    let encodedImage = base64String;
    let decodedImage = Buffer.from(encodedImage, 'base64');
    let filename = `${name}.${extension}`; 

    //Parámetros para S3
    let bucketname = 'tempbucket0001';
    let folder = 'fotos/';
    let filepath = `${folder}${filename}`;
    var uploadParamsS3 = {
        Bucket: bucketname,
        Key: filepath,
        Body: decodedImage,
        ACL: 'public-read', // ACL -> LE APLICA LA POLITICA AL OBJETO QUE SE ESTA GUARDANDO
    };

    s3.upload(uploadParamsS3, function sync(err, data) {
        if (err) {
            console.log('Error uploading file:', err);
            res.send({ 'message': 's3 failed' })
        } else {
            console.log('Upload success at:', data.Location);
            ddb.putItem({
                TableName: "ejemplosemidy", // el nombre de la tabla de dynamoDB 
                Item: {
                    "id": { S: "3" },
                    "name": { S: name },
                    "location": { S: data.Location }
                }
            }, function (err, data) {
                if (err) {
                    console.log('Error saving data:', err);
                    res.send({ 'message': 'ddb failed' });
                } else {
                    console.log('Save success:', data);
                    res.send({ 'message': 'ddb success' });
                }
            });
        }
    });
})


/******************************RDS *************/
//obtener datos de la BD
/*
app.get("/getdata", async (req, res) => {
    conn.query(`SELECT * FROM ejemplo`, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

//insertar datos
app.post("/insertdata", async (req, res) => {
    let body = req.body;
    conn.query('INSERT INTO ejemplo VALUES(?,?)', [body.id, body.nombre], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});
*/
//----------------------------------- Inteligencia Artificial Rekognition ---------------------------------------


// Analizar Emociones Cara
app.post('/detectarcara', function (req, res) { 
    var imagen = req.body.imagen;
    var params = {
      /* S3Object: {
        Bucket: "mybucket", 
        Name: "mysourceimage"
      }*/
      Image: { 
        Bytes: Buffer.from(imagen, 'base64')
      },
      Attributes: ['ALL']
    };
    rek.detectFaces(params, function(err, data) {
      if (err) {res.json({mensaje: "Error"})} 
      else {   
             res.json({Deteccion: data});      
      }
    });
  });
  // Analizar texto
  app.post('/detectartexto', function (req, res) { 
    var imagen = req.body.imagen;
    var params = {
      /* S3Object: {
        Bucket: "mybucket", 
        Name: "mysourceimage"
      }*/
      Image: { 
        Bytes: Buffer.from(imagen, 'base64')
      }
    };
    rek.detectText(params, function(err, data) {
      if (err) {res.json({mensaje: "Error"})} 
      else {   
             res.json({texto: data.TextDetections});      
      }
    });
  });
  // Analizar Famoso
  app.post('/detectarfamoso', function (req, res) { 
    var imagen = req.body.imagen;
    var params = {
      /* S3Object: {
        Bucket: "mybucket", 
        Name: "mysourceimage"
      }*/
      Image: { 
        Bytes: Buffer.from(imagen, 'base64')
      }
    };
    rek.recognizeCelebrities(params, function(err, data) {
      if (err) {
        console.log(err);
        res.json({mensaje: "Error al reconocer"})} 
      else {   
             res.json({artistas: data.CelebrityFaces});      
      }
    });
  });
  // Obtener Etiquetas
  app.post('/detectaretiquetas', function (req, res) { 
    var imagen = req.body.imagen;
    var params = {
      /* S3Object: {
        Bucket: "mybucket", 
        Name: "mysourceimage"
      }*/
      Image: { 
        Bytes: Buffer.from(imagen, 'base64')
      }, 
      MaxLabels: 123
    };
    rek.detectLabels(params, function(err, data) {
      if (err) {res.json({mensaje: "Error"})} 
      else {   
             res.json({texto: data.Labels});      
      }
    });
  });
  // Comparar Fotos
  app.post('/compararfotos', function (req, res) { 
    var imagen1 = req.body.imagen1;
    var imagen2 = req.body.imagen2;
    var params = {
      
      SourceImage: {
          Bytes: Buffer.from(imagen1, 'base64')     
      }, 
      TargetImage: {
          Bytes: Buffer.from(imagen2, 'base64')    
      },
      SimilarityThreshold: '80'
      
     
    };
    rek.compareFaces(params, function(err, data) {
      if (err) {res.json({mensaje: err})} 
      else {   
             res.json({Comparacion: data.FaceMatches});      
      }
    });
  });
  
  /* -------------------------------------- Textract --------------------------------------------------*/ 

  app.post('/textract', function (req, res) {

    const bucket = 'almacenamientofer' 
    //const photo  = 'actividad21.pdf'
    var photo = req.body.archivo; 

    AWS.config.update({
      region: 'us-east-2',
      accessKeyId: '',
      secretAccessKey: ''
    });

    const textract = new AWS.Textract();

    //const client = new AWS.Rekognition();

    /*const params = {
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: photo
        },
      },
    }*/

    /*client.detectText(params, function(err, response) {
      if (err) {
        console.log(err, err.stack); // handle error if an error occurred
      } else {
        console.log(`Detected Text for: ${photo}`)
        console.log(response)
        response.TextDetections.forEach(label => {
          console.log(`Detected Text: ${label.DetectedText}`),
          console.log(`Type: ${label.Type}`),
          console.log(`ID: ${label.Id}`),
          console.log(`Parent ID: ${label.ParentId}`),
          console.log(`Confidence: ${label.Confidence}`),
          console.log(`Polygon: `)
          console.log(label.Geometry.Polygon)
        } 
        )
      } 
    });*/

    const paramstextract = {
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: photo
        },
      },
    }

    /*const params = {
      DocumentLocation: { S3Object: { Bucket: bucket, Name:  document } },
      FeatureTypes: [ 
          "TABLES" , 
          // "FORMS" 
      ],
    };*/

    textract.detectDocumentText(paramstextract, function(err, response) {
      if (err) {
        console.log(err, err.stack); // handle error if an error occurred
      } else {
        console.log(`Detected Text for: ${photo}`)
        //console.log(response)
        response.Blocks.forEach(block => {
          //console.log(`Block Type: ${block.BlockType}`),
          if(block.BlockType == "LINE"){
            console.log(`Text: ${block.Text}`)
          }   
          //console.log(`TextType: ${block.TextType}`)
          //console.log(`Confidence: ${block.Confidence}`)
    
        }) 
      } 
    });


    
    

    res.json({messaje: 'todo correcto'})

  });

  app.post('/cargar', function (req, res) {
    
    var archivo = req.body.archivo;

    uploadFile(archivo);

    res.json({messaje: 'todo correcto'})

  });
  
  const uploadFile = (fileName) => {
    // Read content from the file
    const fileContent = fs.readFileSync(fileName);

    var split = fileName.split("\\");

    var nombre = split[split.length - 1]

    console.log(nombre)

    // Setting up S3 upload parameters
    const params = {
        Bucket: "almacenamientofer",
        Key: nombre, // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
};

/* ----------------------------  AWS SNS --------------------------------- */

app.post('/suscribe', function (req, res) {
    
  let params = {
    Protocol: 'EMAIL', 
    TopicArn: req.body.topicarn,
    Endpoint: req.body.email
  };

  sns.subscribe(params, (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
        res.send(data);
    }
});

});

app.post('/send', function (req, res) {

  let now = new Date().toString();
  let email = `${req.body.message} \n \n Este mensaje fue enviado: ${now}`;
    
  let params = {
    Message: email,
    Subject: req.body.subject,
    TopicArn: req.body.topicarn,
  };

  sns.publish(params, function(err, data) {
      if (err) console.log(err, err.stack); 
      else console.log(data);

      res.send({mensaje: "email enviado"})
  });

});

app.get('/topics', function (req, res) {

  var listTopicsPromise = sns.listTopics({}).promise();

  listTopicsPromise.then(
  function(data) {
    console.log(data.Topics);

    res.send(data.Topics)

    /*for(var i=0;i < data.Topics.length;i++){
      console.log(data.Topics[i].TopicArn)
    }*/
    
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });
  
});

app.post('/createtopic', function (req, res) {

  const newtopic = sns.createTopic({Name: req.body.topicname}).promise()

  newtopic.then(
    function(data) {
      console.log(data);
  
      res.send(data)
      
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });
});
