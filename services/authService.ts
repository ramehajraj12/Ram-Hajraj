import type { User } from '../types';

const USERS_KEY = 'spss_talk_users';
const CURRENT_USER_KEY = 'spss_talk_current_user';

// Simulate a database with localStorage
const getUsers = (): Record<string, string> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
};

const saveUsers = (users: Record<string, string>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signUp = (email: string, password: string): User => {
    const users = getUsers();
    if (users[email]) {
        throw new Error('Përdoruesi me këtë email ekziston tashmë.');
    }
    if (password.length < 6) {
        throw new Error('Fjalëkalimi duhet të jetë të paktën 6 karaktere.');
    }
    // In a real app, hash the password!
    users[email] = password; 
    saveUsers(users);
    
    const newUser = { email };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
};

export const signIn = (email: string, password: string): User => {
    const users = getUsers();
    if (!users[email] || users[email] !== password) {
        throw new Error('Email ose fjalëkalim i pasaktë.');
    }
    const user = { email };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
};

export const signOut = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
};
