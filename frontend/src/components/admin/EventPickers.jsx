import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check } from 'lucide-react';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const EVENT_TYPES = ['Conférence', 'Hackaton', 'Sortie Détente', 'Formation', 'Autre'];

export const DatePickerModal = ({ isOpen, onClose, value, onSelect }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(value ? new Date(value) : today);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setViewDate(new Date(value));
    }
  }, [value]);

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectDate = (day) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    onSelect(date.toISOString().split('T')[0]);
    onClose();
  };

  const formatDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="custom-picker-overlay" onClick={onClose}>
      <div className="custom-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <button onClick={prevMonth} type="button"><ChevronLeft size={20} /></button>
          <span>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} type="button"><ChevronRight size={20} /></button>
        </div>
        <div className="picker-weekdays">
          {DAYS.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="picker-days">
          {Array.from({ length: firstDay }).map((_, i) => <span key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isPast = date < today && date.toDateString() !== today.toDateString();
            return (
              <button 
                key={day} 
                type="button"
                className={`day-btn ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                onClick={() => !isPast && selectDate(day)}
                disabled={isPast}
              >
                {day}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <div className="picker-footer">
            <span>{formatDisplay(selectedDate)}</span>
            <button type="button" className="confirm-btn" onClick={() => { onSelect(selectedDate.toISOString().split('T')[0]); onClose(); }}>
              <Check size={18} /> Confirmer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const TimePickerModal = ({ isOpen, onClose, value, onSelect }) => {
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h || '08');
      setMinutes(m || '00');
    }
  }, [value, isOpen]);

  if (!isOpen) return null;

  const adjustHours = (delta) => {
    let h = parseInt(hours) + delta;
    if (h < 0) h = 23;
    if (h > 23) h = 0;
    setHours(h.toString().padStart(2, '0'));
  };

  const adjustMinutes = (delta) => {
    let m = parseInt(minutes) + delta;
    if (m < 0) m = 45;
    if (m > 45) m = 0;
    setMinutes(m.toString().padStart(2, '0'));
  };

  const confirm = () => {
    onSelect(`${hours}:${minutes}`);
    onClose();
  };

  return (
    <div className="custom-picker-overlay" onClick={onClose}>
      <div className="custom-picker-modal time-picker" onClick={e => e.stopPropagation()}>
        <h3>Choisir l'heure</h3>
        <div className="time-display">
          <div className="time-column">
            <button type="button" onClick={() => adjustHours(1)}><ChevronUp size={24} /></button>
            <span className="time-value">{hours}</span>
            <button type="button" onClick={() => adjustHours(-1)}><ChevronDown size={24} /></button>
          </div>
          <span className="time-separator">:</span>
          <div className="time-column">
            <button type="button" onClick={() => adjustMinutes(15)}><ChevronUp size={24} /></button>
            <span className="time-value">{minutes}</span>
            <button type="button" onClick={() => adjustMinutes(-15)}><ChevronDown size={24} /></button>
          </div>
        </div>
        <div className="time-presets">
          <button type="button" onClick={() => { setHours('08'); setMinutes('00'); }}>08:00</button>
          <button type="button" onClick={() => { setHours('10'); setMinutes('00'); }}>10:00</button>
          <button type="button" onClick={() => { setHours('14'); setMinutes('00'); }}>14:00</button>
          <button type="button" onClick={() => { setHours('18'); setMinutes('00'); }}>18:00</button>
        </div>
        <div className="picker-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>Annuler</button>
          <button type="button" className="confirm-btn" onClick={confirm}><Check size={18} /> Valider</button>
        </div>
      </div>
    </div>
  );
};

export const CategoryPickerModal = ({ isOpen, onClose, value, onSelect, customValue, onCustomChange }) => {
  if (!isOpen) return null;

  const select = (type) => {
    onSelect(type);
    onClose();
  };

  return (
    <div className="custom-picker-overlay" onClick={onClose}>
      <div className="custom-picker-modal category-picker" onClick={e => e.stopPropagation()}>
        <h3>Choisir une catégorie</h3>
        <div className="category-list">
          {EVENT_TYPES.map(type => (
            <button 
              key={type} 
              type="button"
              className={`category-btn ${value === type ? 'selected' : ''}`}
              onClick={() => select(type)}
            >
              {type}
            </button>
          ))}
        </div>
        {value === 'Autre' && (
          <div className="custom-type-input">
            <input 
              type="text" 
              value={customValue} 
              onChange={(e) => onCustomChange(e.target.value)} 
              placeholder="Nom de la catégorie..." 
              autoFocus 
            />
          </div>
        )}
      </div>
    </div>
  );
};
