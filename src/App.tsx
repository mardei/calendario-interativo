import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface DayValue {
  [key: string]: string;
}

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayValues, setDayValues] = useState<DayValue>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('calendarValues');
    if (savedData) {
      setDayValues(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever dayValues changes
  useEffect(() => {
    localStorage.setItem('calendarValues', JSON.stringify(dayValues));
  }, [dayValues]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDayKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return `${year}-${month}-${day}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const openModal = (day: number) => {
    setSelectedDay(day);
    const dayKey = getDayKey(day);
    setInputValue(dayValues[dayKey] || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
    setInputValue('');
  };

  const saveValue = () => {
    if (selectedDay) {
      const dayKey = getDayKey(selectedDay);
      if (inputValue.trim()) {
        setDayValues(prev => ({
          ...prev,
          [dayKey]: inputValue
        }));
      } else {
        setDayValues(prev => {
          const newValues = { ...prev };
          delete newValues[dayKey];
          return newValues;
        });
      }
    }
    closeModal();
  };

  const removeValue = () => {
    if (selectedDay) {
      const dayKey = getDayKey(selectedDay);
      setDayValues(prev => {
        const newValues = { ...prev };
        delete newValues[dayKey];
        return newValues;
      });
    }
    closeModal();
  };

  const calculateMonthTotal = () => {
    const currentMonthKeys = Object.keys(dayValues).filter(key => 
      key.startsWith(`${currentDate.getFullYear()}-${currentDate.getMonth()}`)
    );
    
    return currentMonthKeys.reduce((total, key) => {
      const value = dayValues[key];
      const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
      return total + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);
  };

  const calculateYearlyTotal = () => {
    const currentYearKeys = Object.keys(dayValues).filter(key => 
      key.startsWith(`${currentDate.getFullYear()}-`)
    );
    
    return currentYearKeys.reduce((total, key) => {
      const value = dayValues[key];
      const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
      return total + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-16 flex items-center justify-center"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = getDayKey(day);
      const hasValue = dayValues[dayKey];
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div
          key={day}
          onClick={() => openModal(day)}
          className={`h-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-teal-600/20 rounded-lg relative group ${
            isToday ? 'bg-orange-500 text-white rounded-lg' : 'text-white'
          } ${hasValue ? 'bg-teal-600/30' : ''}`}
        >
          <span className={`text-base font-medium ${isToday ? 'text-white' : ''}`}>
            {day}
          </span>
          {hasValue && (
            <div className="text-sm text-cyan-200 truncate max-w-full px-1" title={hasValue}>
              {hasValue}
            </div>
          )}
          {!hasValue && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={16} className="text-white/60" />
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-teal-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Calendário {currentDate.getFullYear()}
          </h1>
          <p className="text-teal-300">Adicione valores para cada dia do mês</p>
        </div>

        {/* Calendar container */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-teal-500/30">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-teal-600/20 transition-colors text-white"
            >
              <ChevronLeft size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-orange-400">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-teal-600/20 transition-colors text-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-base font-medium text-teal-300 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {renderCalendarDays()}
          </div>

          {/* Total */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Total do Mês</h3>
            <p className="text-4xl font-bold text-orange-400">
              {calculateMonthTotal()}
            </p>
            
            <div className="border-t border-teal-500/30 pt-4">
              <h3 className="text-lg font-semibold text-white mb-2">Total do Ano {currentDate.getFullYear()}</h3>
              <p className="text-3xl font-bold text-cyan-200">
                {calculateYearlyTotal()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-teal-500/30">
            <div className="flex items-center justify-between p-6 border-b border-teal-500/20">
              <h3 className="text-xl font-semibold text-white">
                Dia {selectedDay} - {months[currentDate.getMonth()]}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-teal-600/20 rounded-lg transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-base font-medium text-orange-300 mb-3">
                Adicionar valor:
              </label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite um valor ou nota para este dia..."
                className="w-full p-4 bg-slate-700 border border-teal-500/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none text-white placeholder-gray-400"
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-teal-500/20">
              <button
                onClick={removeValue}
                className="px-6 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
              >
                Remover
              </button>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-white hover:bg-slate-700 rounded-lg transition-colors font-medium border border-slate-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveValue}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;