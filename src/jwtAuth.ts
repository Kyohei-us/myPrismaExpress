import jwt from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

function isNumeric(num: string): boolean {
    if (!isNaN(Number(num)) && num !== "") {
        return true;
    }
    return false;
}

/**
 * 
 * @param userName 
 * @param jwtSecretKey 
 * @param max_time_limit - number in milliseconds as string
 * @returns 
 */
async function signWithKey(userName: string, jwtSecretKey: string, max_time_limit: string): Promise<string> {
    if (isNumeric(max_time_limit)){
        console.log(`A jwt with time limit of ${max_time_limit} is created!`)
        const jwt_string = jwt.sign({userName}, jwtSecretKey, {expiresIn: max_time_limit});
        const new_jwt = await prisma.jwtoken.create({
            data: {
                jwt: jwt_string,
                expired: false
            }
        })
        console.log(new_jwt)
        return jwt_string;
    }

    return jwt.sign(userName, jwtSecretKey);
}

async function verifyWithKey(token: string, jwtSecretKey: string) {
    const jwt_list = await prisma.jwtoken.findMany({
        where: {
            expired: true
        }
    })
    if (jwt_list === []) return false
    for (let i = 0; i < jwt_list.length; i++) {
        const element = jwt_list[i];
        if (element.jwt == token) {
            console.log("This jwt is in blacklist.")
            return false
        }
    }
    if (jwt.verify(token, jwtSecretKey)){
        return true
    } 
    return false;
}

async function invalidateJWT(token: string) {
    try {
        await prisma.jwtoken.update({
            where: { jwt: token }, 
            data: { expired: true }
        })
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

async function extractJWT(req: express.Request): Promise<{"bearerToken": string, "jwtSecretKey": string}> {
    const tokenNotFound = {bearerToken: "", jwtSecretKey: ""}
    // Retrieve env vars
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    // Check env vars are successfully retrieved
    if (!jwtSecretKey) {
        return tokenNotFound;
    }

    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader) {
        return tokenNotFound;
    }
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    // Token is not found on req header
    if (!bearerToken) {
        return tokenNotFound;
    }

    return {bearerToken, jwtSecretKey}
}

async function protectedRoute(req: express.Request): Promise<Boolean> {
    let extracted = await extractJWT(req)

    if (extracted.bearerToken === "" || extracted.jwtSecretKey === "" ) {
        return false
    }

    const verified = await verifyWithKey(extracted.bearerToken, extracted.jwtSecretKey);
    if (verified) {
        return true;
    } else {
        return false;
    }
}

export { signWithKey, protectedRoute, extractJWT, invalidateJWT }