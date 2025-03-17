const Transaction = require("../../models/transactionSchema")
const User = require("../../models/userSchema")
const Order = require("../../models/orderSchema")
const Wallet = require("../../models/walletSchema")



const loadtranactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get current page from query params, default is 1
        const limit = 10; // Number of transactions per page
        const skip = (page - 1) * limit;

        const filter = {}

        if (req.query.transactionType) filter.transactionType = req.query.transactionType
        if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod
        if (req.query.purpose) filter.purpose = req.query.purpose

        if (req.query.startDate && req.query.endDate) {
            filter.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(new Date(req.query.endDate).setHours(23, 59, 59)),
            }
        }


        if (req.query.orderId) { filter["orders.orderId"] = req.query.orderId}
        // if (req.query.status) filter.status = req.query.status

        if (req.query.userId) {
            const userQuery = req.query.userId

            if (userQuery.includes("@")) {
                const user = await User.findOne({ email: userQuery })
                if (user) {
                    filter.userId = user._id
                } else {

                    return res.render("transactions", {
                        transactions: [],
                        currentPage: 1,
                        totalPages: 0,
                        totalTransactions: 0,
                        query: req.query,
                    })
                }
            } else {

                filter.userId = userQuery
            }
        }

        const users = await User.find({})
        const totalTransactions = await Transaction.countDocuments(); // Count total transactions
        const totalPages = Math.ceil(totalTransactions / limit);

        

        const transactions = await Transaction.find(filter)
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)


        res.render("admin/transactions", {
            transactions,
            currentPage: page,
            totalPages,
            users
        });

    } catch (error) {
        console.error("Error loading transactions:", error);
        res.status(500).send("Internal Server Error");
    }
};






const getAllTransactions = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1
        const limit = 10
        const skip = (page - 1) * limit


        const filter = {}

        if (req.query.transactionType) filter.transactionType = req.query.transactionType
        if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod
        if (req.query.purpose) filter.purpose = req.query.purpose
        if (req.query.status) filter.status = req.query.status


        if (req.query.orderId) {
            filter["orders.orderId"] = req.query.orderId
        }


        if (req.query.startDate && req.query.endDate) {
            filter.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(new Date(req.query.endDate).setHours(23, 59, 59)),
            }
        }


        if (req.query.userId) {
            const userQuery = req.query.userId

            if (userQuery.includes("@")) {
                const user = await User.findOne({ email: userQuery })
                if (user) {
                    filter.userId = user._id
                } else {

                    return res.render("transactions", {
                        transactions: [],
                        currentPage: 1,
                        totalPages: 0,
                        totalTransactions: 0,
                        query: req.query,
                    })
                }
            } else {

                filter.userId = userQuery
            }
        }


        const transactions = await Transaction.find(filter)
            .populate("userId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)


        const uniqueUsers = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$userId"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    email: "$user.email",
                    _id: "$user._id"
                }
            }
        ])

        const totalTransactions = await Transaction.countDocuments(filter)
        const totalPages = Math.ceil(totalTransactions / limit)

        const processedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                if (transaction.orders && transaction.orders.length > 0) {
                    for (let i = 0; i < transaction.orders.length; i++) {
                        const orderDetails = await Order.findOne({ orderId: transaction.orders[i].orderId })
                        transaction.orders[i].orderDetails = orderDetails
                    }
                }
                return transaction
            }),
        )

        res.render("transactions", {
            transactions: processedTransactions,
            currentPage: page,
            totalPages,
            totalTransactions,
            query: req.query,
            users: uniqueUsers,  // Add users to the template data
            title: "Transaction Management",
        })
    } catch (error) {
        console.error("Error fetching transactions:", error)
        res.status(500).send("Internal Server Error")
    }
}


const transactionDetails = async (req, res) => {
    try {
      const { transactionId } = req.params
  
      const transaction = await Transaction.findOne({ transactionId }).populate("userId")
  
      if (!transaction) {
        return res.redirect("/admin/transactions")
      }
  
      let orderDetails = [];  
      if (transaction.orderIds && transaction.orderIds.length > 0) {
        for (let i = 0; i < transaction.orderIds.length; i++) {
            orderDetails = await Order.find({ orderId: { $in: transaction.orderIds.map(o => o.orderId) } })
    
        }
      }

      console.log("orderDetails:",orderDetails)
      res.render("admin/transaction-details", {
        transaction,
        orderDetails,
        title: "Transaction Details",
      })
      
    } catch (error) {
      console.error("Error fetching transaction details:", error)
      res.status(500).send("Internal Server Error")
    }
  }

const createTransaction = async (transactionData) => {
    try {
        const transaction = new Transaction(transactionData)
        await transaction.save()
        return transaction
    } catch (error) {
        console.error("Error creating transaction:", error)
        throw error
    }
}


const getTransactionStats = async (req, res) => {
    try {

        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)


        const creditTotal = await Transaction.aggregate([
            {
                $match: {
                    transactionType: "credit",
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ])

        const debitTotal = await Transaction.aggregate([
            {
                $match: {
                    transactionType: "debit",
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ])

        const purposeCounts = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: "$purpose",
                    count: { $sum: 1 },
                    amount: { $sum: "$amount" },
                },
            },
        ])

        const methodCounts = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    amount: { $sum: "$amount" },
                },
            },
        ])

        // Get daily transaction totals for chart
        const dailyTotals = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    credit: {
                        $sum: {
                            $cond: [{ $eq: ["$transactionType", "credit"] }, "$amount", 0],
                        },
                    },
                    debit: {
                        $sum: {
                            $cond: [{ $eq: ["$transactionType", "debit"] }, "$amount", 0],
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ])

        res.json({
            success: true,
            stats: {
                creditTotal: creditTotal.length > 0 ? creditTotal[0].total : 0,
                debitTotal: debitTotal.length > 0 ? debitTotal[0].total : 0,
                purposeCounts,
                methodCounts,
                dailyTotals,
            },
        })
    } catch (error) {
        console.error("Error getting transaction stats:", error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}


const createManualTransaction = async (req, res) => {
    try {
        const { userId, amount, transactionType, purpose, description } = req.body

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const transaction = await Transaction.create({
            userId,
            amount: Number.parseFloat(amount),
            transactionType,
            paymentMethod: "admin",
            paymentGateway: "admin",
            status: "completed",
            purpose,
            description,
        })

        if (purpose === "wallet_add" || purpose === "refund") {
            let wallet = await Wallet.findOne({ userId })
            if (!wallet) {
                wallet = new Wallet({ userId, balance: 0 })
            }

            if (transactionType === "credit") {
                wallet.balance += Number.parseFloat(amount)
                if (purpose === "refund") {
                    wallet.refundAmount += Number.parseFloat(amount)
                }
            } else {
                wallet.balance -= Number.parseFloat(amount)
                wallet.totalDebited += Number.parseFloat(amount)
            }

            wallet.transactions.push({
                amount: Number.parseFloat(amount),
                transactionType,
                transactionPurpose: purpose === "wallet_add" ? "add" : purpose,
                description,
            })

            transaction.walletBalanceAfter = wallet.balance
            await transaction.save()
            await wallet.save()
        }

        res.json({ success: true, message: "Transaction created successfully", transaction })
    } catch (error) {
        console.error("Error creating manual transaction:", error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// module.exports = {
//     getAllTransactions,
//     getTransactionDetails,
//     createTransaction,
//     getTransactionStats,
//     createManualTransaction,
// }

module.exports = {
    loadtranactions,
    transactionDetails
}