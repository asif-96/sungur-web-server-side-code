const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


require('dotenv').config();
// console.log(process.env.DB_USER);

const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());


// connect with mongoDB database

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxj4r.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const boradbands = client.db("broadband").collection("services");
    const reviews = client.db("broadband").collection("review");
    const registrations = client.db("broadband").collection("registration");
    // perform actions on the collection object
    if (err) {
        console.log(err);
    } else {
        console.log("Database successfully connected.");
    }


    // -------------------------------------------- DATA insert START ------------------------
    // insert data from admin
    app.post('/admindashboard', (req, res) => {
        const broadband = req.body;
        console.log("Adding new bundle..: ", broadband);
        boradbands.insertOne(broadband)
        .then(result => {
            console.log("Inserted count: ", result.insertedCount)
            res.send(result.insertedCount > 0);
        })
    })

    // insert user review from userDashboard
    app.post('/userDashboard', (req, res) => {
        const review = req.body;
        console.log("Adding user review..: ", review);
        reviews.insertOne(review)
        .then(result => {
            console.log("Inserted count: ", result.insertedCount)
            res.send(result.insertedCount > 0);
        })
    })


    // order data send to database
    app.post('/submitOrder', (req, res) => {
        const registration = req.body;
        registrations.insertOne(registration, (err, result) => {
            res.send({count: result.insertedCount})
        })
    })



    // ------------------------------------ DATA Insert END --------------------------------


    // ------------------------------------ DATA Display START --------------------------------

    // display data from database
    app.get('/showServices', (req, res) => {
        boradbands.find({})
        .toArray((err, documents) => {
            if(err){
                console.log(err)
            }
            res.send(documents);
        })
    })


    // display user review
    app.get('/showUserReview', (req, res) => {
        reviews.find({})
        .toArray((err, documents) => {
            if(err){
                console.log(err)
            }
            res.send(documents);
        })
    });


    // get order data
    app.get('/broadbands/:id', (req, res) => {
        const { id } = req.params;
        boradbands.find({_id: ObjectID(id)})
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })


    // ------------------------------------ DATA Display END --------------------------------


    // delete item from database and manageService
    app.delete('/deleteService/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        console.log('delete this: ', id);
        boradbands.findOneAndDelete({_id: id})
        .then(documents => res.send(!!documents.value))
      })


});


app.get('/', (req, res) => {
    res.send('Assalamu Alaikum');
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
