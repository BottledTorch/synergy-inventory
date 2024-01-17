FROM minio/minio:latest

COPY create-bucket.sh /usr/bin/create-bucket.sh
RUN chmod +x /usr/bin/create-bucket.sh

ENTRYPOINT ["/usr/bin/create-bucket.sh"]
CMD ["server", "--console-address", ":9001", "/data"]
