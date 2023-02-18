const express = require("express");
const router = express.Router();
const { connection } = require('../src/connector')

router.get("/totalRecovered", async (req, res) => {
    try {

        const data = await connection.aggregate([
            {
                $group: {
                    _id: null,
                    recovered: { $sum: "$recovered" },
                    id: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    recovered: 1,
                    id: 1
                }
            }
        ]);
        return res.status(200).json({
            data
        })
    } catch (e) {
        return res.status(400).json({
            message: e.message
        })
    }
})
router.get("/totalActive", async (req, res) => {
    try {
        const result = await connection.aggregate([
            {
                $group: {
                    _id: null,
                    active: { $sum: "$infected" },
                    id: { $sum: 1 }
                }
            }
        ])
        return res.status(200).json({
            id: result[0].id,
            active: result[0].active
        })
    } catch (e) {
        return res.status(400).json({
            message: e.message
        })
    }
})



router.get("/hotspotStates", async (req, res) => {
    try {
        const result = await connection.aggregate([
            {
                $project: {
                    state: 1,
                    rate: {
                        $round: [{ $divide: [{ $subtract: ["$infected", "$recovered"] }, "$infected"] }, 5]
                    }
                }
            },
            { $match: { rate: { $gt: 0.1 } } },
            { $project: { _id: 0, state: 1, rate: 1 } }
        ]);

        // console.log(result)
        return res.status(200).json({
            data: result
        })
    } catch (e) {
        return res.status(400).json({
            message: e.message
        })
    }
})


router.get("/totalDeath", async (req, res) => {
    try {
        const totalDeath = await connection.aggregate([
            {
                $group: {
                    _id: null,
                    death: { $sum: "$death" },
                    id: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    death: 1,
                    id: 1
                }
            }
        ])
        return res.status(200).json({
            data: totalDeath,
        })
    } catch (e) {
        return res.status(400).json({
            message: e.message
        })
    }
})


router.get("/healthyStates", async (req, res) => {
    try {
        const healthyStates = await connection.aggregate([
            {
                $project: {
                    mortality: {
                        $round: [{ $divide: ["$death", "$infected"] }, 5]
                    },
                    state: 1,
                    _id: 0
                }
            }
        ])
        return res.status(200).json({
            data: healthyStates
        })
    } catch (e) {
        return res.status(400).json({
            message: e.message
        })
    }
})



module.exports = router;









        // let ratevalue = 0;
        // let result = []
        // const hotspotStates = await connection.find()
        // await hotspotStates.forEach(element => {
        //     ratevalue = (element.infected - element.recovered) / element.infected;
        //     if (ratevalue > 0.1) {
        //         const newResult = {
        //             state: element.state,
        //             rate: { $round: [ratevalue, 5] }

        //         };
        //         result.push({ ...newResult })
        //     }
        // });