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
const { readFile, writeFile } = require('node:fs/promises');
const officeParser = require('officeparser');



require('dotenv').config();


const { PDFParse } = require('pdf-parse');
//look into pdf-parse
//mammoth for docs display

const {pipeline} = require("stream");
const {promisify} = require("util");

const { Document, Packer, Paragraph, HeadingLevel } = require("docx"); 
const { saveAs } =  require("file-saver");


const {S3Client, PutObjectCommand, GetObjectCommand, RestoreRequestFilterSensitiveLog} = require("@aws-sdk/client-s3");
const e = require('express');

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
async function main() {
    await db.init();
    //await parse("Frankenstein.txt", "God");
    await parse("Resume-KlossCS.docx", "AWS");
    //await generateReport(["Frankenstein.txt"], ["God", "Good"]);
    
}
main();


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
    let phraseIndex;
    const redot = /[.!?]/;
    let index;
    while(line.search(redot)!= -1 )
    {
        phraseIndex = line.search(phrase);
        index = line.search(redot);
        if(phraseIndex < index)
        {
            return line.substring(0, index+1);
        }
        line = line.substring(index+1);
    }
    return line;
}

function keyType(keyName)
{
    let type; 
    if(keyName.endsWith('.pdf'))
    {
        type = 'pdf';
    }
    else if(keyName.endsWith('.docx') || keyName.endsWith('.xlsx') || keyName.endsWith('.pptx'))
    {
        type = 'office'
    }
    else if(keyName.endsWith('.txt'))
    {
        type ='txt'
    }
    return type;
}

async function parse(keyName, phrase)
{
    try{
        let lines;
        let type = keyType(keyName);
        const data = await downloadFromS3(process.env.BUCKET_NAME, keyName);

        if(type == 'pdf')
        {
            const buffer = await data.Body.transformToByteArray();
            const parser = new PDFParse({ data: buffer });
            const textResult = await parser.getText();
            await parser.destroy();
            lines = textResult.text.split("\n");
        }
        else if(type == 'txt')
        {
            const rl = readline.createInterface({
                input: data.body,
                crlfDelay: Infinity
            })
            lines = [];
            for(const line of rl)
            {
                lines.push_back(line);
            }
        }
        else if(type =='office')
        {
            let chunks = []
            for await(const line of data.Body)
            {
                chunks.push(line);
            }
            const buffer =  Buffer.concat(chunks);
            const text = await officeParser.parseOfficeAsync(buffer);
            lines = text.split("\n");
        }
        
        console.log("Found file");
        const redot = /[.!?]/;

        let arrayMatches = new Array();
        let lineNum = 0; 
        let prevLine;
        let nextLine;
        let curLine;

        for await(const line of lines){

            if(lineNum==0)
            {
                if(line.search(phrase)!=-1)
                {
                    arrayMatches.push([1,line]);
                }
                prevLine = line;
                lineNum++;
                continue;
            }
            else if(lineNum==1)
            {
                curLine = line;
                lineNum++;
                continue;
            }
            else if(lineNum==2)
            {
                nextLine = line;
            }
            lineNum++;

            if(curLine.search(phrase)!= -1)
            {
                let phraseIndex = curLine.search(phrase);
                if(curLine.search(redot)!= -1)
                {
                    let retLine = findPeriodAndSplice(curLine, phrase);
                    if(retLine.search(redot)==-1)
                    {
                        if(nextLine.search(redot)!=-1)
                        {
                            let newNext = nextLine.substring(0, nextLine.search(redot)+1);
                            retLine = retLine + " " + newNext;
                        }
                        else{
                            retLine = retLine +" "+ nextLine;
                        }
                    }
                    
                    arrayMatches.push([lineNum-2, retLine]); 
                }
                else if (prevLine.search(redot)!= -1)
                {
                    let retLine = prevLine;
                    while(retLine.search(redot)!=-1)
                    {
                        retLine = retLine.substring(retLine.search(redot)+1);
                    }
                    retLine = retLine + " " + curLine;
                    arrayMatches.push([lineNum-2, retLine]);   
                }   
                else if(nextLine.search(redot)!=-1)
                {
                    let newNext = nextLine.substring(0, nextLine.search(redot)+1);
                    let retLine = curLine + " " + newNext;
                    arrayMatches.push([lineNum-2, retLine]);   
                }
                else
                {
                    let retLine = prevLine + " " + curLine + " " + nextLine;
                    arrayMatches.push([lineNum-2, retLine]);   
                }
            }
            prevLine = curLine;
            curLine = nextLine;
            nextLine = line;

        }
        if(nextLine.search(phrase)!=-1)
        {
            arrayMatches.push([lineNum,line]);
        }
        return arrayMatches;
        console.log(arrayMatches);
        console.log(arrayMatches.length);
    }
    catch(err){
        console.log(err);
    }
}
console.log("attempt");

 
async function generateReport(keyNames, phrases) {
    let doc = new Document({
        sections: []
    });
    
    let paragraphs = [];
    
    for(let i = 0; i < keyNames.length; i++)
    {
        let key = keyNames[i];
        let title = await db.fetchTitleByKey(key); 
        paragraphs.push(new Paragraph({
            text: title,
        }));
        
        for(let search of phrases)
        {
            let results = await parse(key, search); 
            paragraphs.push(new Paragraph({ text: "" })); 
            
            for(let j = 0; j < results.length; j++) 
            {
                paragraphs.push(new Paragraph({
                    text: results[j][0] + ": " + results[j][1]
                }));
            }
        }
    }
    doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs
        }]
    });
    //Saves to file system as report for testing
    // const buffer = await Packer.toBuffer(doc);
    // const filePath = path.join(__dirname, "report.docx");
    // fs.writeFileSync(filePath, buffer);
    // console.log("Report Printed");

    //Usage for website
    saveDocumentToFile(doc, "newDoc.docx"); 
}

async function saveDocumentToFile(doc, fileName) {
    try {
        const buffer = await Packer.toBuffer(doc);
        
        const filePath = path.join(__dirname, fileName);
        fs.writeFileSync(filePath, buffer);
        
        console.log(`Document saved to ${filePath}`);
        return filePath;
    } catch (err) {
        console.error("Error saving document:", err);
        throw err;
    }
}

function readInFile(path)
{
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent;
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

function generateKeyName(fileName, userName)
{
    return userName + "_" + fileName;
}

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


app.post('/upload', async (req, res)=>{
    try{
        const user = db.fetchUserByUsername(req.session.user);
        const {file} = req.body;
        keyName = generateKeyName(user, file);
        //let file = readInFile(filePath);
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
app.post('/generateReport', async (req, res)=> {
    let {keys, searches} = req.body;
    try{
        await generateReport(keys, searches);
        res.json({success: true});
    }catch(err){
        res.status(500).send("Generate Failed");
        throw err;
    }
});

app.post('/addDoc', async (req, res) => {
    const {key, fileName, user} = req.body;
    try {
        await db.insertDoc(key, fileName, user);
        res.json({success: true});
    } catch (err) {
        res.status(500).send("Could not add document.");
    }
});

app.get('/all', async (req, res) => {
    try {
        let rows = await db.printAllTables();
        res.json({success: true, data: rows});
    } catch (err) {
        res.status(500).send("Could not add document.");
    }
});

//**********************************************************//
//****************** Login-Related Routes ******************//
//**********************************************************//
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.insertUser(username, email, hashedPassword);
        req.session.user = username;
        res.json({success: true});
    } catch (err) {
        res.status(500).send("Username might already exist.");
    }
});
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.fetchUserByUsername(username);
    if (user && await bcrypt.compare(password, user[0].Password)) {
        req.session.user = username;
        return res.json({ success: true, user: username });
    } else {
        res.status(401).send("Invalid credentials.");
    }
});


// app.get('/', async (req, res) => { 
//     res.render('index.html', { user: req.session.user}); 
// });
app.listen(24086, () => console.log('The server is up and running...'));

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
