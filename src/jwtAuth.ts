import jwt from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

function signWithKey(userName: string, jwtSecretKey: string, max_time_limit?: string) {
    if (max_time_limit){
        console.log(`A jwt with time limit of ${max_time_limit} is created!`)
        return jwt.sign({userName}, jwtSecretKey, {expiresIn: max_time_limit});
    }

    return jwt.sign(userName, jwtSecretKey);
}

function verifyWithKey(token: string, jwtSecretKey: string) {
    return jwt.verify(token, jwtSecretKey);
}


function protectedRoute(req: express.Request): Boolean {
    // Retrieve env vars
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    // Check env vars are successfully retrieved
    if (!jwtSecretKey) {
        return false;
    }

    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader) {
        return false;
    }
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    // Token is not found on req header
    if (!bearerToken) {
        return false;
    }

    const verified = verifyWithKey(bearerToken, jwtSecretKey);
    if (verified) {
        return true;
    } else {
        return false;
    }
}

export { signWithKey, protectedRoute }