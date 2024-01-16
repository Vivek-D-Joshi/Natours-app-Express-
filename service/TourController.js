const fs = require('fs');
const { TourModel } = require('../models/Tour');
const ApiFeatures = require('./ApiFeatures');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`)
);

exports.checkID = (_, res, next, value) => {
  let tour = TourModel.findById(value);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  next();
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAvg,price';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const data = new ApiFeatures(TourModel.find(), req.query)
      .filter()
      .sorting()
      .projection()
      .pagination();
    const tours = await data.query;
    res.status(200).json({
      status: 'Success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: `Error occured during getting data`,
      error: `${error.message}`,
    });
  }
};
//aggregate pipeline
exports.getTourStats = async (req, res) => {
  try {
    const stats = await TourModel.aggregate([
      { $match: { ratingAvg: { $gte: 0 } } },
      {
        $group: {
          _id: "$difficulty",
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAvg' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {avgPrice: 1}
      }
    ]);
    res.status(200).json({
      status: 'Success',
      results: stats.length,
      data: {
        tours_stats: stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: `Error occured during getting data`,
      error: `${error.message}`,
    });
  }
};

exports.getMonthlyPlan = async (req,res) => {
  try {
    const year = req.params.year;
    const plan = await TourModel.aggregate([
      {
        $unwind: "$startDates"
      },
      {
        $match: { 
          startDates: { 
            $gte: new Date(`${year}-01-01`), 
            $lte: new Date(`${year}-12-31`) 
          } 
        }
      },
      {
        $group:{
          _id:{$month: "$startDates"},
          numTours: {$sum:1},
          Tours: { $push: "$name"}
        }
      },
      {
        $addFields: {month: "$_id"}
      },
      {
        $project: { _id: 0 }
      },
      {
        $sort: { numTours: -1 }
      }
    ])
    
    res.status(200).json({
      status: 'Success',
      result: plan.length,
      data: {
        plan: plan,
      },
    });
  } catch(error) {
    res.status(500).json({
      status: 'Failed',
      message: `Error occured during getting data`,
      error: `${error.message}`,
    });
  }
}

exports.getToursById = async (req, res) => {
  try {
    let tour = await TourModel.findById(req.params.id);
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: `Error occured during getting data`,
      error: `${error.message}`,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await TourModel.create(req.body);
    saveDataInJson(req);
    res.status(201).json({
      status: 'Success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: `Error occured during creating entry`,
      error: `${error.message}`,
    });
  }
};

function saveDataInJson(req) {
  const newId = tours[tours.length - 1]._id + 1;
  const newTour = Object.assign({ _id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        res.status(500).json({
          status: 'Fail',
          message: `Failed to create data due to error.\nError: ${err}`,
        });
      }
    }
  );
}

exports.deleteTour = async (req, res) => {
  try {
    let tour = await TourModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'Success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: `Error occured during updating an entry`,
      error: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    let tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'Success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: `Error occured during updating an entry`,
      error: `${error.message}`,
    });
  }
};

function updateJsonFile(req) {
  let tour = tours.find((el) => el?._id === req.params.id);
  const index = tours.indexOf(tour);
  delete tours[index];
  const data = tours.filter((x) => x !== null);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours.json`,
    JSON.stringify(data),
    (err) => {
      if (err) {
        res.status(500).json({
          status: 'Fail',
          message: 'Could not delete data. \nError: ${err}',
        });
      } else {
        res.send({
          status: 'Success',
          data: {
            tour,
          },
        });
      }
    }
  );
}
