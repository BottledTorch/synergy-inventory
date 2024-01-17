#!/bin/bash

# Start MinIO server in the background
minio server --console-address ":9001" /data &

# Wait for MinIO server to start
sleep 10

# Set up MinIO Client (mc) configuration
mc alias set minio http://localhost:9000 minioadmin $(cat /run/secrets/minio_password)

# Create the bucket if it doesn't exist
if ! mc ls minio | grep -q 'itemimages'; then
    mc mb minio/itemimages
fi

# Set the bucket policy to allow anonymous read and write access
mc anonymous set public minio/itemimages

# Check if the secret file exists
if [ -f /run/secrets/synergy_user_password ]; then
    synergy_password=$(cat /run/secrets/synergy_user_password)

    # Create the 'synergy' user with the password from the secret
    mc admin user add minio synergy $synergy_password
else
    echo "Secret file for synergy user password not found."
fi

# Keep the script running to keep the container alive
wait
