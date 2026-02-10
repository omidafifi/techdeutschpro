// desc Get goals
//route Get /api/goals
//access
const getGoals = (req, res) => {
  res.status(200).json({ message: "Get goals" });
};

// desc set goal
//route Post /api/goals
//access
const setGoals = (req, res) => {
  res.status(200).json({ message: "Set goal" });
};

// desc Update goals
//route Put /api/goals/:id
//access
const updateGoals = (req, res) => {
  res.status(200).json({ message: "Update goals" });
};

// desc Delete goals
//route Delete /api/goals/:id
//access
const deleteGoals = (req, res) => {
  res.status(200).json({ message: "Delete goals" });
};
module.exports = { getGoals, setGoals, updateGoals, deleteGoals };
 