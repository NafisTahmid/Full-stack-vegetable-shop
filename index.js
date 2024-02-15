const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express()
require('dotenv').config()
// console.log(process.env)

const userName = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())




// const uri = "mongodb+srv://vegetableSeller: 71RpiEJsWQ9SKqMq@cluster0.jhrlqq5.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${userName}:${password}@cluster0.jhrlqq5.mongodb.net/VegetableShop?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
 
}
);


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("VegetableShop").command({ ping: 1 });
    const vegetableCollection = client.db("VegetableShop").collection("vegetables");
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html')
    
    })

    // POST - (Create)
    app.post('/addVegetable', (req, res) => {
      const vegetable = req.body; 
      // console.log(vegetable)
      vegetableCollection.insertOne(vegetable)
      .then(result => {
        result.acknowledged === true & res.redirect('/');
    })
  })

  // GET - (Read)
  // app.get('/vegetables', (req, res) => {
  //     vegetableCollection.find({}).toArray((err, vegetables) => {
  //       err && console.log(err);
  //       res.send(vegetables);
  //     })

  // })

  app.get('/vegetables', async (req, res) => {
    try {
      const vegetables = await vegetableCollection.find({}).toArray();
      res.send(vegetables);
    } catch (error) {
      console.error('Error fetching vegetables:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // GET By Id
  app.get('/vegetable/:id', async (req, res) => {
    try {
      const id = isNaN(req.params.id) ? req.params.id : parseInt(req.params.id);
      const query = isNaN(id) ? { _id: new ObjectId(id) } : { _id: id };
      const vegetable = await vegetableCollection.findOne(query);
      if (!vegetable) {
        res.status(404).send('Vegetable not found');
        return;
      }

      res.json(vegetable);
    } catch (error) {
      console.error('Error fetching vegetable by ID:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // UPDATE - (update)
  app.patch('/update/:id', (req, res) => {
    const id = new ObjectId(req.params.id);
    const { name, price, quantity } = req.body;  // Use req.body instead of req.params

    vegetableCollection.updateOne(
        { _id: id },
        {
            $set: {
                name,
                price,
                quantity
            }
        }
    )
    .then(result => {
        if (result.modifiedCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Item not found' });
        }
    });
});


  // DELETE - (delete)
  app.delete('/delete/:id', (req, res) => {
    const id = new ObjectId(req.params.id);
    
    vegetableCollection.deleteOne({_id: id})
        .then(result => {
            if (result.deletedCount > 0) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Item not found' });
            }
        })
        .catch(error => {
            console.error("Error deleting:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        });
});

  

  // app.get('/vegetable/:id',(req,res)=> {
  //     const id = new ObjectId(req.params.id)
  //     vegetableCollection.find({_id:id}).toArray((err, vegetables) => {
  //       err && console.log(err);
  //       res.send(vegetables[0])
  //     })
  // })


    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const port = 3000
app.listen(port, () => {
  console.log(`Vegetable shop backend server running on port ${port}`)
})


