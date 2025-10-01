
// DBAbstraction.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const { Client } = require('ssh2');
require('dotenv').config();

class DBAbstraction{

constructor(){
    this.pool = null;
    this.ssh = null;
}

async init(){
    try{
        await this.createSSHTunnel();
        await this.createPool();
        await this.createAllTables();
        console.log("Connected to Amazon RDS");

    }catch(err){
        console.error("Failed to Connect to Amazon RDS: ", err);
        throw err;
    }
}
createSSHTunnel() {
    return new Promise((resolve, reject) => {
        this.ssh = new Client();
        this.ssh.on('ready', () => {
            this.ssh.forwardOut(
                '127.0.0.1',
                21345,
                process.env.DB_HOST,
                parseInt(process.env.DB_PORT),
                (err,stream) => {
                    if(err) return reject(err);

                    this.forwardedStream  = stream;
                    resolve();
                }
            );

        }).on('error', reject)
            .connect({
                host: process.env.SSH_HOST,
                username: process.env.SSH_USERNAME,
                privateKey: fs.readFileSync(process.env.SSH_KEY_PATH)
            });
    });
}
async createPool(){
    this.pool = mysql.createPool({
        user: process.env.DB_USER,   
        password: process.env.DB_PASS, 
        database: process.env.DB_NAME, 
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        stream: this.forwardedStream
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
        console.log("Successfully inserted document");
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
        const rows = await this.query(sql, params);
        if(rows.length()!=1)
        {
            throw new Error("No such user exists");
        }
        else{
            console.log("Successfully fetched UserID");
            return rows[0].UserID; 
        }
    }catch(err){
        console.error(err);
        throw err;
    }
}
async fetchDocsByUser(username){
    try{
        const userID = await this.fetchUserID(username);
        const sql = `SELECT * FROM Docs WHERE UserID = ?`;
        const rows = await this.query(sql, params);
        console.log("Successfully fetched ${username}'s Docs");
        return rows;
    }catch(err){
        console.error(err);
        throw err;
    }
}






// async example(){
//     try{

//     }catch(err){
//         console.error(err);
//         throw err;
//     }
// }



}

module.exports = DBAbstraction;
