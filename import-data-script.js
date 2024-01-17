const dotenv = require("dotenv");
const fs = require("fs");
const mongoose = require("mongoose");
const { TourModel } = require("./models/Tour");

dotenv.config({ path: "./config.env" });

const DB_LOCAL = process.env.DATABASE_LOCAL;

mongoose.connect(DB_LOCAL).then(() => {
	console.log("Database connected successfully...!!!");
});

const importData = async () => {
	try {
		const jsonData = JSON.parse(fs.readFileSync(`${__dirname}/service/dev-data/data/tours-simple.json`, "utf-8"));
		await TourModel.create(jsonData);
		console.log("Import all data successfully..!!");
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

const deleteData = async () => {
	try {
		await TourModel.deleteMany();
		console.log("Delete all data successfully..!!");
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

if (process.argv[2] === "--import") {
	importData();
} else if (process.argv[2] === "--delete") {
	deleteData();
} else {
	console.log(process.argv);
	process.exit();
}
