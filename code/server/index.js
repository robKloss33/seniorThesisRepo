
require('dotenv').config();

const express = require('express'); 
const morgan = require('morgan'); 
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require("body-parser"); 
const DBAbstraction = require('./DBAbstraction');  
const session = require('express-session');
const bcrypt = require('bcrypt');
const readline = require('readline');
//look into pdf-parse
//mammoth for docs
const {pipeline} = require("stream");
const {promisify} = require("util");

const {S3Client, PutObjectCommand, GetObjectCommand} = require("@aws-sdk/client-s3")

const app = express();
const pipe = promisify(pipeline);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const db = new DBAbstraction;
db.init();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

//**********************************************************//
//********************S3 Related Helpers********************//
//**********************************************************//

async function uploadToS3(fileBody, bucketName, keyName) {
    try{
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: keyName,
            Body: fileBody
          });
          await s3.send(command);
    }
    catch(err){
        throw err;
    }
}
async function downloadFromS3(bucketName, keyName) {
    try{
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: keyName,
          });
          const data = await s3.send(command);
          console.log("Downloaded file successfully");
          return data;
    }
    catch(err){
        throw err;
    }
}

function findPeriodAndSplice(line, phrase)
{
    // let phraseIndex = line.search(phrase);
    // const redot = /[.!?]/;
    // let index = -1;

    // while(line.search(redot)!= -1)
    // {
        
    //     console.log(index);
    //     index = line.search(redot);
    //     if(index < phraseIndex)
    //     {

    //     }
    //     line = line.slice(index+1);
    // }
    // if(index != -1)
    // {
    //     line = line.substring(0,index+1);
    // }
    return line;
}

async function parse(keyName, phrase)
{
    try{
        const data = await downloadFromS3(process.env.BUCKET_NAME, keyName);

        //convert to txt file handle later
        //data.Body;

        console.log("Found file");

        const rl = readline.createInterface({
            input: data.Body,
            crlfDelay: Infinity
        });

        const redot = /[.!?]/;

        let arrayMatches = new Array();
        let lineNum = 0; 
        let prevLine = "";

        for await(const line of rl){
            lineNum++;
            if(line.search(phrase)!= -1)
            {
                if(line.search(redot)!= -1)
                {
                    let retLine = findPeriodAndSplice(line, phrase);
                    arrayMatches.push([lineNum, retLine]); 
                }
                else if (prevLine.search(redot)!= -1)
                {
                    let retLine = findPeriodAndSplice(prevLine, phrase);
                    retLine = retLine + " " + line
                    arrayMatches.push([lineNum, line]);   
                }   
                else
                {
                    let retLine = prevLine + " " + line;
                    arrayMatches.push([lineNum, retLine]);   
                }
            }
            prevLine = line;

        }
        console.log(arrayMatches);
    }
    catch(err){
        console.log(err);
    }
}
console.log("attempt");
//parse("Frankenstein.txt", "God");
async function generateReport(keyNames, phrases) {

    
}

const filePath = 'testData/Resume-KlossCS.txt';

function readInFile(path)
{
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent;
    } catch (err) {
        console.error('Error reading file:', err);
    }
}
+


function generateKeyName(fileName, userName)
{
    return userName + "_" + fileName;
}

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// app.get('/', async (req, res) => { 
//     res.render('index.html', { user: req.session.user}); 
// });

app.post('/upload', async (req, res)=>{
    try{
        // const user = req.session.user;
        // const {file} = req.body;
        //keyName = generateKeyName(user, file);
        let file = readInFile(filePath);
        let keyName = "test.txt" 
        await uploadToS3(file,process.env.BUCKET_NAME,keyName);
        res.status(200).send("Upload Complete")
    } catch (err){
        res.status(500).send("Upload Failed");
        throw err;
    }
});
app.get('/download/:keyName', async (req, res)=>{
    try{
        let keyName = req.params.keyName;
        const data = await downloadFromS3(process.env.BUCKET_NAME,keyName);

        console.log();

        res.setHeader("Content-Disposition",'attachment: filename="${keyName}"');
        res.setHeader("Content-Type", "application/octet-stream");

        await pipe(data.Body, res);
        res.status(200).send("Download Complete");

    } catch (err){
        res.status(500).send("Download Failed");
        throw err;
    }
});
app.get('/generateReport', async (req, res)=> {
    try{
        // let searches = [];
        // let keys = [];

        let answers = [];
        for(let key of keys)
        {
            
        }



    }catch(err){
        res.status(500).send("Generate Failed");
        throw err;
    }
});

app.listen(53140, () => console.log('The server is up and running...'));


/*
   ,     #_
   ~\_  ####_  
  ~~  \_#####\
  ~~     \###|
  ~~       \#/ ___   
   ~~       V~' '->
    ~~~         /
      ~~._.   _/
         _/ _/
       _/m/'

*/
