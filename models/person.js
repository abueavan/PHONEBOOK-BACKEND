/* eslint-disable no-unused-vars */
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_PHONEBOOK_URI

console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify:false, useCreateIndex: true })
  .then(_ => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('errro connecting to MongoDb', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required:true,
    unique: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true
  },
})
personSchema.plugin(uniqueValidator)
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)