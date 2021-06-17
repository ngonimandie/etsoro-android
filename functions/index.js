const functions = require("firebase-functions");
const doc = require("pdfkit");
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.addRunner = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Starting to add a runner!", { structuredData: true });
    const name = request.query.name;
    const surname = request.query.surname;
    const mobile = request.query.mobile;
    const age = request.query.age;
    const gender = request.query.gender;
    const raceCategory = request.query.raceCategory;
    const paymentAmount = request.query.paymentAmount;
    const email = request.query.email;
    const country = request.query.country;
    const city = request.query.city;
    const howRunnerHeard = request.query.howRunnerHeard;
    const raceNumber = 'I' + mobile + 'H' + age
    const docRef = db.collection('runners').doc(raceNumber);

    docRef.set({
        name: name,
        surname: surname,
        mobile: mobile,
        age: age,
        gender: gender,
        raceCategory: raceCategory,
        paymentAmount: paymentAmount,
        email: email,
        country: country,
        city: city,
        howRunnerHeard: howRunnerHeard,
        raceNumber: raceNumber,

    });
    //functions.logger.info("Runner added with this data:" + doc.data(), { structuredData: true });
    response.send(raceNumber);
});
exports.retrieveRunner = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Starting to retrieve all runners!", { structuredData: true });
    const snapshot = await db.collection('runners').get();
    snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
    });
    //functions.logger.info("Runner added with this data:" + doc.data(), { structuredData: true });
    response.send("Hello from Firebase!");
});
