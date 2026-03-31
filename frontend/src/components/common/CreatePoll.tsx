import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

interface CreatePollProps {
  onAddPoll?: (pollData: {
    options: string[];
    expiresAt?: Date;
  }) => void;
}

/**
 * Create Poll Component
 * Allows users to create poll options for forum topics
 */
function CreatePoll({ onAddPoll }: CreatePollProps) {
  const [showForm, setShowForm] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '']);
  const [expiresIn, setExpiresIn] = useState<number>(7); // days

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const validOptions = options.filter(opt => opt.trim().length > 0);
    
    if (validOptions.length < 2) {
      alert('Minimal 2 pilihan diperlukan untuk poll');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    if (onAddPoll) {
      onAddPoll({
        options: validOptions,
        expiresAt,
      });
    }

    // Reset form
    setOptions(['', '']);
    setExpiresIn(7);
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors mb-4"
      >
        <FiPlus className="w-4 h-4" />
        Tambah Poll
      </button>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-6 border border-amber-200 dark:border-amber-800 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          Buat Poll
        </h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder={`Pilihan ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              maxLength={100}
              className="flex-1 px-3 py-2 bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addOption}
        className="mt-3 flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
      >
        <FiPlus className="w-4 h-4" />
        Tambah Pilihan
      </button>

      {/* Expiration Settings */}
      <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
        <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
          Berakhir dalam
        </label>
        <select
          value={expiresIn}
          onChange={(e) => setExpiresIn(Number(e.target.value))}
          className="w-full px-3 py-2 bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value={1}>1 hari</option>
          <option value={3}>3 hari</option>
          <option value={7}>7 hari</option>
          <option value={14}>14 hari</option>
          <option value={30}>30 hari</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors font-medium"
        >
          Buat Poll
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

export default CreatePoll;
