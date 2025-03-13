import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

const EventInput = ({ id }) => {
  const [eventType, setEventType] = useState('Birthday');
  
  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>Event Name*</Form.Label>
        <Form.Control
          type="text"
          name={`eventName-${id}`}
          id={`eventName-${id}`}
          required
          placeholder="e.g., Mom's Birthday"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Event Date*</Form.Label>
        <Form.Control
          type="date"
          name={`eventDate-${id}`}
          id={`eventDate-${id}`}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Your Email*</Form.Label>
        <Form.Control
          type="email"
          name={`customerEmail-${id}`}
          id={`customerEmail-${id}`}
          required
          placeholder="your.email@example.com"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Event Type*</Form.Label>
        <Form.Select
          name={`eventType-${id}`}
          id={`eventType-${id}`}
          required
          onChange={(e) => setEventType(e.target.value)}
          value={eventType}
        >
          <option value="Birthday">Birthday</option>
          <option value="Anniversary">Anniversary</option>
          <option value="Other">Other</option>
        </Form.Select>
      </Form.Group>
      
      {eventType === 'Other' && (
        <Form.Group className="mb-3">
          <Form.Label>Please specify event type*</Form.Label>
          <Form.Control
            type="text"
            name={`otherEventType-${id}`}
            id={`otherEventType-${id}`}
            required={eventType === 'Other'}
            placeholder="e.g., Graduation, Job Interview"
          />
        </Form.Group>
      )}
    </div>
  );
};

export default EventInput;