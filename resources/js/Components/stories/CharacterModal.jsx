import React from 'react';

const CharacterModal = ({ show, onHide, character }) => {
  if (!show || !character) return null;

  return (
    <div className="character-modal-overlay" onClick={onHide}>
      <div className="character-modal-content" onClick={e => e.stopPropagation()}>
        <div className="character-modal-header">
          <h4 className="mb-0 primary-font">{character.name}</h4>
          <button className="close-btn" onClick={onHide}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="character-modal-body">
          <p className="character-description">{character.description}</p>
        </div>
        <div className="character-modal-footer">
          <button className="btn btn-secondary" onClick={onHide}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;
