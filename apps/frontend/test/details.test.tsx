/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server';
import TrainingDetailPage from '@/app/training/[id]/page';
import { TrainingCard } from '@/app/training/training-card';
import { TrainingResponseSchema } from '@govolley/shared-types';
import { ProfileBookings } from '@/app/profile/profile-bookings';
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('next-auth', () => ({ getServerSession: jest.fn().mockResolvedValue(null) }));
jest.mock('@/lib/auth-options', () => ({ authOptions: {} }));
jest.mock('@/components/background/global-background', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/training/[id]/booking-sidebar', () => ({ BookingSidebar: () => null }));
it('renders details with location=null using the server backend address', async () => {
  process.env.BACKEND_URL = 'http://127.0.0.1:55440';
  const fetcher = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
    id: 7, title: 'No location', description: null, date: '2026-11-01T00:00:00.000Z', startTime: '07:00', endTime: '09:00',
    targetLevel: 'BEGINNER', maxParticipants: 10, price: null, coachName: null, location: null,
    isActive: true, currentParticipants: 0, isBooked: false, createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
  })));
  try {
    const element = await TrainingDetailPage({ params: Promise.resolve({ id: '7' }) });
    expect(renderToStaticMarkup(element)).toContain('Уточняется');
    expect(fetcher).toHaveBeenCalledWith('http://127.0.0.1:55440/api/training/7', expect.objectContaining({ cache: 'no-store' }));
  } finally { fetcher.mockRestore(); }
});
it.each([null, '', '   '])('shows school day, price, description and legacy location fallback %p in card, details and profile', async (location) => {
  const saved = TrainingResponseSchema.parse({
    id: 7, title: 'School midnight', description: 'Работа над приёмом', date: '2026-10-31T18:00:00.000Z',
    startTime: '07:00', endTime: '09:00', targetLevel: 'BEGINNER', maxParticipants: 10,
    price: 500, coachName: 'Coach', location, isActive: true,
    currentParticipants: 1, isBooked: true, createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
  });
  const card = renderToStaticMarkup(<TrainingCard training={saved} onEdit={() => {}} onDelete={() => {}} />);
  expect(card).toContain('01.11.26');
  expect(card).toContain('Asia/Bangkok');
  expect(card).toContain('500 ฿');
  expect(card).toContain('Начинающий');
  expect(card).toContain('Уточняется');
  const profile = renderToStaticMarkup(<ProfileBookings bookings={[{ id: 1, status: 'CONFIRMED', kind: 'LEGACY', paymentType: 'BALANCE', cashPrice: null, paymentStatus: 'UNRECORDED', cancelledAt: null, cancellationTiming: null, createdAt: saved.createdAt, training: saved }]} />);
  expect(profile).toContain('1 ноября');
  expect(profile).toContain('Asia/Bangkok');
  expect(profile).toContain('Уточняется');
  const fetcher = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(saved)));
  try {
    const detail = renderToStaticMarkup(await TrainingDetailPage({ params: Promise.resolve({ id: '7' }) }));
    expect(detail).toContain('Уточняется');
    expect(detail).toContain('Работа над приёмом');
  } finally { fetcher.mockRestore(); }
});
it('renders a saved response in the card and SSR without creation-time limits', async () => {
  const saved = {
    id: 7, title: 'Saved '.repeat(40), description: null, date: '2026-11-01T00:00:00.000Z',
    startTime: '07:00', endTime: '09:00', targetLevel: 'BEGINNER', maxParticipants: 101,
    price: null, coachName: null, location: null, isActive: true,
    currentParticipants: 1, isBooked: true, createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
  };
  const card = renderToStaticMarkup(<TrainingCard training={TrainingResponseSchema.parse(saved)} onEdit={() => {}} onDelete={() => {}} />);
  expect(card).toContain(saved.title);
  const fetcher = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(saved)));
  try {
    const element = await TrainingDetailPage({ params: Promise.resolve({ id: '7' }) });
    expect(renderToStaticMarkup(element)).toContain(saved.title);
    fetcher.mockResolvedValue(new Response(JSON.stringify({ ...saved, location: 42 })));
    await expect(TrainingDetailPage({ params: Promise.resolve({ id: '7' }) })).rejects.toThrow();
  } finally { fetcher.mockRestore(); }
});
