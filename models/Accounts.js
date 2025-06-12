const mongoose = require('mongoose');
const iban = require('iban'); // Jei naudojate IBAN validacijai

const accountSchema = mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        personalId: { type: String, required: true, unique: true },
        accountNumber: { type: String, required: true, unique: true },
        balance: { type: Number, required: true, default: 0 },
        passportCopy: { type: Boolean, default: false },
        passportFilePath: { type: String },
        // NAUJAS LAUKAS: nuoroda į vartotojo ID
        user: {
            type: mongoose.Schema.Types.ObjectId, // Tai yra MongoDB objekto ID
            ref: 'User', // Nurodo, kad tai yra nuoroda į 'User' modelį
            required: false, // Leidžiame sąskaitoms egzistuoti be susieto vartotojo iš pradžių
            unique: false, // Vienas vartotojas gali turėti kelias sąskaitas (arba atvirkščiai)
        },
    },
    {
        timestamps: true,
    }
);

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;