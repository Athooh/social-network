"use client";

import { useState } from 'react';
import styles from '@/styles/CreateEventModal.module.css';

const CreateEventModal = ({ isOpen, onClose, onSubmit }) => {
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    privacy: 'public',
    banner: null,
  });

  const [bannerPreview, setBannerPreview] = useState(null);
  
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'banner') {
          setBannerPreview(reader.result);
          setEventData(prev => ({ ...prev, banner: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!eventData.name || !eventData.date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        await onSubmit(eventData);
        onClose();
        setEventData({
            name: '',
            description: '',
            date: '',
            privacy: 'public',
            banner: null,
        });
        setBannerPreview(null);
    } catch (error) {
        console.error('Error submitting event:', error);
        showToast(error.message || 'Error creating event', 'error');
    }
};

  // Add validation to the date input
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const now = new Date();
    
    if (selectedDate < now) {
        showToast('Event date cannot be in the past', 'error');
        return;
    }
    
    setEventData(prev => ({ ...prev, date: e.target.value }));
};

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Create New Event</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Banner Upload */}
          <div className={styles.imageUpload}>
            <div 
              className={`${styles.bannerUpload} ${bannerPreview ? styles.hasImage : ''}`}
              style={bannerPreview ? { backgroundImage: `url(${bannerPreview})` } : {}}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'banner')}
                id="banner-upload"
              />
              <label htmlFor="banner-upload">
                <i className="fas fa-camera"></i>
                <span>Add Cover Photo</span>
              </label>
            </div>

            </div>

          <div className={styles.formFields}>
            <div className={styles.inputGroup}>
              <label htmlFor="event-name">Event Name</label>
              <input
                type="text"
                id="event-name"
                value={eventData.name}
                onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter event name"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="event-date">Event Date</label>
              <input
                type="datetime-local"
                id="event-date"
                value={eventData.date}
                onChange={handleDateChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What's your event about?"
                rows="3"
              />
            </div>

            <div className={styles.inputEvent}>
              <label>Privacy</label>
              <div className={styles.privacyOptions}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={eventData.privacy === 'public'}
                    onChange={(e) => setEventData(prev => ({ ...prev, privacy: e.target.value }))}
                  />
                  <i className="fas fa-globe"></i>
                  <div>
                    <span>Public</span>
                    <small>Anyone can see who's attending the event and what they post.</small>
                  </div>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={eventData.privacy === 'private'}
                    onChange={(e) => setEventData(prev => ({ ...prev, privacy: e.target.value }))}
                  />
                  <i className="fas fa-lock"></i>
                  <div>
                    <span>Private</span>
                    <small>Only members can see who's attending the event and what they post.</small>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.createBtn}>
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;