import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import ClientLayout from '@/components/client-layout';
import { BookingButton } from '@/app/training/router-button';
import { BookingSidebar } from '@/app/training/[id]/booking-sidebar';
import { ProfileBookings } from '@/app/profile/profile-bookings';
import { trainingApi } from '@/app/training/api';
import type { Training } from '@govolley/shared-types';

let mockPath = '/';
let mockLevel = 'BEGINNER';
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ usePathname: () => mockPath, useRouter: () => ({ replace: mockReplace, push: mockPush }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: '1', skillLevel: mockLevel }, accessToken: 'test-token' }, status: 'authenticated' }) }));
jest.mock('@/providers/auth-provider', () => ({ NextAuthProvider: ({ children }: { children: ReactNode }) => children }));
jest.mock('@/components/intro-sequence', () => ({ __esModule: true, default: () => <div data-testid="intro">Intro</div> }));
jest.mock('@/components/background/global-background', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/navbar/navbar', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/footer', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/training/api', () => ({ trainingApi: { get: jest.fn(), book: jest.fn(), unbook: jest.fn() } }));
const training: Training = { id: 7, title: 'Full group', date: '2026-11-01T00:00:00.000Z', startTime: '07:00', endTime: '09:00',
  description: null, targetLevel: 'BEGINNER', maxParticipants: 1, currentParticipants: 1, isBooked: true, bookingId: 17,
  price: 500, location: null, coachName: null, isActive: true, createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z' };

beforeEach(() => { jest.clearAllMocks(); sessionStorage.clear(); mockPath = '/'; mockLevel = 'BEGINNER'; });
it('makes another route visible when leaving an unfinished home intro', async () => {
  const view = render(<ClientLayout><h1>Page</h1></ClientLayout>);
  expect(await screen.findByTestId('intro')).toBeInTheDocument();
  mockPath = '/training';
  view.rerender(<ClientLayout><h1>Onboarding</h1></ClientLayout>);
  await waitFor(() => expect(screen.queryByTestId('intro')).not.toBeInTheDocument());
  expect(screen.getByText('Onboarding').closest('div.relative.min-h-dvh')).toHaveClass('visible');
  expect(document.body.style.overflow).toBe('');
});
it('shows onboarding after NOT_SET redirects from home', async () => {
  mockLevel = 'NOT_SET';
  const view = render(<ClientLayout><h1>Home</h1></ClientLayout>);
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/onboarding'));
  mockPath = '/onboarding';
  view.rerender(<ClientLayout><h1>Questionnaire</h1></ClientLayout>);
  expect(await screen.findByText('Questionnaire')).toBeInTheDocument();
  expect(screen.getByText('Questionnaire').closest('div.relative.min-h-dvh')).toHaveClass('visible');
});
it('keeps a direct non-home entry visible', () => {
  mockPath = '/profile';
  render(<ClientLayout><h1>Profile</h1></ClientLayout>);
  expect(screen.getByText('Profile').closest('div.relative.min-h-dvh')).toHaveClass('visible');
});
it('shows the home intro again on reload and cleans the body lock on unmount', async () => {
  sessionStorage.setItem('hasSeenIntro', 'true');
  const original = Object.getOwnPropertyDescriptor(performance, 'getEntriesByType');
  Object.defineProperty(performance, 'getEntriesByType', { configurable: true, value: () => [{ type: 'reload' }] });
  try {
    const view = render(<ClientLayout><h1>Home reload</h1></ClientLayout>);
    expect(await screen.findByTestId('intro')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    view.unmount();
    expect(document.body.style.overflow).toBe('');
  } finally {
    if (original) Object.defineProperty(performance, 'getEntriesByType', original);
    else Reflect.deleteProperty(performance, 'getEntriesByType');
  }
});
it('allows navigation to a full group', () => {
  render(<BookingButton trainingId={7} isFull />);
  fireEvent.click(screen.getByRole('button', { name: /Посмотреть детали/ }));
  expect(mockPush).toHaveBeenCalledWith('/training/7');
});
it('lets an enrolled user cancel a full group with no location', async () => {
  jest.mocked(trainingApi.get).mockResolvedValue(training);
  jest.mocked(trainingApi.unbook).mockResolvedValue({ ...training, isBooked: false, currentParticipants: 0 });
  render(<BookingSidebar training={training} />);
  fireEvent.click(screen.getByRole('button', { name: /Отменить запись/ }));
  await waitFor(() => expect(trainingApi.unbook).toHaveBeenCalledWith(7, 'test-token', 17));
  expect(screen.getByText('Уточняется')).toBeInTheDocument();
});
it('links My trainings to details and cancellation', () => {
  render(<ProfileBookings bookings={[{ id: 1, status: 'CONFIRMED', kind: 'LEGACY', paymentType: 'BALANCE', cashPrice: null, paymentStatus: 'UNRECORDED', cancelledAt: null, cancellationTiming: null, createdAt: training.createdAt, training }]} />);
  expect(screen.getByRole('link', { name: /Детали и отмена/ })).toHaveAttribute('href', '/training/7');
});
it('shows cash terms before confirmation and keeps late cancellation free of debt', async () => {
  jest.mocked(trainingApi.get).mockResolvedValue(training);
  render(<><BookingSidebar training={{ ...training, isBooked: false, currentParticipants: 0 }} />
    <ProfileBookings bookings={[{ id: 2, status: 'CANCELLED', kind: 'SINGLE_CASH', paymentType: 'CASH', cashPrice: 500, paymentStatus: 'UNPAID', cancelledAt: '2026-10-31T23:00:00.000Z', cancellationTiming: 'LATE', createdAt: training.createdAt, training }]} /></>);
  expect(await screen.findByText('500 ฿ на месте. Оплата при посещении.')).toBeInTheDocument();
  expect(screen.getByText('Поздняя отмена · без долга и штрафа')).toBeInTheDocument();
});
