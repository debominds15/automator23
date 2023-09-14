const { success, error, validation } = require("../../helpers/responseApi");
const { randomString } = require("../../helpers/common");
const { validationResult } = require("express-validator");
const config = require("config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Verification = require("../../models/Verification");
const Scan = require("../../models/Scan");
const path = require("path");
const reportController = require(path.join(__dirname, './ReportController.js'));

/**
 * @desc    Register a new user
 * @method  POST api/auth/register
 * @access  public
 */
exports.register = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json(validation(errors.array()));

  const { name, email, password, isRoleTypeDoctor } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase() });

    // Check the user email
    if (user)
      return res
        .status(422)
        .json(validation({ msg: "Email already registered" }));

    let newUser = new User({
      name,
      email: email.toLowerCase().replace(/\s+/, ""),
      password,
      isRoleTypeDoctor
    });

    // Hash the password
    const hash = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, hash);

    // Save the user
    await newUser.save();

    // Save token for user to start verificating the account
    let verification = new Verification({
      token: randomString(50),
      userId: newUser._id,
      type: "Register New Account",
    });

    // Save the verification data
    await verification.save();

    // Send the response
    res.status(201).json(
      success(
        "Register success, please activate your account.",
        {
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            isRoleTypeDoctor: newUser.isRoleTypeDoctor,
            verified: newUser.verified,
            verifiedAt: newUser.verifiedAt,
            createdAt: newUser.createdAt,
          },
          verification,
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

/**
 * @desc    Verify a new user
 * @method  GET api/auth/verify/:token
 * @access  public
 */
exports.verify = async (req, res) => {
  const { token } = req.params;

  try {
    let verification = await Verification.findOne({
      token,
      type: "Register New Account",
    });

    // Check the verification data
    if (!verification)
      return res
        .status(404)
        .json(error("No verification data found", res.statusCode));

    // If verification data exists
    // Get the user data
    // And activate the account
    let user = await User.findOne({ _id: verification.userId }).select(
      "-password"
    );
    user = await User.findByIdAndUpdate(user._id, {
      $set: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    // After user successfully verified
    // Remove the verification data from database
    verification = await Verification.findByIdAndRemove(verification._id);

    // Send the response
    res
      .status(200)
      .json(
        success(
          "You've successfully verified your account",
          null,
          res.statusCode
        )
      );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

/**
 * @desc    Login a user
 * @method  POST api/auth/login
 * @access  public
 */
exports.login = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json(validation(errors.array()));

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check the email
    // If there's not exists
    // Throw the error
    if (!user) return res.status(422).json(validation("Invalid credentials"));

    // Check the password
    let checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword)
      return res.status(422).json(validation("Invalid credentials"));

    // Check user if not activated yet
    // If not activated, send error response
    if (user && !user.verified)
      return res
        .status(400)
        .json(error("Your account is not active yet.", res.statusCode));

    // If the requirement above pass
    // Lets send the response with JWT token in it
    const payload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;

        res
          .status(200)
          .json(success("Login success", { token }, res.statusCode));
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

/**
 * @desc    Resend new verification token to user
 * @method  POST api/auth/verify/resend
 * @access  public
 */
exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  // Simple checking for email
  if (!email)
    return res.status(422).json(validation([{ msg: "Email is required" }]));

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check the user first
    if (!user)
      return res.status(404).json(error("Email not found", res.statusCode));

    // If user exists
    // We gonna get data from verification by user ID
    let verification = await Verification.findOne({
      userId: user._id,
      type: "Register New Account",
    });

    // If there's verification data
    // Remove previous verification data and create a new one
    if (verification) {
      verification = await Verification.findByIdAndRemove(verification._id);
    }

    // Create a new verification data
    let newVerification = new Verification({
      token: randomString(50),
      userId: user._id,
      type: "Register New Account",
    });

    // Save the verification data
    await newVerification.save();

    // Send the response
    res
      .status(201)
      .json(
        success(
          "Verification has been sent",
          { verification: newVerification },
          res.statusCode
        )
      );
  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

/**
 * @desc    Get authenticated user
 * @method  GET api/auth
 * @access  private
 */
exports.getAuthenticatedUser = async (req, res) => {
  console.log('Inside getAuthenticatedUser in controller')

  try {
    const user = await User.findById(req.user.id).select("-password");

    // Check the user just in case
    if (!user)
      return res.status(404).json(error("User not found", res.statusCode));

    // Send the response
    res
      .status(200)
      .json(success(`Hello ${user.name}`, { user }, res.statusCode));
  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

/**
 * @desc    Get all scan data
 * @method  GET api/auth
 * @access  private
 */
 exports.getAllScanData = async (req, res) => {
  console.log('Inside getAllScanData in controller')

  try {
    const user = await User.findById(req.user.id).select("-password");

    // Check the user just in case
    if (!user)
      return res.status(404).json(error("User not found", res.statusCode));

    console.log("User id is: ", req.user.id);
    const data = await Scan.find({ userId: req.user.id });

    // Send the response
    res.status(200).json(success(`Hello ${user.name}`, { data }, res.statusCode))
  
  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

/**
 * @desc    Get all patient reports data
 * @method  GET api/auth
 * @access  private
 */
 exports.getAllReportData = async (req, res) => {
  console.log('Inside getAllReportData in controller')

  try {
    const user = await User.findById(req.user.id).select("-password");

    // Check the user just in case
    if (!user)
      return res.status(404).json(error("User not found", res.statusCode));

    console.log("User id is: ", req.user.id);
    const data = await Scan.find({ patientId: req.user.id });

    // Send the response
    res.status(200).json(success(`Hello ${user.name}`, { data }, res.statusCode))
  
  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

/**
 * @desc    Get all list of patients
 * @method  GET api/auth
 * @access  private
 */
 exports.getAllPatients = async (req, res) => {
  console.log('Inside getAllPatients in controller')

  try {
    const user = await User.findById(req.user.id).select("-password");

    // Check the user just in case
    if (!user)
      return res.status(404).json(error("User not found", res.statusCode));

    console.log("User id is: ", req.user.id);
    const data = await User.find({ isRoleTypeDoctor: false, verified: true });

    // Send the response
    res.status(200).json(success(`Patients list fetched succesfully!`, { data }, res.statusCode))
  
  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

exports.addScanData = async (req, res) => {
  // Validation
  console.log('Inside post scan in controller')
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json(validation(errors.array()));

  const { patientId, patientName, patientAge, height, weight, bmi, 
    isFirstVisit, scanned_on, fhr, ga, mvp, placentaLocation, pdfUrl, summary } = req.body;

  try {
    const user = await User.findById(req.user.id).select("-password");
   
    // Check the user just in case
    if (!user)
      return res.status(404).json(error("Doctor not found", res.statusCode));

        // Check the user just in case
    if (!user.isRoleTypeDoctor)
      return res.status(404).json(error("This is not a doctor profile", res.statusCode));  

    let userId = user.id;
    let scannedByDoctor = user.name;
    let newScan= new Scan({
      userId: userId,
      patientId: patientId,
      patientName: patientName,
      patientAge: patientAge,
      height: height,
      weight: weight,
      bmi: bmi,
      scannedBy: scannedByDoctor,
      isFirstVisit: isFirstVisit,
      scanned_on: scanned_on,
      fhr: fhr,
      ga: ga,
      mvp: mvp,
      placentaLocation: placentaLocation,
      pdfUrl: pdfUrl,
      summary: summary
    });

    console.log('scanned_on ' + scanned_on)
    // Save the user
    await newScan.save();

    // Send the response
    res.status(201).json(
      success(
        "Scan successfully added.",
        {
            id: newScan._id,
            patientName: newScan.patientName,
            fhr: newScan.fhr,
            ga: newScan.ga,
            mvp: newScan.mvp,
            placentalocation: newScan.placentaLocation,
            summary: newScan.summary,
            pdfUrl: newScan.pdfUrl,
            scanned_on: newScan.scanned_on
          },
        res.statusCode
      )
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};

exports.editScanData = async (req, res) => {
  // Validation
  console.log('Inside editScanData in controller')
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json(validation(errors.array()));

  const { patientAge, height, weight, bmi, scannedByDoctor,
    isFirstVisit, scanned_on, fhr, ga, mvp, placentaLocation, pdfUrl, publicId, summary } = req.body;

  try {
      let updatedScan = ({
        patientAge: patientAge,
        height: height,
        weight: weight,
        bmi: bmi,
        scannedBy: scannedByDoctor,
        isFirstVisit: isFirstVisit,
        scanned_on: scanned_on,
        fhr: fhr,
        ga: ga,
        mvp: mvp,
        placentaLocation: placentaLocation,
        pdfUrl: pdfUrl,
        publicId: publicId,
        summary: summary
      });

      await Scan.findByIdAndUpdate(req.params.scanId, updatedScan);

        // Send the response
    res.status(201).json(
      success(
        "Scan successfully updated.",
        {
            id: updatedScan._id,
            fhr: updatedScan.fhr,
            ga: updatedScan.ga,
            mvp: updatedScan.mvp,
            placentalocation: updatedScan.placentaLocation,
            summary: updatedScan.summary,
            pdfUrl: updatedScan.pdfUrl,
            publicId: publicId,
            scanned_on: updatedScan.scanned_on
          },
        res.statusCode
      )
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};