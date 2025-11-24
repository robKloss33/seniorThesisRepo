// DBAbstraction.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const bcrypt = require('bcrypt');
//const { Client } = require('ssh2');
const net = require('net');  
require('dotenv').config({ path: '.env' });
//const tunnel = require('tunnel-ssh');

class DBAbstraction{

constructor(){
    this.pool = null;
    //this.ssh = null;
    //this.forwardedStream = null;
}

async init(){
    try{
        console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_PORT =", process.env.DB_PORT);
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_NAME =", process.env.DB_NAME);
        //console.log("Pre-Tunnel");
        //await this.createSSHTunnel();
        //console.log("SSH Tunnel Created");
        await this.createPool();
        console.log("Created Pool");
        await this.createAllTables();
        console.log("Connected to Amazon RDS");
    }catch(err){
        console.error("Failed to Connect to Amazon RDS: ", err);
        throw err;
    }
}

// async createSSHTunnel() {
//     return new Promise((resolve, reject) => {
//         this.ssh = new Client();
//         console.log("client");
//         this.ssh.on('ready', () => {
//             console.log("in SHH tunnel create");
//             this.ssh.forwardOut(
//                 '127.0.0.1',
//                 12345,
//                 process.env.DB_HOST,
//                 parseInt(process.env.DB_PORT),
//                 (err,stream) => {
//                     if(err) return reject(err);

//                     this.forwardedStream  = stream;
//                     resolve();
//                 }
//             );
//         }).on('error', reject)
//             .connect({
//                 host: process.env.SSH_HOST,
//                 username: process.env.SSH_USERNAME,
//                 port: 22,
//                 privateKey: fs.readFileSync(process.env.SSH_KEY_PATH)
//             });
//     });
// }

async createPool(){
    this.pool = mysql.createPool({
        host: process.env.DB_HOST,   
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,   
        password: process.env.DB_PASS, 
        database: process.env.DB_NAME, 
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        //stream: this.forwardedStream
    });
}

async query(sql, params = []){
    try{
        const rows = await this.pool.execute(sql, params);
        return rows;
    }catch(err)
    {
        console.error("Could not execute SQL Query: ", err);
        throw err;
    }
}

//alter tables to be unique

async createAllTables(){
    try{
        let userSQL = `CREATE TABLE IF NOT EXISTS Users (
            UserID INT AUTO_INCREMENT,
            Username	VARCHAR(255) NOT NULL,
            Email	VARCHAR(255) NOT NULL,
            Password	VARCHAR(255) NOT NULL,
            PRIMARY KEY(UserID)
            );`;
        let docsSQL = `CREATE TABLE IF NOT EXISTS Docs (
            DocID	INT AUTO_INCREMENT,
            KeyName	VARCHAR(255) NOT NULL,
            FileName	VARCHAR(255) NOT NULL,
            UserID	INT,
            PRIMARY KEY(DocID),
            FOREIGN KEY(UserID) REFERENCES Users(UserID)
            );`;
        await this.query(userSQL);
        await this.query(docsSQL);
    }catch(err){
        console.error("Could not create tables: ", err);
        throw err;
    }

}

//**********************************************************//
//********************      Inserts      *******************//
//**********************************************************//


async insertUser(userName, email, password){
    try{
        const params = [userName, email, password];
        console.log("gonna try");
        const sql = `INSERT INTO Users (Username, Email, Password) VALUES (?,?,?);`;
        await this.query(sql, params);
        console.log("Successfully inserted user");
    }catch(err){
        console.error(err);
        throw err;
    }
}
async insertDoc(key, fileName, user){
    try{
        const params = [key, fileName, user];
        const sql = `INSERT INTO Docs (KeyName, FileName, UserID) VALUES (?,?,?);`;
        await this.query(sql, params);
        console.log(`Successfully inserted ${fileName}`);
    }catch(err){
        console.error(err);
        throw err;
    }
}

//**********************************************************//
//********************     Retrievals     ******************//
//**********************************************************//

async fetchUserID(username){
    try{
        const params = [username];
        const sql = `SELECT UserID FROM Users WHERE Username = ?`;
        let rows = await this.query(sql, params);
        console.log(rows[0][0]);
        if(rows.length!=2)
        {
            throw new Error("No such user exists");
        }
        else{
            console.log(`Successfully fetched ${username}'s UserID`);
            return rows[0][0].UserID; 
        }
    }catch(err){
        console.error(err);
        throw err;
    }
}

async fetchDocsByUser(username){
    try{
        const userID = await this.fetchUserID(username);
        const params = [userID];
        const sql = `SELECT * FROM Docs WHERE UserID = ? ORDER BY Docs.FileName ASC`;
        const rows = await this.query(sql, params);
        console.log(`Successfully fetched ${username}'s Docs`);
        return rows;
    }catch(err){
        console.error(err);
        throw err;
    }
}
async fetchUserByUsername(username){
    try{
        const params = [username];
        const sql = `SELECT * FROM Users WHERE Username = ?`;
        const rows = await this.query(sql, params);
        if(rows.length!=2)
        {
            throw new Error("No such user exists");
        }
        else{
            console.log(`Successfully fetched ${username}`);
            return rows[0]; 
        }
    }catch(err){
        console.error(err);
        throw err;
    }
}
async fetchTitleByKey(keyName){
    try{
        const sql = `SELECT FileName FROM Docs WHERE KeyName = ?`;
        const rows = await this.query(sql, [keyName]);
        console.log(`Successfully fetched ${keyName}`);
        return rows;
    }catch(err){
        console.error(err);
        throw err;
    }
}

async printAllTables(){
    try{
        const sql = `SELECT * FROM Docs JOIN Users ON Docs.UserID = Users.UserID`;
        const rows = await this.query(sql);
        console.log("Successfully fetched all");
        return rows;
    }catch(err){
        console.error(err);
        throw err;
    }
}


async deleteDocs(keys){
    try{
        const placeholders = keys.map(() => '?').join(',');
        const sql = `DELETE FROM Docs WHERE KeyName IN (${placeholders})`;
        const rows = await this.query(sql, keys);
        console.log(`Successfully deleted ${keys}`);
        return rows;
    }catch(err){
        console.error(err);
        throw err;
    }
}

}

module.exports = DBAbstraction;
