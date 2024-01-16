const express = require("express");
const dotenv = require("dotenv");
const tourRouter = require("./Router/tourRouter");
const userRouter = require("./Router/userRouter");
const fs = require("fs");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();

dotenv.config({ path: "./config.env" });
app.use(express.json());

const port = process.env.PORT || 3000;

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

const DB_LOCAL = process.env.DATABASE_LOCAL;

mongoose.connect(DB_LOCAL).then(() => {
	console.log("Database connected successfully...!");
});

//serve static files through express
app.use(express.static(`${__dirname}/public`));
//custom middleware : middleware start with app.use(), must be have an next() as argument in callback function,
//next() function send request to next middleware.
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	let msg = `${req.requestTime} | ${req.ip}:${port}${req.url} | ${req.method}`;
	console.log(msg);
	next();
});

//logger by morgan package
var accessLogStream = fs.createWriteStream(`${__dirname}/log.txt`, {
	flags: "a",
});
app.use(morgan("common", { stream: accessLogStream }));

app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});

//#region routing without route mounting
// app.route('/api/v1/tours')
//    .get((req,res)=>tourtourData.get(req,res))
//    .post((req,res)=>tourtourData.post(req,res));
// app.route('/api/v1/tours/:id')
//    .get((req,res)=>tourData.getId(req,res))
//    .delete((req,res)=>tourData.delete(req,res))
//    .patch((req,res)=>tourData.update(req,res));
//#endregion

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
