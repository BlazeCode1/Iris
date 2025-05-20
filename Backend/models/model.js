const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});



const patientSchema = new mongoose.Schema({
  patientID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  medicalHistory: { type: String, required: true },
});

const fullDiagnosisSchema = new mongoose.Schema({
  imageID: { type: String, required: true, unique: true },
  confidenceScore: { type: Number, required: true },
  result: { type: String, required: true },
  imagePath: { type: String, required: true },
  doctorName: { type: String, required: true },
  patientName: { type: String, required: true },
  patientID: { type: String, required: true },
  diagnosisID: { type: String, required: true, unique: true },
  dateDiagnosed: { type: Date, default: Date.now },
  
});

const User = mongoose.model("users", UserSchema);
const Patient = mongoose.model("Patient", patientSchema);
const Diagnostic = mongoose.model("diagnostics", fullDiagnosisSchema);

module.exports = {
  User,
  Patient,
  Diagnostic,
};
