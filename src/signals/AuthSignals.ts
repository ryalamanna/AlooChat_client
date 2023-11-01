import { signal } from '@preact/signals';
import { UserInterface } from '../models/UserModel';

export const token = signal;
export const userDetails = signal<UserInterface | null>(null);
