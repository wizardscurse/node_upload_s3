const AWS = require("aws-sdk");
const Fastify = require("fastify");

const fastify = Fastify({
  logger: true,
});
fastify.register(require("@fastify/multipart"));
// Declare a route
fastify.post("/", async (request, reply) => {
  const data = await request.file();
  const file = data.file;
  const s3 = new AWS.S3({
    s3ForcePathStyle: true,
    accessKeyId: "S3RVER",
    secretAccessKey: "S3RVER",
    endpoint: new AWS.Endpoint("http://localhost:4569"),
  });
  const bucketName = "local-bucket";
  const bucketFolder = "local/config";
  const filename = data.filename;
  const path = `${bucketFolder}/${filename}`;

  try {
    const base64file = file.toBuffer ? await file.toBuffer() : file;
    s3.upload(
      {
        Bucket: bucketName,
        Key: path,
        Body: base64file,
      },
      (err, data) => {
        let response = data;

        if (err !== null) {
          response = {
            error: true,
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
          };
        }

        reply.send(response);
      }
    );
  } catch (error) {
    reply.send(error);
  }
});

const start = async () => {
  try {
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
