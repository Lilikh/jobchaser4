const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;

require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASSWORD)}@chas-job.kqazivx.mongodb.net/?retryWrites=true&w=majority&appName=Chas-Job`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db("chasJob");
    const jobsCollections = db.collection("demoJobs");

    // Post a job
    app.post("/post-job", async (req, res) => {
      const body = req.body;
      body.createAt = new Date();
      const result = await jobsCollections.insertOne(body);
      if (result.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "Cannot insert! Try again later!",
          status: false
        });
      }
    });

    // Get all jobs
    app.get("/all-jobs", async (req, res) => {
      const jobs = await jobsCollections.find({}).toArray();
      res.send(jobs);
    });


    //get jobs by email

    app.get("/myJobs/:email", async(req,res)=>{
     /*  console.log(req.params.email); */
       const jobs= await jobsCollections.find({
        postedBy : req.params.email}).toArray();
        res.send(jobs);
    }) 

    /* Delete a job */

    app.delete("/job/:id", async(req,res)=>{
      const id=req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result=await jobsCollections.deleteOne(filter);
      res.send(result)
    })

    // Ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

process.on('SIGINT', async () => {
  await client.close();
  console.log("MongoClient closed.");
  process.exit(0);
});
