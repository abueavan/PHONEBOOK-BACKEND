require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
app.use(cors())
morgan.token('post', (request, response) => {
    if(request.method === 'POST' || request.method === 'PUT') {
        return JSON.stringify(request.body)
    }
    //else return ''
})
app.use(bodyParser.json())
//app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))
app.use(express.static('build'))


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()))
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next)=> {
    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // console.log(persons)
    // response.status(204).end()
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    // if(persons.some(item => item.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person.save().then(savedPerson => {
        console.log(savedPerson)
        response.json(savedPerson.toJSON())
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const perosn = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, perosn, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.end(
            `<p>PhoneBook has info for ${persons.length} people</p><p>${Date()}</p>`)
    })
    
})

const unKnownEndpoint = (request, response) => {
    response.status(404).send({error: 'unkown endpoint'})
}
app.use(unKnownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if(error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({error: 'malformated id'})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
})