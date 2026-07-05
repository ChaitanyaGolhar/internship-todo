import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://todo-7qqo.onrender.com/api/tasks';

const emptyForm = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Pending',
  dueDate: '',
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setTasks(data.data || []);
    } catch (err) {
      setError('Could not load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!error && !success) return;
    const timer = setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.title.trim()) {
        setError('Title is required.');
        return;
      }

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setSuccess('Task updated successfully.');
      } else {
        await axios.post(API_URL, form);
        setSuccess('Task created successfully.');
      }

      resetForm();
      fetchTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSuccess('Task deleted successfully.');
      fetchTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete task.');
    }
  };

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'Completed').length;
    const pending = tasks.filter((task) => task.status === 'Pending').length;
    return { completed, pending, total: tasks.length };
  }, [tasks]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">MERN Stack MVP</p>
          <h1>Task Tracker</h1>
          <p>Plan your day, track your work, and keep momentum going.</p>
        </div>
        <Link to="/" className="ghost-btn">Refresh</Link>
      </header>

      <main className="main-grid">
        <section className="panel form-panel">
          <div className="panel-heading">
            <h2>{editingId ? 'Edit Task' : 'Add Task'}</h2>
            <p>Capture the essentials and keep your workflow moving.</p>
          </div>

          {error ? <div className="alert error">{error}</div> : null}
          {success ? <div className="alert success">{success}</div> : null}

          <form onSubmit={handleSubmit} className="task-form">
            <label>
              Title
              <input name="title" value={form.title} onChange={handleChange} placeholder="Enter task title" required />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Add a short description" />
            </label>

            <div className="row">
              <label>
                Priority
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>

              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>

            <label>
              Due Date
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
            </label>

            <div className="actions">
              <button type="submit" className="primary-btn">{editingId ? 'Save Changes' : 'Create Task'}</button>
              <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="panel-heading">
            <h2>Your Tasks</h2>
            <div className="stats">
              <span>{stats.total} total</span>
              <span>{stats.pending} pending</span>
              <span>{stats.completed} completed</span>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">No tasks yet. Add your first task to get started.</div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article key={task._id} className="task-card">
                  <div className="task-card-top">
                    <h3>{task.title}</h3>
                    <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </div>
                  <p>{task.description || 'No description provided.'}</p>
                  <div className="task-meta">
                    <span>Status: {task.status}</span>
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                  </div>
                  <div className="task-meta small">
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="task-actions">
                    <button className="secondary-btn" onClick={() => handleEdit(task)}>Edit</button>
                    <button className="danger-btn" onClick={() => handleDelete(task._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
