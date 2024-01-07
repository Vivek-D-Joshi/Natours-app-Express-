const express = require("express");
const TourController = require("../service/TourController");

const router = express.Router();

router.param("id", TourController.checkID);

router.route("/top-5-options").get(TourController.aliasTopTours, TourController.getAllTours);

router.route("/monthly-plan/:year").get(TourController.getMonthlyPlan);

router.route("/tour-stats").get(TourController.getTourStats);

router.route("/").get(TourController.getAllTours).post(TourController.createTour);

router
	.route("/:id")
	.get(TourController.getToursById)
	.delete(TourController.deleteTour)
	.patch(TourController.updateTour);

module.exports = router;
