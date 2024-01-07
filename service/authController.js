const { UserModel } = require("../models/UserModel");
const {} = require("../models/UserModel");

module.exports = {
	signup: async function (req, res) {
		try {
			const user = await UserModel.create(req.body);
			res.status(201).json({
				success: "true",
				data: {
					user: user,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: "false",
				message: "Failed to signup user",
				error: error.message,
			});
		}
	},
};
