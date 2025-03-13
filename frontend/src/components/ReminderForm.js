import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import EventInput from './EventInput';

const ReminderForm = ({ onClose }) => {
  const [reminders, setReminders] = useState([{ id: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  const handleAddReminder = () => {
    if (reminders.length < 3) {
      setReminders([...reminders, { id: reminders.length + 1 }]);
    }
  };

  const handleRemoveReminder = (id) => {
    if (reminders.length > 1) {
      setReminders(reminders.filter(reminder => reminder.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const reminderData = [];
    
    reminders.forEach(reminder => {
      reminderData.push({
        eventName: formData.get(`eventName-${reminder.id}`),
        eventDate: formData.get(`eventDate-${reminder.id}`),
        eventType: formData.get(`eventType-${reminder.id}`),
        otherEventType: formData.get(`otherEventType-${reminder.id}`) || null,
        customerEmail: formData.get(`customerEmail-${reminder.id}`)
      });
    });
    
    try {
      const response = await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reminders: reminderData }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus({ success: true, message: 'Reminders set successfully!' });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitStatus({ success: false, message: result.message || 'Failed to set reminders.' });
      }
    } catch (error) {
      setSubmitStatus({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Set Event Reminders</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {reminders.map((reminder, index) => (
            <div key={reminder.id} className="mb-4 pb-4 border-bottom">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Reminder #{index + 1}</h5>
                {reminders.length > 1 && (
                  <Button
                    variant="link"
                    className="text-danger p-0"
                    onClick={() => handleRemoveReminder(reminder.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <EventInput id={reminder.id} />
            </div>
          ))}
          
          {reminders.length < 3 && (
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={handleAddReminder}
            >
              + Add Another Event Reminder
            </Button>
          )}
          
          {submitStatus && (
            <Alert 
              variant={submitStatus.success ? 'success' : 'danger'} 
              className="mt-3"
            >
              {submitStatus.message}
            </Alert>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Set Reminders'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReminderForm;