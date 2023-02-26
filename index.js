const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const multer = require('multer');
var path = require('path');
var image;

mongoose.connect("mongodb+srv://lonely1:24810@cluster0.wk0dk.mongodb.net/GoTrack", (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to MongoDB!");
    }
});


const UserRegistration = ({

    name: String,
    email: String,
    password: String,
    phone: Number,
    city: String,
    country: String,
    adhar : Number

});

const Delivery = ({
    your_name: String,
    your_contact: Number,
    package_name: String,
    package_type: String,
    dimensions: Number,
    weight: Number,
    pickup: String,
    drop: String,
    date: Date,
    receiver_name: String,
    receiver_contact: Number,
    package_image: String,
    amount: Number,

});

const Traveller = ({
    name : String,
    contact : Number,
    email : String,
    from1 : String,
    to1 : String,
    date1 : Date,
    adhar_card1 : Number
});




const NewRegistrations = mongoose.model("NewRegistrations", UserRegistration);
const NewDelivery = mongoose.model("NewDelivery", Delivery);
const NewTraveller = mongoose.model("NewTraveller",Traveller);
var ActiveId;


if (typeof localStorage === "undefined" || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}



const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));



var Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
});

var upload = multer({
    storage: Storage
}).single('package_photo');



app.get('/', (req, res) => {

    res.render('index', {});

});

app.get('/SignUp', (req, res) => {

    res.render('Signup', {});
});


app.post('/SignUp', (req, res) => {

    var name = req.body.Name;
    var email = req.body.Email;
    var contact = req.body.Contact;
    var city = req.body.City;
    var country = req.body.Country;
    var password = req.body.Password;
    var confirmPassword = req.body.Confirm_Password;
    var adhar = req.body.adhar;

    if (password == confirmPassword) {

        var newRegistration = new NewRegistrations({

            name: name,
            email: email,
            phone: contact,
            city: city,
            country: country,
            password: password,
            adhar: adhar



        });

        newRegistration.save();
        res.redirect('/SignIn');



    } else {

        res.redirect('/SignUp');

    }


});

app.get("/Account", async (req, res) => {

    var activeUser = await NewRegistrations.findOne({ _id: ActiveId });

    res.render('customer_address', {
        Name: activeUser.name,
        City: activeUser.city,
        Country: activeUser.country,
        Contact: activeUser.phone,
        Email: activeUser.email
    });
});

app.get("/Account/:requestid", async (req, res) => {

    var requestID = req.params.requestid;

    // var user = await NewRegistrations.findOne({_id: requestID});

   NewRegistrations.findOne({adhar :requestID}, function (err,person){
        res.render('customer_address', {
            Name: person.name,
            City: person.city,
            Country: person.country,
            Contact: person.phone,
            Email: person.email
        });

    })

});




app.get("/Security", async (req, res) => {

    var activeUser = await NewRegistrations.findOne({ _id: ActiveId });

    res.render('customer_security', {
        Name: activeUser.name,
        City: activeUser.city,
        Country: activeUser.country,
        Contact: activeUser.phone,
        Email: activeUser.email
    });
});


app.get("/Tracking", async (req, res) => {

    var activeUser = await NewRegistrations.findOne({ _id: ActiveId });

    res.render('customer_tracking', {
        Name: activeUser.name,
        City: activeUser.city,
        Country: activeUser.country,
        Contact: activeUser.phone,
        Email: activeUser.email
    });
});


app.get("/Shipping", async (req, res) => {

    var activeUser = await NewRegistrations.findOne({ _id: ActiveId });

    res.render('customer_shipping', {
        Name: activeUser.name,
        City: activeUser.city,
        Country: activeUser.country,
        Contact: activeUser.phone,
        Email: activeUser.email
    });
});


app.get("/Delivery", async (req, res) => {

    var activeUser = await NewRegistrations.findOne({ _id: ActiveId });


    res.render('delivery', {Name:activeUser.name});

});

app.get("/Traveller", async (req, res) => {
    var activeUser = await NewRegistrations.findOne({ _id: ActiveId });

    res.render('traveller', {Name:activeUser.name});

});


app.get("/home_traveller", async (req, res) => {

    var activeUser = await NewRegistrations.findOne({ _id: ActiveId });

    NewTraveller.find({},(err,result)=>{
        

        
         res.render('home_traveller', {
            Name:activeUser.name,
            Travellers: result 
        });
    })

   
});

app.get("/home_shipper", async (req, res) => {
    var activeUser = await NewRegistrations.findOne({ _id: ActiveId });

    NewDelivery.find({},(err,result)=>{
        
         res.render('home_shipper', {
            Name:activeUser.name,
            Shippers: result 
        });
    })

})




app.get("/home_shipper/:id", async (req, res) => {
    var requestID = req.params.id;


    NewDelivery.findOne({_id :requestID}, function (err,person){
        res.render('details', {
            Name: person.your_name,
            Contact: person.your_contact,
            Package: person.package_name,
            type: person.package_type,
            dimensions: person.dimensions,
            weight: person.weight,
            pickup: person.pickup,
            drop: person.drop,
            date: person.date,
            receiver_name: person.receiver_name,
            receiver_contact: person.receiver_contact
        });

    })


});


app.get("/home_traveller/:id", async (req, res) => {
    var requestID = req.params.id;


    NewTraveller.findOne({_id :requestID}, function (err,person){
        res.render('details1', {
            Name: person.name,
            Contact: person.contact,
            pickup: person.from1,
            drop: person.to1,
            date: person.date1,
            adhar: person.adhar_card1
        });

    })


});




app.post("/Delivery", upload, async (req, res) => {


    var imageFile = req.file.filename;


    image = imageFile;

    var Contact = await NewRegistrations.findOne({ _id: ActiveId });



    var name = req.body.package_name;
    var type = req.body.package_type;
    var dimensions = req.body.package_dimensions;
    var weight = req.body.package_weight;
    var from = req.body.from;
    var to = req.body.to;
    var date = req.body.pickup_date;
    var receiver_name = req.body.receiver_name;
    var receiver_contact = req.body.receiver_contact;
    var photo = imageFile;
    var amount = req.body.payment;

    var Ndelivery = new NewDelivery({
        
        your_name : Contact.name,
        your_contact: Contact.phone,
        package_name: name,
        package_type: type,
        dimensions: dimensions,
        weight: weight,
        pickup: from,
        drop: to,
        date: date,
        receiver_name: receiver_name,
        receiver_contact: receiver_contact,
        package_image: photo,
        amount : amount

    });

    Ndelivery.save();
    res.redirect("/home_traveller");

});


app.post('/Traveller', async (req, res) => {
    var Contact = await NewRegistrations.findOne({ _id: ActiveId });

    var from = req.body.from;
    var to = req.body.to;
    var date = req.body.travel_date;
    var adhar = req.body.adhar;


   var NTraveller  = new NewTraveller({

    name : Contact.name,
    contact : Contact.phone,
    email : Contact.email,
    from1 : from,
    to1 : to,
    date1 : date,
    adhar_card1 : adhar

   })

   NTraveller.save();


   

   res.redirect("/home_shipper");
   
  
  
});


app.get('/SignIn', (req, res) => {

    res.render('Login', {});
});


app.get("/auth/google", (req, res) => {

    res.redirect("/home_traveller");

});

app.post('/SignIn', async (req, res) => {

    var email = req.body.Email;
    var password = req.body.Password;


    const Uloggedin = await NewRegistrations.findOne({ email: email });


    if (Uloggedin.password == password) {

        ActiveId = Uloggedin._id;

        res.redirect('/Traveller');

    } else {
        res.redirect('/SignIn');
    }



});

app.listen(3069, (req, res) => {

    console.log('listening to port 3069...');


});




