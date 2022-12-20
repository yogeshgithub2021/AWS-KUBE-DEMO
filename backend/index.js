import express, { json } from "express";
import mongoose from "mongoose";
import cors from "cors";
// import UserModel from "./models/UserModel.js";
import multer from "multer";
import { fileURLToPath } from 'url';
import path from "path"
import { dirname } from "path";
import NotesUploadModel from "./models/NotesUploadModel.js";
import UserModel from "./models/UserModel.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);


const app = express();
app.use("/public", express.static(path.join(__dirname, '/public')));
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }))


// ------------------------ Authentication ---------------------------------------------

app.post("/api/sign-up", async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    try {
        const preUser = await UserModel.find({ email: email });
        console.log(preUser);
        if (preUser.length < 1) {
            const User = await UserModel.create({ first_name, last_name, email, password });
            console.log(User);
            res.status(200).json(User);
            // res.redirect("/api/sign-in");
        } else {
            res.status(400).json({ error: "Email Already Exists" });
        }

    } catch (error) {
        console.log(error.message)
        res.status(400).json({ error })
    }
})

app.post("/api/sign-in", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
    try {
        const User = await UserModel.findOne({ email: email, password: password })
        console.log(User)
        if (User) {
            res.status(200).json(User);
        } else {
            res.status(403).json({ error: "Invalid email / password" });
        }
    } catch (error) {
        res.status({ error: error });
    }
});


var profileImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile')
    },
    filename: function (req, file, cb) {
        console.log("/apiInside multer", req.body);
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const profilePictureUpload = multer({ storage: profileImageStorage })

app.post("/api/update-profile", profilePictureUpload.single("/apiprofilePicture"), async (req, res) => {
    const { UserID, phone } = req.body;
    console.log(req.file);
    const profilePicture = req.file ? `${req.protocol}://${req.get('host')}/${req.file.path}` : "";
    const user = await UserModel.updateOne({ UserID, phone, profilePicture });
    console.log(user);
})


// --------------------------------- Note Upload---------------------------------

var noteStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/notes')
    },
    filename: function (req, file, cb) {
        console.log("/apiInside multer", req.body);
        cb(null, req.body.fileName + Date.now() + path.extname(file.originalname))
    }
});
const noteUpload = multer({ storage: noteStorage })

app.post("/api/noteUpload", noteUpload.single("/apiuploadFile"), async (req, res) => {
    console.log("/apiIncoming Request");
    try {
        const { UserID, fileName, branch, description } = req.body;
        console.log(branch);
        const uploadFile = req.file ? `${req.protocol}://${req.get('host')}/${req.file.path}` : "";
        const note = await NotesUploadModel.create({ UserID, fileName, description, uploadFile, branch });
        if (note) {
            res.status(200).json(note);
        } else {
            throw "Error Occured while uploading file"
        }
    } catch (error) {
        console.log("/api/noteUpload", error);
        res.status(400).json(error);
    }

})

app.get("/api/allNotes", async (req, res) => {
    try {
        const NoteArray = await NotesUploadModel.find({});
        if (NoteArray) {
            res.status(200).json(NoteArray);
        } else {
            throw "something went wrong while fetching notes";
        }
    } catch (error) {
        console.log("/api/allNotes", error);
        res.status(400).json(error);
    }
});

app.get("/api/notes/:branch", async (req, res) => {
    try {
        const NoteArray = await NotesUploadModel.find(req.params);
        if (NoteArray) {
            res.status(200).json(NoteArray);
        } else {
            throw "something went wrong while fetching notes";
        }
    } catch (error) {
        console.log("/api/allNotes", error);
        res.status(400).json(error);
    }
});

app.get("/api/user/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        const count = await NotesUploadModel.countDocuments({ UserID: id });
        user._doc.count = count;
        if (user) {
            res.status(200).json(user);
        } else {
            throw "user does not exists";
        }
    } catch (error) {
        res.status(404).json(error);
    }

});


//  ------------------ database connection -----------------------------------------

const PORT = 3001;

const url = "mongodb://root:apPuTJQCOW@my-release-mongodb.default.svc.cluster.local:27017/?retryWrites=true&w=majority";

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(url, connectionParams)
    .then(() => app.listen(PORT, () => (
        console.log(`Connected to the database and running on port ${PORT}`)
    )))
    .catch((err) => {
        console.error(`Error connecting to the database. n${err}`);
    });
