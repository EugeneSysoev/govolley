import { z } from 'zod';
import type { CreateTrainingDto, UpdateTrainingDto } from '@govolley/shared-types';
import { api } from '@/lib/api';
import { trainingSchema } from '@/lib/contracts';
export const trainingApi = {
  getAll: (token?: string, signal?: AbortSignal) => api('/training', z.array(trainingSchema), { signal }, token),
  get: (id: number, token?: string, signal?: AbortSignal) => api(`/training/${id}`, trainingSchema, { signal }, token),
  create: (data: CreateTrainingDto, token?: string) => api('/training', trainingSchema, { method: 'POST', body: JSON.stringify(data) }, token),
  update: (id: number, data: UpdateTrainingDto, token?: string) => api(`/training/${id}`, trainingSchema, { method: 'PATCH', body: JSON.stringify(data) }, token),
  delete: (id: number, token?: string) => api(`/training/${id}`, trainingSchema, { method: 'DELETE' }, token),
  book: (id: number, token: string) => api('/training/book', trainingSchema, { method: 'POST', body: JSON.stringify({ trainingId: id }) }, token),
  unbook: (id: number, token: string) => api('/training/unbook', trainingSchema, { method: 'POST', body: JSON.stringify({ trainingId: id }) }, token),
};
