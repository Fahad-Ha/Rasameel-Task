const fs = require("fs");

const data = JSON.parse(fs.readFileSync("pwldu-crd09.json", "utf-8"));

exports.getData = async (req, res, next) => {
  try {
    const requestedDate = req.params.date;

    //date validation
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(requestedDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    //for previous date
    const dateParts = requestedDate.split("-");
    const prevDateDay = dateParts[2] - 1;
    const prevDate = `${dateParts[0]}-${dateParts[1]}-${prevDateDay
      .toString()
      .padStart(2, "0")}`;

    // Filter data for requested date and previous date
    const holdingsForDate = data.filter((item) => item.Date === requestedDate);
    const holdingsForPrevDate = data.filter((item) => item.Date === prevDate);

    if (holdingsForDate.length === 0) {
      return res
        .status(404)
        .json({ error: "Data not found for the requested date" });
    }

    // sort holdings by Weights in descending order
    holdingsForDate.sort((a, b) => b.Weights - a.Weights);
    holdingsForPrevDate.sort((a, b) => b.Weights - a.Weights);

    // get top 10 holdings for selected date and previous date
    const getTopTenHoldings = (holdings) => holdings.slice(0, 10);
    const topTenHoldingsForDate = getTopTenHoldings(holdingsForDate);
    const topTenHoldingsForPrevDate = getTopTenHoldings(holdingsForPrevDate);

    // check if a holding is new to Top 10
    const holdingsWithIsNew = topTenHoldingsForDate.map((holding) => ({
      ...holding,
      IsNew: !topTenHoldingsForPrevDate.some(
        (prevHolding) => prevHolding.stockName === holding.stockName
      ),
    }));

    // check rank change for each holding
    const holdingsWithRankChange = holdingsWithIsNew.map((holding) => {
      const previousHolding = holdingsForPrevDate.find(
        (prevHolding) => prevHolding.stockName === holding.stockName
      );

      if (!previousHolding) {
        return { ...holding, RankChange: "up" };
      }

      if (previousHolding.Weights < holding.Weights) {
        return { ...holding, RankChange: "up" };
      } else if (previousHolding.Weights > holding.Weights) {
        return { ...holding, RankChange: "down" };
      } else {
        return { ...holding, RankChange: "same" };
      }
    });

    // show only the needed params
    const jsonArray = holdingsWithRankChange.map((holding) => ({
      stockName: holding.stockName,
      Weight: holding.Weights,
      IsNew: holding.IsNew,
      RankChange: holding.RankChange,
    }));

    return res.status(200).json({ holdings: jsonArray });
  } catch (error) {
    return next(error);
  }
};
