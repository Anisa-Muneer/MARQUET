const dotenv = require('dotenv')
dotenv.config();
const mongoose = require('mongoose')
mongoose.connect(process.env.mongo)

const express = require("express")
const app = express()
const path = require('path')
const nocache = require('nocache')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(nocache());


app.set('view engine', 'ejs');
app.set('views', './views/users')

const publicpath = path.join(__dirname, 'public')

app.use(express.static(publicpath))

const userRouter = require('./routes/userRoute')
app.use('/', userRouter)

const adminRoute = require('./routes/adminRoute');
const { error } = require('console');
app.use('/admin', adminRoute)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const port = process.env.port || 3000
const server = app.listen(port, () => {
  console.log(`server is running ${port}`);
})
