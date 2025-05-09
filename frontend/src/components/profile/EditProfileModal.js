import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCamera, 
  faTimes, 
  faUser,
  faBriefcase,
  faGraduationCap,
  faEnvelope,
  faPhone,
  faLink,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import styles from '@/styles/EditProfileModal.module.css';

const EditProfileModal = ({ isOpen, onClose, profileData }) => {
  // Predefined lists of skills and interests
  const predefinedTechSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS'];
  const predefinedSoftSkills = ['Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Time Management'];
  const predefinedInterests = ['AI', 'Web Development', 'Mobile Development', 'Data Science', 'Cybersecurity'];

  const [formData, setFormData] = useState({
    bannerImage: profileData?.bannerUrl || '',
    profileImage: profileData?.profileUrl || '',
    username: profileData?.username || '',
    fullName: profileData?.fullName || '',
    bio: profileData?.bio || '',
    work: profileData?.work || '',
    education: profileData?.education || '',
    email: profileData?.email || '',
    phone: profileData?.phone || '',
    website: profileData?.website || '',
    location: profileData?.location || '',
    techSkills: profileData?.techSkills ? profileData.techSkills.split(',') : [],
    softSkills: profileData?.softSkills ? profileData.softSkills.split(',') : [],
    interests: profileData?.interests ? profileData.interests.split(',') : [],
    isPrivate: profileData?.isPrivate || false,
  });

  const [bannerPreview, setBannerPreview] = useState(profileData?.bannerUrl || '');
  const [profilePreview, setProfilePreview] = useState(profileData?.profileUrl || '');

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'banner') {
          setBannerPreview(reader.result);
          setFormData(prev => ({ ...prev, bannerImage: file }));
        } else {
          setProfilePreview(reader.result);
          setFormData(prev => ({ ...prev, profileImage: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillSelect = (type, value) => {
    if (!formData[type].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value],
      }));
    }
  };

  const handleRemoveSkill = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      techSkills: formData.techSkills.join(','),
      softSkills: formData.softSkills.join(','),
      interests: formData.interests.join(','),
    };
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Edit Profile</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Banner Image */}
          <div className={styles.imageSection}>
            <div className={styles.bannerUpload}>
              <img 
                src={bannerPreview || '/banner3.jpg'} 
                alt="Banner" 
                className={styles.bannerPreview} 
              />
              <label className={styles.imageUploadLabel}>
                <FontAwesomeIcon icon={faCamera} />
                <span>Change Banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'banner')}
                  hidden
                />
              </label>
            </div>

            {/* Profile Image */}
            <div className={styles.profileImageUpload}>
              <img 
                src={profilePreview || '/avatar.png'} 
                alt="Profile" 
                className={styles.profilePreview} 
              />
              <label className={styles.profileImageLabel}>
                <FontAwesomeIcon icon={faCamera} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'profile')}
                  hidden
                />
              </label>
            </div>
          </div>

          <div className={styles.formFields}>
            {/* Basic Info */}
            <div className={styles.fieldGroup}>
              <h3>Basic Information</h3>
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faUser} />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                />
              </div>
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faUser} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <h3>Profile Privacy</h3>
              <div className={styles.field}>
                <div className={styles.privacyToggle}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      name="isPrivate"
                      checked={formData.isPrivate}
                      onChange={(e) => handleInputChange({
                        target: {
                          name: 'isPrivate',
                          value: e.target.checked
                        }
                      })}
                    />
                    <span className={styles.toggleText}>
                      {formData.isPrivate ? 'Private Profile' : 'Public Profile'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className={styles.fieldGroup}>
              <h3>About</h3>
              <div className={styles.field}>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Write something about yourself..."
                  rows="4"
                />
              </div>
            </div>

            {/* Work & Education */}
            <div className={styles.fieldGroup}>
              <h3>Work & Education</h3>
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faBriefcase} />
                  Work
                </label>
                <input
                  type="text"
                  name="work"
                  value={formData.work}
                  onChange={handleInputChange}
                  placeholder="Current work"
                />
              </div>
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faGraduationCap} />
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="Education"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className={styles.fieldGroup}>
              <h3>Contact Information</h3>
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faEnvelope} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </div>
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faPhone} />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                />
              </div>
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faLink} />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Website"
                />
              </div>
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faLocationDot} />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                />
              </div>
            </div>
          
            {/* Skills & Expertise */}
            <div className={styles.fieldGroup}>
              <h3>Skills & Expertise</h3>
              {/* Technical Skills */}
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faBriefcase} />
                  Technical Skills
                </label>
                <select
                  onChange={(e) => handleSkillSelect('techSkills', e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select a technical skill</option>
                  {predefinedTechSkills.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
                <div className={styles.tags}>
                  {formData.techSkills.map((skill, index) => (
                    <span key={index} className={styles.tag}>
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill('techSkills', skill)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faBriefcase} />
                  Soft Skills
                </label>
                <select
                  onChange={(e) => handleSkillSelect('softSkills', e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select a soft skill</option>
                  {predefinedSoftSkills.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
                <div className={styles.tags}>
                  {formData.softSkills.map((skill, index) => (
                    <span key={index} className={styles.tag}>
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill('softSkills', skill)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faBriefcase} />
                  Interests
                </label>
                <select
                  onChange={(e) => handleSkillSelect('interests', e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select an interest</option>
                  {predefinedInterests.map((interest, index) => (
                    <option key={index} value={interest}>{interest}</option>
                  ))}
                </select>
                <div className={styles.tags}>
                  {formData.interests.map((interest, index) => (
                    <span key={index} className={styles.tag}>
                      {interest}
                      <button type="button" onClick={() => handleRemoveSkill('interests', interest)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>  
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;