const aws = require("aws-sdk");

const BUCKET_NAME = process.env.BUCKET_NAME
const AWSAccessKeyId = process.env.AWSAccessKeyId
const AWSSecretKey = process.env.AWSSecretKey

if (process.env.NODE_ENV === 'production') {
    aws.config = new aws.Config();
    aws.config.accessKeyId = AWSAccessKeyId
    aws.config.secretAccessKey = AWSSecretKey
    aws.config.region = 'eu-central-1'
} else {
    aws.config.update({
        accessKeyId: AWSAccessKeyId,
        secretAccessKey: AWSSecretKey,
        region: 'eu-central-1'
    })
}

module.exports = {
    aws: aws,
    BUCKET_NAME: BUCKET_NAME
}