import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editTask, setEditTask] = useState('');
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState('');
  const [filteredCompleted, setFilteredCompleted] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const storedTags = JSON.parse(localStorage.getItem('tags')) || [];
    const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];

    setTasks(storedTasks);
    setTags(storedTags);
    setCategories(storedCategories);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('tags', JSON.stringify(tags));
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [tasks, tags, categories]);

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { text: newTask, tag: selectedCategory || '', completed: false }]);
      setNewTask('');
      setSelectedCategory('');
    }
  };

  const removeTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const editTaskHandler = (index) => {
    setEditIndex(index);
    setEditTask(tasks[index].text);
  };

  const updateTask = () => {
    if (editTask.trim() !== '') {
      const newTasks = [...tasks];
      newTasks[editIndex] = { text: editTask, tag: tasks[editIndex].tag, completed: tasks[editIndex].completed };
      setTasks(newTasks);
      setEditIndex(null);
      setEditTask('');
    }
  };

  const addTag = (index, tag) => {
    const newTasks = [...tasks];
    newTasks[index].tag = tag;
    setTasks(newTasks);

    if (tag.trim() !== '' && !tags.includes(tag.trim()) && categories.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
  };

  const toggleCompleted = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (filteredCategory) {
      filtered = filtered.filter((task) => task.tag === filteredCategory);
    }

    if (filteredCompleted) {
      filtered = filtered.filter((task) => task.completed);
    }

    return filtered;
  };

  const confirmCategory = () => {
    if (newCategory.trim() !== '' && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        newTask,
        editIndex,
        editTask,
        tags,
        categories,
        filteredCategory,
        filteredCompleted,
        newCategory,
        selectedCategory,
        setNewTask,
        addTask,
        removeTask,
        editTaskHandler,
        updateTask,
        addTag,
        toggleCompleted,
        setFilteredCategory,
        setFilteredCompleted,
        filterTasks,
        setNewCategory,
        confirmCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  return useContext(AppContext);
};

const TaskList = () => {
  const {
    tasks,
    newTask,
    editIndex,
    editTask,
    setNewTask,
    addTask,
    removeTask,
    editTaskHandler,
    updateTask,
    addTag,
    toggleCompleted,
    setFilteredCategory,
    setFilteredCompleted,
    filterTasks,
    filteredCategory,
    filteredCompleted,
    categories,
    tags,
    newCategory,
    setNewCategory,
    confirmCategory,
    selectedCategory,
    setSelectedCategory,
  } = useAppContext();

  const isCategoryEditable = (index) => {
    return index !== editIndex && !categories.includes(tasks[index]?.tag);
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="" disabled>
            Select Category
          </option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button onClick={addTask}>Add Task</button>
      </div>
      <div>
        <label>Filter by Category:</label>
        <select
          value={filteredCategory}
          onChange={(e) => setFilteredCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Filter by Completed:</label>
        <input
          type="checkbox"
          checked={filteredCompleted}
          onChange={() => setFilteredCompleted(!filteredCompleted)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Add category..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={confirmCategory}>Add Category</button>
      </div>
      <ul>
        {filterTasks().map((task, index) => (
          <li key={index}>
            {index === editIndex ? (
              <>
                <input
                  type="text"
                  value={editTask}
                  onChange={(e) => setEditTask(e.target.value)}
                />
                <select
                  value={tasks[index]?.tag}
                  onChange={(e) => addTag(index, e.target.value)}
                  disabled={isCategoryEditable(index)}
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button onClick={updateTask}>Update</button>
              </>
            ) : (
              <>
                {task.text} {task.tag && <span>({task.tag})</span>}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleCompleted(index)}
                />
                <button onClick={() => editTaskHandler(index)}>Edit</button>
                <button onClick={() => removeTask(index)}>Remove</button>
                <select
                  value={tasks[index]?.tag}
                  onChange={(e) => addTag(index, e.target.value)}
                  disabled={isCategoryEditable(index)}
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <TaskList />
    </AppProvider>
  );
};

export default App;
