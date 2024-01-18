// minioClient.js
const Minio = require('minio');
const fs = require('fs');

const MINIO_HOST = process.env.MINIO_HOST;
const MINIO_PORT = parseInt(process.env.MINIO_PORT, 10);
const MINIO_ROOT_USER = process.env.MINIO_ROOT_USER;
const MINIO_ROOT_USER_PASSWORD = fs.readFileSync(process.env.MINIO_ROOT_PASSWORD_FILE, 'utf8').trim();

const minioClient = new Minio.Client({
    endPoint: MINIO_HOST,
    port: MINIO_PORT,
    useSSL: false, // Set to true if SSL is configured
    accessKey: MINIO_ROOT_USER,
    secretKey: MINIO_ROOT_USER_PASSWORD
});

module.exports = minioClient;
