import React from 'react';
import './VitalsInput.scss';

interface VitalsInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type: 'temperature' | 'bloodPressure' | 'pulse';
  label: string;
  placeholder?: string;
}

// Define normal ranges
const RANGES = {
  temperature: {
    normal: { min: 36.1, max: 37.2 },
    warning: { min: 35, max: 38.5 },
    label: '36.1-37.2°C'
  },
  bloodPressure: {
    systolic: {
      normal: { min: 90, max: 120 },
      warning: { min: 80, max: 140 },
      label: '90-120'
    },
    diastolic: {
      normal: { min: 60, max: 80 },
      warning: { min: 40, max: 90 },
      label: '60-80'
    }
  },
  pulse: {
    normal: { min: 60, max: 100 },
    warning: { min: 40, max: 120 },
    label: '60-100 bpm'
  }
};

/**
 * Determine the status color based on value and ranges
 */
const getStatusColor = (value: string, type: VitalsInputProps['type']): 'normal' | 'warning' | 'danger' => {
  if (!value || value === '') return 'normal';
  
  if (type === 'temperature') {
    const temp = parseFloat(value);
    if (isNaN(temp)) return 'normal';
    
    const { normal, warning } = RANGES.temperature;
    
    if (temp >= normal.min && temp <= normal.max) return 'normal';
    if (temp >= warning.min && temp <= warning.max) return 'warning';
    return 'danger';
  }
  
  if (type === 'bloodPressure') {
    // Format: "120/80"
    const parts = value.split('/');
    if (parts.length !== 2) return 'normal';
    
    const systolic = parseInt(parts[0], 10);
    const diastolic = parseInt(parts[1], 10);
    
    if (isNaN(systolic) || isNaN(diastolic)) return 'normal';
    
    const { systolic: sysRange, diastolic: diasRange } = RANGES.bloodPressure;
    
    const sysNormal = systolic >= sysRange.normal.min && systolic <= sysRange.normal.max;
    const diasNormal = diastolic >= diasRange.normal.min && diastolic <= diasRange.normal.max;
    
    if (sysNormal && diasNormal) return 'normal';
    
    const sysWarning = systolic >= sysRange.warning.min && systolic <= sysRange.warning.max;
    const diasWarning = diastolic >= diasRange.warning.min && diastolic <= diasRange.warning.max;
    
    if (sysWarning && diasWarning) return 'warning';
    return 'danger';
  }
  
  if (type === 'pulse') {
    const pulseValue = parseInt(value, 10);
    if (isNaN(pulseValue)) return 'normal';
    
    const { normal, warning } = RANGES.pulse;
    
    if (pulseValue >= normal.min && pulseValue <= normal.max) return 'normal';
    if (pulseValue >= warning.min && pulseValue <= warning.max) return 'warning';
    return 'danger';
  }
  
  return 'normal';
};

/**
 * Get tooltip text based on vital type
 */
const getTooltip = (type: VitalsInputProps['type']): string => {
  if (type === 'temperature') {
    return `Normal range: ${RANGES.temperature.label}`;
  }
  if (type === 'bloodPressure') {
    return `Normal range: ${RANGES.bloodPressure.systolic.label}/${RANGES.bloodPressure.diastolic.label} mmHg`;
  }
  if (type === 'pulse') {
    return `Normal range: ${RANGES.pulse.label}`;
  }
  return '';
};

export const VitalsInput: React.FC<VitalsInputProps> = ({
  name,
  value,
  onChange,
  error,
  type,
  label,
  placeholder
}) => {
  const statusColor = getStatusColor(value, type);
  const tooltip = getTooltip(type);
  
  return (
    <div className="vitals-input">
      <label htmlFor={name} className="vitals-input__label">
        {label}
        <span className="vitals-input__hint" title={tooltip}>
          {type === 'temperature' && `(${RANGES.temperature.label})`}
          {type === 'bloodPressure' && `(${RANGES.bloodPressure.systolic.label}/${RANGES.bloodPressure.diastolic.label})`}
          {type === 'pulse' && `(${RANGES.pulse.label})`}
        </span>
      </label>
      
      <div className={`vitals-input__container vitals-input__container--${statusColor}`}>
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`vitals-input__field vitals-input__field--${statusColor}`}
          title={tooltip}
        />
        
        {type === 'temperature' && (
          <span className="vitals-input__unit">°C</span>
        )}
        
        {type === 'bloodPressure' && (
          <span className="vitals-input__unit">mmHg</span>
        )}
        
        {type === 'pulse' && (
          <span className="vitals-input__unit">BPM</span>
        )}
        
        <div className={`vitals-input__indicator vitals-input__indicator--${statusColor}`} title={tooltip}>
          {statusColor === 'normal' && '✓'}
          {statusColor === 'warning' && '⚠'}
          {statusColor === 'danger' && '!'}
        </div>
      </div>
      
      {error && <span className="vitals-input__error">{error}</span>}
    </div>
  );
};

export default VitalsInput;
