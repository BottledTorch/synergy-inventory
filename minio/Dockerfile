FROM minio/minio:RELEASE.2024-01-11T07-46-16Z-cpuv1

COPY create-bucket.sh /usr/bin/create-bucket.sh
RUN chmod +x /usr/bin/create-bucket.sh

ENTRYPOINT ["/usr/bin/create-bucket.sh"]
CMD ["server", "--console-address", ":9001", "/data"]
