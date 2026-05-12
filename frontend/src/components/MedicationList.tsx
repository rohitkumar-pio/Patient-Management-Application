import React from 'react';
import { useFieldArray, Control, FieldErrors } from 'react-hook-form';
import './MedicationList.scss';

interface MedicationListProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  register: any;
}

export const MedicationList: React.FC<MedicationListProps> = ({
  control,
  errors,
  register,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const handleAddMedication = () => {
    append({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
  };

  const handleRemoveMedication = (index: number) => {
    // Confirmation for last medication
    if (fields.length === 1) {
      const confirmed = window.confirm(
        'This is the last medication. Are you sure you want to remove it?'
      );
      if (!confirmed) return;
    }
    remove(index);
  };

  // Check for duplicate medication names
  const getDuplicateWarning = (index: number, name: string): string | null => {
    if (!name) return null;
    
    const duplicateIndex = fields.findIndex(
      (field: any, idx: number) => 
        idx !== index && 
        field.name?.toLowerCase() === name.toLowerCase()
    );
    
    return duplicateIndex !== -1 
      ? 'Duplicate medication name detected' 
      : null;
  };

  return (
    <div className="medication-list">
      <div className="medication-list-header">
        <h3>Medications</h3>
        <button
          type="button"
          onClick={handleAddMedication}
          className="btn-add-medication"
        >
          + Add Medication
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="empty-state">
          <p>No medications added yet</p>
          <p className="empty-state-hint">
            Click "Add Medication" to add prescriptions
          </p>
        </div>
      ) : (
        <div className="medications-table-container">
          <table className="medications-table">
            <thead>
              <tr>
                <th>Name *</th>
                <th>Dosage *</th>
                <th>Frequency *</th>
                <th>Duration *</th>
                <th>Instructions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field: any, index: number) => {
                const nameValue = register(`medications.${index}.name`).ref?.current?.value || '';
                const duplicateWarning = getDuplicateWarning(index, nameValue);
                
                // Type-safe error access
                const medicationErrors = errors.medications as any;
                const fieldError = medicationErrors?.[index];
                
                return (
                  <tr key={field.id} className="medication-row">
                    <td>
                      <input
                        {...register(`medications.${index}.name`)}
                        type="text"
                        placeholder="Medication name"
                        className={
                          fieldError?.name || duplicateWarning
                            ? 'input-error'
                            : ''
                        }
                      />
                      {fieldError?.name && (
                        <span className="error-text">
                          {fieldError.name.message as string}
                        </span>
                      )}
                      {duplicateWarning && (
                        <span className="warning-text">{duplicateWarning}</span>
                      )}
                    </td>
                    <td>
                      <input
                        {...register(`medications.${index}.dosage`)}
                        type="text"
                        placeholder="e.g., 500mg"
                        className={
                          fieldError?.dosage ? 'input-error' : ''
                        }
                      />
                      {fieldError?.dosage && (
                        <span className="error-text">
                          {fieldError.dosage.message as string}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        {...register(`medications.${index}.frequency`)}
                        type="text"
                        placeholder="e.g., Twice daily"
                        className={
                          fieldError?.frequency
                            ? 'input-error'
                            : ''
                        }
                      />
                      {fieldError?.frequency && (
                        <span className="error-text">
                          {fieldError.frequency.message as string}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        {...register(`medications.${index}.duration`)}
                        type="text"
                        placeholder="e.g., 5 days"
                        className={
                          fieldError?.duration
                            ? 'input-error'
                            : ''
                        }
                      />
                      {fieldError?.duration && (
                        <span className="error-text">
                          {fieldError.duration.message as string}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        {...register(`medications.${index}.instructions`)}
                        type="text"
                        placeholder="e.g., After meals"
                        className={
                          fieldError?.instructions
                            ? 'input-error'
                            : ''
                        }
                      />
                      {fieldError?.instructions && (
                        <span className="error-text">
                          {fieldError.instructions.message as string}
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(index)}
                        className="btn-remove"
                        title="Remove medication"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {fields.length > 0 && (
        <div className="medication-count">
          {fields.length} medication{fields.length !== 1 ? 's' : ''} added
        </div>
      )}
    </div>
  );
};
