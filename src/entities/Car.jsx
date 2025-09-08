import { v4 as uuidv4 } from 'uuid';

let mockDatabase = JSON.parse(localStorage.getItem('cars') || '[]');

const saveToLocalStorage = () => {
  localStorage.setItem('cars', JSON.stringify(mockDatabase));
};

export class Car {
  static async list(orderBy = 'created_date') {
    return [...mockDatabase].sort((a, b) => {
      if (orderBy === '-created_date') {
        return new Date(b.created_date) - new Date(a.created_date);
      }
      return 0;
    });
  }

  static async create(data) {
    const newCar = {
      ...data,
      id: uuidv4(),
      created_date: new Date().toISOString()
    };
    mockDatabase.push(newCar);
    saveToLocalStorage();
    return newCar;
  }

  static async get(id) {
    return mockDatabase.find(car => car.id === id);
  }

  static async update(id, data) {
    const carIndex = mockDatabase.findIndex(car => car.id === id);
    if (carIndex === -1) {
      throw new Error("Carro não encontrado");
    }
    const updatedCar = { ...mockDatabase[carIndex], ...data };
    mockDatabase[carIndex] = updatedCar;
    saveToLocalStorage();
    return updatedCar;
  }

  static async delete(id) {
    const initialLength = mockDatabase.length;
    mockDatabase = mockDatabase.filter(car => car.id !== id);
    saveToLocalStorage();
    return mockDatabase.length < initialLength;
  }

  static async filter(query, orderBy) {
    const filtered = mockDatabase.filter(car => {
      for (const key in query) {
        if (car[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });

    if (orderBy === '-created_date') {
      return filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    return filtered;
  }
}