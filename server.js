const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const Datastore = require("nedb");
var hbs = require("express-handlebars");
const { SlowBuffer } = require("buffer");

app.set("views", path.join(__dirname, "views")); // ustalamy katalog views
app.engine(
    "hbs",
    hbs({
        extname: ".hbs",
        partialsDir: "views/partials",
        helpers: {
            isId: function (key, options) {
                return key == "_id" || key == "form" ? options.fn(this) : options.inverse(this);
            },
            withCarData: function (carData, options) {
                const newData = Object.assign({}, carData);
                delete newData._id;
                delete newData.form;
                let out = "";
                let values = Object.values(newData);
                let keys = Object.keys(newData);
                for (let index in values) {
                    out += options.fn({ value: values[index], key: keys[index] });
                }
                return out;
            },
            getOptions: function (value) {
                let out = "";
                let options = ["Tak", "Nie", "Brak"];
                for (let option of options) {
                    out += `<option value="${option}" ${value == option ? "selected" : ""} >${option}</option>`;
                }
                return out;
            },
        },
    })
); // domyślny layout, potem można go zmienić
app.set("view engine", "hbs");
let formId = null;

const cars = new Datastore({
    filename: "cars.db",
    autoload: true,
});

app.get("/", (req, res) => {
    cars.find({}, function (err, docs) {
        if (formId != null) {
            for (let doc of docs) {
                if (doc._id == formId) {
                    doc.form = true;
                    break;
                }
            }
            formId = null;
        }
        res.render("cars.hbs", { data: docs });
    });
});

app.get("/add", (req, res) => {
    if (typeof req.query != "undefined") {
        cars.insert({ insured: getValue(req.query.insured), gas: getValue(req.query.gas), damaged: getValue(req.query.damaged), engine: getValue(req.query.engine) }, function (err, newDoc) {
            cars.find({}, function (err, docs) {
                res.redirect("/");
            });
        });
        return;
    }
});

app.get("/form", (req, res) => {
    formId = req.query.id;
    res.redirect("/");
});

app.get("/remove", (req, res) => {
    console.log("x");
    cars.remove({ _id: req.query.id }, (err, numRemoved) => {
        res.redirect("/");
    });
});

app.get("/cancel", (req, res) => {
    res.redirect("/");
});

app.get("/update", (req, res) => {
    let obj = { insured: req.query.insured, gas: req.query.gas, damaged: req.query.damaged, engine: req.query.engine };
    cars.update({ _id: req.query.id }, { $set: obj }, {}, function (err, numUpdated) {
        res.redirect("/");
    });
});

function getValue(data) {
    return data == "on" ? "Tak" : "Nie";
}

app.use(express.static("static"));
app.listen(PORT, () => {
    console.log("start serwera na porcie " + PORT);
});
