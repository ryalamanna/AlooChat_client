import { signal } from '@preact/signals';
import { UserInterface } from '../models/UserModel';

export const userDetails = signal<UserInterface | null>(null);
export const token = signal<string | null>(null);
