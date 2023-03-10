// controller files are used to divide code up, this file divides the code for user.route.js

import bcrypt, { hashSync } from "bcrypt";
import { User } from "../models/model.users.js";
import { Blog } from "../models/model.blog.js";

import { signupUserVal } from "../validation/validation.user.js";

export const userSignup = async (req,res) => {

  try {
    const { error } = signupUserVal(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) return res.status(409).send({ message: "User's already registered. Use a different E-mail." });

    const hashedPass = bcrypt.hashSync(password, 10);
    
    const newUser = new User({email,  password: hashedPass});
    await newUser.save();

    res.status(201).send({ message: "User's registered successfully." });

    } catch (error) {
      res.status(500).send({ message: error.message });
    }
};

export const getUserBlogs = async (req,res) => {
    try {
        let id = req.query.id;
        id = id.replace(/"/g, "");
        const user = await User.findOne({_id: id});
        let blog = await Blog.find({userId: user._id});
      
      
        // filter blog, return if userId === id
        let filteredBlogs = blog.filter((blog) => blog.userId !== user._id);        
      
        filteredBlogs.forEach((blog) => {
            let img = blog.content.match(/<img.*?src="(.*?)"/);
            if (img) {
                blog.headerImg = img[1];
            } else {
                blog.headerImg = "";
            }
        });

        user.blogs = filteredBlogs;

        if (!user) return res.status(404).send({ message: "User not found." });
        res.status(200).send({user});
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}