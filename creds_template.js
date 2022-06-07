let aws_keys = {
    s3: {
        region: 'us-east-2',
        accessKeyId: "",
        secretAccessKey: "" 
    },
    dynamodb: {
        apiVersion: '2012-08-10',
        region: 'us-east-2',
        accessKeyId: "",
        secretAccessKey: ""
    },
    rekognition: {
        region: 'us-east-1',
        accessKeyId: "",
        secretAccessKey: "" 
    },
    translate: {
        region: '',
        accessKeyId: "",
        secretAccessKey: "" 
    },
    cognito:{
        UserPoolId: '',
        ClientId: ''
    },

    textract: {
        region: 'us-east-2',
        accessKeyId: "",
        secretAccessKey: "" 
    },

    sns: {
        region: 'us-east-1',
        accessKeyId: "",
        secretAccessKey: "" 
    },
}

module.exports = aws_keys