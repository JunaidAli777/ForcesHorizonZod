import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { IUser } from './models/User';

const envPath = path.join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI as string)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

interface User {
  id: number;
  image?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  country?: string;
  state?: string;
  city?: string;
  role?: string;
  email: string;
  password: string;
  terms: boolean;
}

let users: User[] = [];

app.post('/api/users', upload.single('image'), async (req, res) => {
  try {
      const newUser = new User({
          ...req.body,
          image: req.file ? `/uploads/${req.file.filename}` : undefined,
      });

      const savedUser = await newUser.save();

      res.status(201).json({ message: 'User registered successfully!', user: savedUser });
  } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});