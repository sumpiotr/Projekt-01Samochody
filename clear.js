const Datastore = require('nedb')

const cars = new Datastore({
        filename: 'cars.db',
        autoload: true
    });
    
    cars.remove({}, { multi: true }, function (err, numRemoved) {
        console.log("usunięto wszystkie dokumenty: ",numRemoved)  
    });