import bcrypt, {compareSync}from "bcrypt";
import {Blog} from '../models/model.blog.js';

import { User } from "../models/model.users.js";
import { loginUserVal } from "../validation/validation.user.js";

export const userAuth = async (req, res) => {
  try {
    const { error } = loginUserVal(req.body);
    if (error) return res.status(401).send({message: error.details[0].message});

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user) return res.status(401).send({message: "Invalid email or password."});

    const validPass = await compareSync(password, user.password);

    if(!validPass) return res.status(401).send({message: "Invalid email or password."});

    const id = user._id;
    const blogs = user.blogs;

    const token = user.generateAuthToken();
    res.status(200).send({user: {id, email, blogs}, data: token, message: "Logged in sucessfully."})
  }
  catch (error) {
    res.status(500).send({ message: error.message });
  }
};