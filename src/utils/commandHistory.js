// Command interface
class Command {
  execute() {
    throw new Error('Execute method must be implemented');
  }

  undo() {
    throw new Error('Undo method must be implemented');
  }

  getDescription() {
    return 'Unknown command';
  }
}

// Specific command implementations
export class UpdateChartConfigCommand extends Command {
  constructor(chartConfig, oldConfig, newConfig, onUpdate) {
    super();
    this.chartConfig = chartConfig;
    this.oldConfig = { ...oldConfig };
    this.newConfig = { ...newConfig };
    this.onUpdate = onUpdate;
  }

  execute() {
    Object.assign(this.chartConfig, this.newConfig);
    this.onUpdate(this.chartConfig);
  }

  undo() {
    Object.assign(this.chartConfig, this.oldConfig);
    this.onUpdate(this.chartConfig);
  }

  getDescription() {
    return `Update chart configuration`;
  }
}

export class UpdateDataCommand extends Command {
  constructor(dataRef, oldData, newData, onUpdate) {
    super();
    this.dataRef = dataRef;
    this.oldData = oldData;
    this.newData = newData;
    this.onUpdate = onUpdate;
  }

  execute() {
    this.dataRef.current = this.newData;
    this.onUpdate(this.newData);
  }

  undo() {
    this.dataRef.current = this.oldData;
    this.onUpdate(this.oldData);
  }

  getDescription() {
    return 'Update data';
  }
}

export class FilterDataCommand extends Command {
  constructor(data, filter, onUpdate) {
    super();
    this.originalData = [...data];
    this.filter = filter;
    this.onUpdate = onUpdate;
    this.filteredData = null;
  }

  execute() {
    this.filteredData = this.originalData.filter(this.filter);
    this.onUpdate(this.filteredData);
  }

  undo() {
    this.onUpdate(this.originalData);
  }

  getDescription() {
    return 'Filter data';
  }
}

export class SortDataCommand extends Command {
  constructor(data, sortKey, sortOrder, onUpdate) {
    super();
    this.originalData = [...data];
    this.sortKey = sortKey;
    this.sortOrder = sortOrder;
    this.onUpdate = onUpdate;
    this.sortedData = null;
  }

  execute() {
    this.sortedData = [...this.originalData].sort((a, b) => {
      const aVal = a[this.sortKey];
      const bVal = b[this.sortKey];
      
      if (this.sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    this.onUpdate(this.sortedData);
  }

  undo() {
    this.onUpdate(this.originalData);
  }

  getDescription() {
    return `Sort by ${this.sortKey} (${this.sortOrder})`;
  }
}

// Command History Manager
export class CommandHistory {
  constructor(maxHistorySize = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = maxHistorySize;
    this.listeners = new Set();
  }

  execute(command) {
    // Remove any commands after current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new command
    this.history.push(command);
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
    
    // Execute the command
    command.execute();
    
    // Notify listeners
    this.notifyListeners();
  }

  undo() {
    if (!this.canUndo()) return false;
    
    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
    
    this.notifyListeners();
    return true;
  }

  redo() {
    if (!this.canRedo()) return false;
    
    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.execute();
    
    this.notifyListeners();
    return true;
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.notifyListeners();
  }

  getHistory() {
    return this.history.slice(0, this.currentIndex + 1).map((cmd, index) => ({
      index,
      description: cmd.getDescription(),
      timestamp: cmd.timestamp || new Date().toISOString()
    }));
  }

  getFutureHistory() {
    return this.history.slice(this.currentIndex + 1).map((cmd, index) => ({
      index: this.currentIndex + 1 + index,
      description: cmd.getDescription(),
      timestamp: cmd.timestamp || new Date().toISOString()
    }));
  }

  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners() {
    const state = {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      historyLength: this.history.length,
      currentIndex: this.currentIndex
    };
    
    this.listeners.forEach(listener => listener(state));
  }
}

// Create singleton instance
const commandHistory = new CommandHistory();

export default commandHistory; 