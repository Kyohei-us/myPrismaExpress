import jwt from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

function signWithKey(userName: string, jwtSecretKey: string) {
    return jwt.sign(userName, jwtSecretKey);
}

function verifyWithKey(token: string, jwtSecretKey: string) {
    return jwt.verify(token, jwtSecretKey);
}


function protectedRoute(req: express.Request): Boolean {
    // Retrieve env vars
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY
    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    // Check env vars are successfully retrieved
    if (!tokenHeaderKey || !jwtSecretKey) {
        return false;
    }
    // Get token on req header
    const token = req.header(tokenHeaderKey);

    // Token is not found on req header
    if (!token) {
        return false;
    }

    const verified = verifyWithKey(token, jwtSecretKey);
    if (verified) {
        return true;
    } else {
        return false;
    }
}

export { signWithKey, protectedRoute }