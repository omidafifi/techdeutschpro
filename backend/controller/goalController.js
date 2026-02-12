// desc Get goals
//route Get /api/goals
//access private
const getGoals = (req, res) => {
  res.status(200).json({ message: "Get goals" });
};

// desc set goal
//route Post /api/goals
//access private
const setGoals = (req, res) => {
  if (!req.body) {
    res.status(400).json({ message: "please add a text field" });
  }
  res.status(200).json({ message: "Set goal" });
};

// desc Update goals
//route Put /api/goals/:id
//access private
const updateGoals = (req, res) => {
  res.status(200).json({ message: "Update goals" });
};

// desc Delete goals
//route Delete /api/goals/:id
//access private
const deleteGoals = (req, res) => {
  res.status(200).json({ message: "Delete goals" });
};
module.exports = { getGoals, setGoals, updateGoals, deleteGoals };
