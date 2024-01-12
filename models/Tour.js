const mongoose = require("mongoose");

const TourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "A tour must have a name"],
			unique: [true, "Tour name must be unique"],
			trim: true,
		},
		duration: { type: Number, required: [true, "A tour must have duration"] },
		maxGroupSize: {
			type: Number,
			required: [true, "A tour must have group size"],
		},
		difficulty: {
			type: String,
			required: [true, "A tour must have difficulty"],
			trim: true,
		},
		ratingAvg: { type: Number, default: 0 },
		ratingQuantity: { type: Number, default: 0 },
		price: { type: Number, default: 300 },
		summary: {
			type: String,
			trim: true,
			required: [true, "A tour must have a description"],
		},
		description: { type: String, trim: true },
		imageCover: {
			type: String,
			trim: true,
			required: [true, "A tour must have a cover image"],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		startDates: [Date],
		vipTours: { type: Boolean },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

TourSchema.virtual("durationWeeks").get(function () {
	return this.duration / 7;
});

/*DOCUMENT MIDDLEWARE: works on .save() and .create() but not on .insertMany()
 * works on document that is going to save in DB
 */
TourSchema.pre("save", function (next) {
	console.log("Hello from pre-document middleware");
	next();
});

TourSchema.post("save", function (doc, next) {
	console.log(`Hello from post-document middleware- ${doc}`);
	next();
});

/**
 * QUERY MIDDLEWARE : Executes before or after any query.
 */
TourSchema.pre(/^find/, function (next) {
	this.find({ vipTours: { $ne: true } });
	this.start = Date.now();
	next();
});

TourSchema.post(/^find/, function (doc, next) {
	console.log(`Document from find query ${doc}`);
	console.log(`query took ${Date.now() - this.start} ms`);
	next();
});

module.exports = {
	schema: TourSchema,
	TourModel: mongoose.model("Tour", TourSchema),
};
