import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ReminderForm from './components/ReminderForm';

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="fw-bold mb-3">Event Reminder System</h1>
          <p className="text-muted mb-4">
            Never miss an important date again. Set up to three event reminders.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            Set Event Reminder
          </button>
        </div>
      </div>
      
      {showModal && (
        <ReminderForm onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default App;